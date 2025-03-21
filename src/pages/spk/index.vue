<script setup>
import { formatDateMySql, formatRibuan } from "@/@core/utils/formatters"
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"
import * as XLSX from 'xlsx'
import { useSpkStore } from "./useSpkStore"

const spkStore = useSpkStore()
const spk = ref(null)
const totalSpk = ref(0)
const perPage = ref(10)
const currentPage = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const route = useRoute()
const selectedStatus = ref()
const spkId = route.params.id
const showLoading = ref(false)

const fetchSpk = async (page, perPage, find, status, from, to) => {
  showLoading.value = true
  try {
    const fromDateString = formatDateMySql(from)
    const toDateString = formatDateMySql(to)

    showLoading.value = true

    const params = {
      page: page,
      perPage: perPage,
      find: find,
      from: fromDateString,
      to: toDateString,
    }

    if (status !== null) {
      params.status = status
    }

    const ret = await axiosIns.get('/production/workorders', {
      
      params: params,
    })

    spk.value = ret.data.data
    spkStore.spk = ret.data.data
    totalSpk.value = ret.data.meta.total
    last.value = ret.data.meta.last
    showLoading.value = false
  } catch(error) {
    showLoading.value = false
    console.log(error)
  }
}

watchEffect(() => {
  fetchSpk(
    currentPage.value,
    perPage.value,
    spkStore.find,
    selectedStatus.value,
    spkStore.from,
    spkStore.to,
  )
})

const fromDate = ref(spkStore.from)
const toDate = ref(new Date())

const refreshButton = () => {
  currentPage.value = 1
  perPage.value = 10
  find.value = ''
  findText.value = ''
  spkStore.find = ''
  spkStore.from = formatDateMySql(fromDate.value)
  spkStore.to = formatDateMySql(toDate.value)
  selectedStatus.value = null
  fetchSpk(currentPage.value, perPage.value, spkStore.find, selectedStatus.value, spkStore.from, spkStore.to)
}

const findSpk = async () => {
  currentPage.value = 1
  perPage.value = 10

  // find.value = findText.value
  spkStore.find = findText.value
}

const deleteData = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/production/workorders/${id}` )

    fetchSpk(currentPage.value, perPage.value, spkStore.find, selectedStatus.value, spkStore.from, spkStore.to)
  } catch (error) {
    Swal.fire({
      title: 'SPK',
      text: 'Error deleting data',
      icon: 'error',
    })
    console.log(error)
    showLoading.value = false
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

const paginationData = computed(()=>{
  const firstIndex = currentPage.value == 1 ? 1 : perPage.value * currentPage.value + 1
  const lastIndex = currentPage.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalSpk.value}`
})

const processSpk = async id => {
  try {
    const ret = await axiosIns.patch(`production/workorders/process/${id}`, null )

    fetchSpk(currentPage.value, perPage.value, spkStore.find, selectedStatus.value, spkStore.from, spkStore.to)
  } catch(error) {
    console.log(error)
  }
}

const confirmOnProcessHandler = spkId => {
  const data = spk.value.find(w => w.id === spkId)
  if (data && data.status === 0) {
    Swal.fire({
      title: "Are you sure?",
      text: "This will process data",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "warning",
      confirmButtonText: "Yes, Posted it!",
    }).then(result => {
      if (result.isConfirmed) {
        processSpk(spkId)
      }
    })
  }
}

const closedSpk = async id => {
  try {
    const ret = await axiosIns.patch(`production/workorders/close/${id}`, null )

    fetchSpk(currentPage.value, perPage.value, spkStore.find, selectedStatus.value, spkStore.from, spkStore.to)
  } catch(error) {
    console.log(error)
  }
}

const confirmClosedHandler = spkId => {
  const data = spk.value.find(w => w.id === spkId)
  if (data && data.status === 2) {
    Swal.fire({
      title: "Are you sure?",
      text: "This will process data",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "warning",
      confirmButtonText: "Yes, Closed it!",
    }).then(result => {
      if (result.isConfirmed) {
        closedSpk(spkId)
      }
    })
  }
}

const statusOptions = [
  { text: 'Created', value: 0 },
  { text: 'Closed', value: 1 },
  { text: 'On Process', value: 2 },
]

const exportClickHandler = async () => {
  try {
    await fetchSpk(currentPage.value, perPage.value, spkStore.find, selectedStatus.value, spkStore.from, spkStore.to)
    
    const workbook = XLSX.utils.book_new()

    const header = [[
      'INPUT DATE',
      'SPK Number',
      'Item Code',
      'Item Name',
      'Item Description',
      'Item Instruction',
      'Item Size',
      'Item WIP Code',
      'Item WIP Name',
      'Bill Number',
      'Customer Account',
      'Customer Name',
      'Quantity',
      'UOM',
      'Quantity (Kg)',
      'Shipping Tolerance',
      'Shipping Date',
      'Packing Details',
      'Is Repeat Order?',
      'SPK Type',
    ]]

    const data = spk.value.map(item => [
      item.document_date,
      item.document_number, 
      item.item_code,
      item.item_name,
      item.item_description,
      item.item_instruction,
      item.item_size,
      item.item_wip_code,
      item.item_wip_name,
      item.bill_number,
      item.customer_account,
      item.customer_name,
      item.quantity,
      item.uom.code,
      item.quantity_in_kg,
      item.shipping_tolerance,
      item.shipping_date,
      item.packing_detail,
      item.is_repeat_order === 1 ? 'YES' : (item.status === 2 ? 'NO' : ''),
      item.is_internal === 1 ? 'INTERNAL' : (item.status === 2 ? 'EXTERNAL' : ''),

      // item.status === 0 ? 'Created' : (item.status === 1 ? 'Closed' : 'On Process')
    ])

    const worksheetData = [...header, ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 45 },
      { wch: 60 },
      { wch: 25 },
      { wch: 20 },
      { wch: 30 },
      { wch: 50 },
      { wch: 20 },
      { wch: 25 },
      { wch: 45 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
    ]

    worksheet['!cols'] = columnWidth
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SPK')
    XLSX.writeFile(workbook, 'SPK.xlsx')
  } catch (error) {
    Swal.fire({
      title: 'SPK',
      text: 'Error exporting data',
      icon: 'error',
    })
    console.error(error)
  }
}

const duplicateData = async id => {
  try{
    const ret = await axiosIns.patch(`/production/workorders/duplicate/${id}`, null )


    // const duplicatedSpk = response.data.message;
    await fetchSpk(currentPage.value, perPage.value, spkStore.find, selectedStatus.value, spkStore.from, spkStore.to)
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Failed to duplicate SPK Header and Lines.',
      icon: 'error',
    })
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard>
        <VCardText class="d-flex flex-wrap py-4 gap-2">
          <div
            class="me-3"
            style="width: 70px;"
          >
            <VSelect 
              v-model="perPage"
              density="compact"
              variant="outlined"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <div
            class="d-flex gap-2"
            style="width: 27rem"
          >
            <AppDateTimePicker
              v-model="spkStore.from"
              placeholder="From Date"
              density="compact"
            />

            <AppDateTimePicker
              v-model="spkStore.to"
              placeholder="To Date"
              density="compact"
            />

            <VSelect 
              v-model="selectedStatus"
              label="Status"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              clearable
            />
          </div>
          <!-- {{ spkStore.status }} -->
          <VTextField
            v-model="findText"
            placeholder="Search SPK"
            @keydown.enter="findSpk"
          />
          
          <div class="d-flex flex-wrap gap-2">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="none"
              color="warning"
              @click="findSpk"
            />
            <VBtn
              icon
              :size="40"
              variant="none"
              color="warning"
              @click="refreshButton"
            >
              <VTooltip
                location="top"
                transition="scale-transition"
                activator="parent"
              >
                <span>Refresh</span>
              </VTooltip>   
              <VIcon icon="tabler:refresh" />         
            </VBtn>
            <VBtn
              v-if="ability.can('Eksport', 'SPK')"
              prepend-icon="tabler-file-export"
              @click="exportClickHandler"
            >
              Export
            </VBtn>
            <VBtn
              v-if="ability.can('Manage', 'SPK')"
              prepend-icon="tabler-plus"
              :to="{ name: 'spk-add' }"
            >
              Create New
            </VBtn>
          </div>
        </VCardText>
        <!-- {{ statusOptions }} -->
        <VDivider />
        <VTable class="text-no-wrap">
          <thead class="text-uppercase">
            <tr>
              <th scope="col">
                Action
              </th>
              <th scope="col">
                SPK Number
              </th>
              <th scope="col">
                Input Date
              </th>
              <th scope="col">
                Item Code
              </th>
              <th scope="col">
                Item Name
              </th>
              <th scope="col">
                Quantity
              </th>
              <th scope="col">
                UOM
              </th>
              <th scope="col">
                Cust. Name
              </th>
              <th scope="col">
                Bill Number
              </th>
              <th scope="col">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in spk"
              :key="data.id"
              style="height: 3rem;"
            >
              <td style="width: 8rem;">
                <div class="d-flex justify-start">
                  <VBtn
                    v-if="ability.can('Posting', 'SPK')"
                    icon
                    variant="none"
                    color="success"
                    density="compact" 
                    :disabled="data.status === 2 || data.status === 1"
                    @click="confirmOnProcessHandler(data.id)"
                  >
                    <VTooltip
                      location="top"
                      transition="scale-transition"
                      activator="parent"
                    >
                      <span>On Proccess</span>
                    </VTooltip>
                    <VIcon
                      icon="tabler:book-upload"
                      color="success"
                    />
                  </VBtn>
                  <VBtn
                    v-if="ability.can('Posting', 'SPK')"
                    icon
                    variant="none"
                    color="success"
                    density="compact" 
                    :disabled="data.status === 0 || data.status === 1"
                    @click="confirmClosedHandler(data.id)"
                  >
                    <VTooltip
                      location="top"
                      transition="scale-transition"
                      activator="parent"
                    >
                      <span>Closed</span>
                    </VTooltip>
                    <VIcon
                      icon="tabler:check"
                      color="secondary"
                    />
                  </VBtn>
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="x-small"
                  >
                    <VTooltip
                      location="top"
                      transition="scale-transition"
                      activator="parent"
                    >
                      <span>View More</span>
                    </VTooltip>
                    <VIcon 
                      :size="22"
                      icon="tabler-dots-vertical"
                    />
                    <VMenu activator="parent">
                      <VList>
                        <VListItem :to="{ name: 'spk-print-id', params: {id: data.id} }">
                          <template #prepend>
                            <VIcon 
                              color="secondary"
                              size="24"
                              class="me-3"
                              icon="tabler-printer"
                            />
                          </template>
                          <VListItemTitle>Print</VListItemTitle> 
                        </VListItem>
                        <VListItem
                          v-if="ability.can('Manage', 'SPK')"
                          @click="duplicateData(data.id)"
                        >
                          <template #prepend>
                            <VIcon 
                              color="warning"
                              size="24"
                              class="me-3"
                              icon="tabler:files"
                            />
                          </template>
                          <VListItemTitle>Duplicate</VListItemTitle>
                        </VListItem>
                        <VListItem
                          v-if="ability.can('Manage', 'SPK')"
                          value="duplicate"
                          :to="{ name: 'spk-id', params: {id : data.id} }"
                          :disabled="data.status === 2 || data.status === 1"
                        >
                          <template #prepend>
                            <VIcon
                              color="warning"
                              size="24"
                              class="me-3"
                              icon="tabler-edit"
                            />
                          </template>

                          <VListItemTitle>Edit</VListItemTitle>
                        </VListItem>
                        <VListItem :to="{ name: 'spk-view-id', params: {id: data.id} }">
                          <template #prepend>
                            <VIcon 
                              color="success"
                              size="24"
                              class="me-3"
                              icon="tabler-eye"
                            />
                          </template>
                          <VListItemTitle>View</VListItemTitle>
                        </VListItem>
                        <!--
                          <VListItem value="duplicate" @click="btnDeleteClickHandler(data.id)" :disabled="data.status === 2 || data.status === 1"  v-if="ability.can('Manage', 'SPK')">
                          <template #prepend>
                          <VIcon
                          color="error"
                          size="24"
                          class="me-3"
                          icon="tabler-trash"
                          />
                          </template>

                          <VListItemTitle>Delete</VListItemTitle>
                          </VListItem> 
                        -->
                      </VList>
                    </VMenu>
                  </VBtn>
                </div>
              </td>
              <td>
                <p>
                  {{ data.document_number }}
                </p>
              </td>
              <td>
                <p>
                  {{ data.document_date }}
                </p>
              </td>
              <td>
                <p>
                  {{ data.item_code }}
                </p>
              </td>
              <td>
                <p>
                  {{ data.item_name }}
                </p>
              </td>
              <td>
                <p style="text-align: right">
                  {{ formatRibuan(data.quantity) }}
                </p>
              </td>
              <td>
                <p>
                  {{ data.uom.name }}
                </p>
              </td>
              <td>
                <p>
                  {{ data.customer_name }}
                </p>
              </td>
              <td>
                <p>
                  {{ data.bill_number }}
                </p>
              </td>
              <td>
                <p>
                  {{ data.status === 0 ? 'Created' : (data.status === 1 ? 'Closed' : 'On Process') }}
                </p>
              </td>
            </tr>
          </tbody>
        </VTable>
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">
            {{ paginationData }}
          </span>

          <VPagination
            v-model="currentPage"
            size="small"
            :total-visible="5"
            :length="last"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: SPK
    redirectIfLoggedIn: false
</route>
