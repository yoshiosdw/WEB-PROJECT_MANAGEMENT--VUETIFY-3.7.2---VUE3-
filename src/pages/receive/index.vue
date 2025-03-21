<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { useReceiveStore } from './useReceiveStore'

const receiveStore = useReceiveStore()
const receives = ref()
const perPage = ref(10)
const page = ref(1)
const totalReceive = ref(0)
const last = ref(0)
const find = ref(receiveStore.find)
const findText = ref("")

const loading = ref(false)

const fetchReceive = async(page, perPage, find) => {
  loading.value = true 
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,
    }

    const ret = await axiosIns.get('/receives', {
      params: params,
    })

    loading.value = false
    receives.value = ret.data.data
    totalReceive.value = ret.data.meta.total 
    last.value = ret.data.meta.last
  } catch(error) {
    console.log(error)
  }
}

watchEffect(() => {
  fetchReceive(page.value, perPage.value, find.value)
})

const resolveStatusVariant = status_name => {
  if (status_name === 'NON ACTIVE') 
    return {
      text: 'Non Active',
      color: 'error',
    }
  else if (status_name === 'ACTIVE')
    return {
      text: 'Active',
      color: 'success',
    }
  else 
    return {
      text: 'Uknow',
      color: 'error',
    }
}

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/receives/${id}` )

    fetchReceive(page.value, perPage.value, find.value)
  } catch(error) {
    console.log(error)
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonColor: 'primary',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

const exportClickHandler = async () => {
  loading.value = true
  try {

    await fetchReceive(1, totalReceive.value, find.value)

    const workbook = XLSX.utils.book_new()

    const headerData = [
      [
        'Document number',
        'Status',
        'Document Date',
        'Vendor',
        'Purchase Number',
        
      ],
    ]

    // Filter data yang akan di-export berdasarkan filter yang aktif
    const filteredData = receives.value.map(data => [
      data.document_number,
      data.status_name,
      data.document_date,
      data.vendor ? data.vendor.name : '',
      data.purchase_number,
    ])

    const worksheetData = [...headerData, ...filteredData]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ]

    worksheet['!cols'] = columnWidth

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Receive')
    XLSX.writeFile(workbook, 'Receive.xlsx')
    fetchReceive(page.value, perPage.value, find.value)

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

const paginationData = computed(() => {
  const firstIndex = totalReceive.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalReceive.value ? totalReceive.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalReceive.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <VTextField
            v-model="receiveStore.find"
            placeholder="Search.."
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
            />
            <VBtn
              prepend-icon="tabler-plus"
              :to="{ name: 'receive-add' }"
            >
              Add New
            </VBtn>
            <VBtn
              prepend-icon="ri:file-excel-2-line"
              @click="exportClickHandler"
            >
              Export
            </VBtn>
          </div>
        </VCardText>
        <VCardText>
          <VTable>
            <thead>
              <tr
                class="text-uppercase"
                style="background-color: #efefef;"
              >
                <th>Action</th>
                <th>Document Number</th>
                <th>Status</th>
                <th>Document Date</th>
                <th>Vendor</th>
                <th>Purchase Number</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in receives"
                :key="data.id"
              >
                <td style="width: 8 rem">
                  <div class="d-flex justify-start">
                    <VBtn
                      icon
                      variant="text"
                      color="default"
                      size="x-small"
                    >
                      <VIcon 
                        :size="22"
                        icon="tabler-dots-vertical"
                      />
                      <VMenu activator="parent">
                        <VList>
                          <VListItem
                            v-if="data.status === 0"
                            :to="{ name: 'receive-posting-id', params: {id: data.id}}"
                          >
                            <VListItemTitle>
                              <VIcon 
                                icon="tabler-upload"
                                variant="primary"
                                density="compact"
                                color="warning"
                              />
                              Post
                            </VListItemTitle>
                          </VListItem>
                          <!--
                            <VListItem :to="{ name: 'receive-id', params: {id: data.id}}">
                            <VListItemTitle>
                            <VIcon 
                            icon="tabler-edit"
                            variant="primary"
                            density="compact"
                            color="warning"
                            />
                            Edit
                            </VListItemTitle>
                            </VListItem>
                          -->
                          <VListItem @click="btnDeleteClickHandler(data.id)">
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-trash" 
                                variant="primary" 
                                density="compact"
                                color="error"
                              />
                              Delete
                            </VListItemTitle>
                          </VListItem>
                        </VList>
                      </VMenu>
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
                <td>{{ data.vendor ? data.vendor.name : '' }}</td>
                <td>{{ data.purchase_number }}</td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span
            v-if="totalReceive != 0"
            class="text-sm text-disabled"
          >
            {{ paginationData }}
          </span>
          <span
            v-else
            class="text-sm text-disabled"
          >No Data Found!</span>
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
    subject: Dashboard
    redirectIfLoggedIn: false
</route>
