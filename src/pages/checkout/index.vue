<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { useCheckoutStore } from './useCheckoutStore'

const checkoutStore = useCheckoutStore()
const checkouts = ref()
const perPage = ref(10)
const find = ref()
const page = ref(1)
const totalCheckout = ref(0)
const last = ref(0)
const loading = ref(false)
const selectedType = ref()

const fetchCheckout = async(page, perPage, find, selectedType) => {
  loading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,
      checkout_to: selectedType,
    }

    const ret = await axiosIns.get('/checkouts', {
      params: params,
    })

    loading.value = false
    checkouts.value = ret.data.data
    totalCheckout.value = ret.data.meta.total 
    last.value = ret.data.meta.last
  } catch(error) {
    console.log(error)
    loading.value = false
  }
}

watchEffect(() => {
  fetchCheckout(page.value, perPage.value, find.value, selectedType.value)
})


const deleteData = async id => {
  try {
    const ret = await axiosIns.delete(`/checkouts/${id}` )

    fetchCheckout(page.value, perPage.value, find.value, selectedType.value)
  } catch(error) {
    console.log(error)
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: themeConfig.app.title,
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed){
      deleteData(id)
    }
  })
}

const findText = ref()

const search = () => {
  find.value = findText.value
}

const checkoutto = [
  { text: 'Employee', value: 'Employee' },
  { text: 'Item', value: 'Item' },
  { text: 'Location', value: 'Location' },
]

const exportClickHandler = async () => {
  loading.value = true
  try {
    await fetchCheckout(1, totalCheckout.value, find.value, selectedType.value)

    const workbook = XLSX.utils.book_new()

    const headerData = [
      [
        'Document number',
        'Document Date',
        'Checkout To',
        'Reference',
        'Checkout Date',
        'Expect Checkin',
        'Note',
      ],
    ]

    const filteredData = checkouts.value.map(data => {
      let reference = '-'

      if (data.checkout_to === 'Employee') {
        reference = data.employee && data.employee.person ? data.employee.person.name : '-'
      } else if (data.checkout_to === 'Location') {
        reference = data.location ? data.location.name : '-'
      } else if (data.checkout_to === 'Item') {
        reference = data.item ? data.item.name : '-'
      }

      return [
        data.document_number,
        data.document_date,
        data.checkout_to,
        reference,
        data.checkout_date,
        data.expected_checkin_date,
        data.note,
      ]
    })

    const worksheetData = [...headerData, ...filteredData]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ]

    worksheet['!cols'] = columnWidth

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Checkouts')
    XLSX.writeFile(workbook, 'Checkouts.xlsx')

    fetchCheckout(page.value, perPage.value, find.value, selectedType.value)
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error,
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const resolveStatusVariant = status_name => {
  if (status_name === 'Non Active') 
    return {
      text: 'Non Active',
      color: 'error',
    }
  else if (status_name === 'Posted')
    return {
      text: 'Posted',
      color: 'success',
    }
  else 
    return {
      text: 'Uknow',
      color: 'error',
    }
}

const paginationData = computed(() => {
  const firstIndex = totalCheckout.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalCheckout.value ? totalCheckout.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalCheckout.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <div
            class="d-flex gap-2"
            style="width: 10rem;"
          >
            <VSelect 
              v-model="selectedType"
              label="Checkout To"
              :items="checkoutto" 
              item-title="text" 
              item-value="value"
              clearable
              :menu-props="{ maxHeight: '250px' }"
            />
          </div>
          <VTextField 
            v-model="findText"
            label="Search Checkout"
            clearable
            @keydown.enter="search"
          />
          <VBtn
            prepend-icon="tabler-plus"
            :to="{name: 'checkout-add'}"
          >
            Add New
          </VBtn>
          <VBtn
            prepend-icon="ri:file-excel-2-line"
            @click="exportClickHandler"
          >
            Export
          </VBtn>
        </VCardText>
        <VCardText>
          <VTable>
            <thead>
              <tr
                class="text-uppercase"
                style="background-color: #efefef;"
              >
                <th>Action</th>
                <th class="text-no-wrap">
                  Document Number
                </th>
                <th>
                  Status
                </th>
                <th>Document Date</th>
                <th>Checkout To</th>
                <th>Reference</th>
                <th>Checkout Date</th>
                <th>Item Name</th>
                <th>Brand</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in checkouts"
                :key="data.id"
              >
                <td style="width: 8 rem;">
                  <div class="d-flex justify-center mt-2 gap-2">
                    <VBtn
                      v-if="data.status === 0"
                      icons
                      variant="none"
                      title="Post"
                      size="25"
                      :to="{ name:'checkout-posting-id', params: {id: data.id} }"
                    >
                      <VIcon
                        icon="tabler-upload"
                        color="success"
                        size="25"
                      />
                    </VBtn>
                    <VBtn
                      v-if="data.status === 1"
                      icons
                      variant="none"
                      title="View"
                      size="25"
                      :to="{ name:'checkout-view-id', params: {id: data.id} }"
                    >
                      <VIcon
                        icon="tabler-eye"
                        color="error"
                        size="25"
                      />
                    </VBtn>
                    <VBtn
                      icon
                      variant="none"
                      size="22"
                      title="Delete"
                      @click="btnDeleteClickHandler(data.id)"
                    >
                      <VIcon
                        icon="tabler-trash"
                        color="secondary"
                        size="25"
                      />
                    </VBtn>
                  </div>
                </td>
                <td>{{ data.document_number }}</td>
                <td>
                  <VChip
                    :color="resolveStatusVariant(data.status_name).color"
                    size="small"
                  >
                    {{ resolveStatusVariant(data.status_name).text }}
                  </VChip>
                </td>
                <td>{{ data.document_date }}</td>
                <td>{{ data.checkout_to }}</td>
                <td>
                  <template v-if="data.checkout_to === 'Employee'">
                    {{ data.employee && data.employee.person ? data.employee.person.name : '-' }}
                  </template>
                  <template v-if="data.checkout_to === 'Location'">
                    {{ data.location ? data.location.name : '-' }}
                  </template>
                  <template v-if="data.checkout_to === 'Item'">
                    {{ data.item.name }}
                  </template>
                </td>

                <td>{{ data.checkout_date }}</td>
                <td>{{ data.check_out_line && data.check_out_line.asset[0] ? data.check_out_line.asset[0].item.name :'-' }}</td>
                <td>{{ data.check_out_line && data.check_out_line.asset[0] ? data.check_out_line.asset[0].brand : '-' }}</td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span
            class="text-sm text-disabled"
          >
            {{ paginationData }}
          </span>
          <VPagination
            v-model="page"
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
    subject: Ticket
    redirectIfLoggedIn: false
</route>
