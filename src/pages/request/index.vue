<script setup>
import axiosIns from '@/plugins/axios'
import ability from '@/plugins/casl/ability'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'

const data = ref()
const totalData = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')
const route = useRoute()
const routeId = ref(route.params.id) 

const loading = ref(true)

const fetchgetData = async (page, perPage, find) => {
  loading.value = true
  try {
    const response = await axiosIns.get('/request/form', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    data.value = response.data.data
    totalData.value = response.data.meta.total
    last.value = response.data.meta.last
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load data Request',
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

watchEffect(() => {
  fetchgetData(page.value, perPage.value, find.value)
})


// const findRetur = async () => {
//   page.value = 1
//   perPage.value = 10
//   find.value = findText.value
// }

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/request/form/${id}` )

    fetchgetData(page.value, perPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Error deleting data',
      icon: 'error',
    })
    console.log(error)
    loading.value = false
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

const submitData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.patch(`/request/form/submitted/${id}`, null )

    fetchgetData(page.value, perPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Error submit data',
      icon: 'error',
    })
    console.log(error)
    loading.value = false
  }
}


const btnSubmit = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure Submit data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, Submit it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      submitData(id)
    }
  })
}


const paginationData = computed(() => {
  const firstIndex = totalData.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalData.value ? totalData.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalData.value} entries`
})

// const returExcel = async() => {
//   try {
//     const ret = await axiosIns.get(`/return/exports`, {
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
//       },
//     })

//     returExc.value = ret.data.data
//   } catch(error) {
//     Swal.fire({
//       title: 'Manufacture',
//       text: 'Get data failed.',
//       icon: 'error',
//     })
//   }
// }

// const exportClickHandler = async () => {
//   try{
//     await returExcel()

//     const workbook = XLSX.utils.book_new()

//     const lineData = [
//       [
//         'No',
//         'No Komplain',
//         'Memo Retur Form',
//         'Tgl Memo Retur',
//         'Tgl MG/Terima Barang',
//         'Customer Acc. Number',
//         'Customer Name',
//         'Theritory',
//         'Nama Salesman Territory',
//         'No Sales Order',
//         'Jenis Komplain',
//         'Nama Personal Penerima',
//         'Isi Komplain/Pesan',
//         'Category',
//         'Sebab Komplain',
//         'Quality Case',
//         'Penyelesaian yang Diminta',
//         'Item Code SKU',
//         'Nama SKU',
//         'Family Product',
//         'Angka',
//         'Satuan',
//         'Berat(Kg)',
//         'Plant',
//         'Nomor SO Retur/Potong Nota/No. TJ',
//         'Tanggal SO/Nota TJ',
//         'No Invoice',
//         'Tanggal Invoice',
//         'Tanggal RO ter-Invoice',
//         'Keterangan',
//         'Status',
//         'Tgl Close Cases',
//         'Target',
//         'ACT (Day)',
//         'OVER DAY',
//         'Point',
//       ],
//     ]

//     const headerData = [
//       [
//         { value: 'SUMBER DATA', colspan: 5 },
//         { value: 'DATA CUSTOMER', colspan: 4 },
//         { value: 'DATA KOMPLAIN', colspan: 8 },
//         { value: 'DATA PRODUK', colspan: 8 },
//         { value: 'CLEARANCE CASES', colspan: 8 },
//       ],
//       ...lineData,
//     ]

//     const data = returExc.value.map((item, index) => [
//       index + 1,
//       '',
//       item.document_number,
//       item.document_date,
//       '',
//       item.customer_account,
//       item.customer_name,
//       item.customer_theritory,
//       item.salesman_name,
//       item.so_retur_number,
//       item.return_categories,
//       '',
//       item.retur_note,
//       item.return_type,
//       item.return_categories,
//       item.return_sub_categories,
//       item.settlement,
//       item.item_code,
//       item.item_name,
//       item.item_family_product, 
//       item.return_quantity,
//       item.return_uom,
//       '',
//       item.plant,
//       item.so_retur_number,
//       item.so_retur_date,
//       item.invoice_number,
//       item.invoice_date,
//       '',
//       '',
//       item.status,
//       item.due_date,
//       item.target_days,
//       item.act_day,
//       item.over_day,
//       item.point,
//     ])

//     const worksheetData = [...headerData, ...data]
//     const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

//     // worksheet['!rows'] = [{ hpx: 30, s: { bold: true } }];
//     const columnWidth = [
//       { wch: 8 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 25 },
//       { wch: 10 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 35 },
//       { wch: 20 },
//       { wch: 15 },
//       { wch: 20 },
//       { wch: 15 },
//       { wch: 25 },
//       { wch: 35 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 20 },
//       { wch: 15 },
//       { wch: 20 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 20 },
//       { wch: 15 },
//       { wch: 10 },
//       { wch: 15 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 15 },
//     ]

//     worksheet['!cols'] = columnWidth

//     XLSX.utils.book_append_sheet(workbook, worksheet, 'RO')
//     XLSX.writeFile(workbook, 'Return_Order.xlsx')
//   } catch(error) {
//     Swal.fire({
//       title: 'Manufacture',
//       text: error,
//       icon: 'error',
//     })
//   }
// }

const resolveStatusVariant = status_request_name => {
  if (status_request_name === 'Created') {
    return {
      text: status_request_name,
      color: 'secondary',
    }
  } else if (status_request_name === 'Approved') {
    return {
      text: status_request_name,
      color: 'warning',
    }
  } else if (status_request_name === 'Submitted') {
    return {
      text: status_request_name,
      color: 'info',
    }
  } else {
    return {
      text: status_request_name,
      color: 'error',
    }
  }
}

const resolveStatusHead = status_recommendation_name => {
  if (status_recommendation_name === 'Created') {
    return {
      text: status_recommendation_name,
      color: 'warning',
    }
  } else if (status_recommendation_name === 'Proceed') {
    return {
      text: status_recommendation_name,
      color: 'succes',
    }
  } else {
    return {
      text: status_recommendation_name,
      color: 'error',
    }
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <Resume />
      <VSpacer class="mt-5" />
      <VCard :loading="loading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          
          <VTextField
            v-model="findText"
            label="Search"
            @keydown.enter="findRetur"
          />
          
          
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="none"
              color="warning"
              @click="findRetur"
            />
           
            <VBtn
              v-if="ability.can('Manage', 'Return')"
              :to="{ name: 'request-add' }"
              prepend-icon="tabler-plus"
            >
              Add Request
            </VBtn>
          </div>
        </VCardText>
        <VDivider />
        <VCardText>
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef"
            >
              <tr>
                <th scope="col">
                  ACTION
                </th>
                <th scope="col">
                  Ticket No / Ext. No
                </th>
                <th scope="col">
                  Device Request
                </th>
                <th scope="col">
                  Requestor Name
                </th>
                <th scope="col">
                  Depart & Position
                </th>
                <th scope="col">
                  STATUS
                </th>
                <th scope="col">
                  Request Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in data"
                :key="data.id"
              >
                <td style="width: 8rem;">
                  <div class="d-flex justify-start">
                    <VBtn
                      v-if="data.status_request_name !== 'Submitted' && data.status_request_name !== 'Approved' && data.status_request_name !== 'Rejected'"
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
                            v-if="data.status_request_name === 'Created'"
                            @click="btnSubmit(data.id)"
                          >
                            <template #prepend>
                              <VIcon
                                color="success"
                                size="24"
                                class="me-3"
                                icon="mdi-check"
                              />
                            </template>
                            <VListItemTitle>Submit</VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="data.status_request_name === 'Created'"
                            :to="{ name: 'request-edit', params: {edit: data.id}}"
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

                          <VListItem
                            v-if="data.status_request_name === 'Created'"
                            @click="btnDeleteClickHandler(data.id)"
                          >
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

                          <!--
                            <VListItem
                            v-if="data.status_request_name === 'Submitted'"
                            :to="{ name: 'request-id', params: {id: data.id}}"
                            >
                            <template #prepend>
                            <VIcon
                            color="warning"
                            size="24"
                            class="me-3"
                            icon="tabler-eye"
                            />
                            </template>
  
                            <VListItemTitle>View</VListItemTitle>
                            
                            </VListItem>
                          -->
                        </VList>
                      </VMenu>
                    </VBtn>

                    <VBtn
                      v-if="data.status_request_name === 'Submitted'"
                      icon
                      variant="none"
                      density="compact"
                      :to="{ name: 'request-approver-id', params: {id: data.id}}"
                    >
                      <VIcon
                        variant="none"
                        density="compact"
                        color="info"
                        size="24"
                        icon="tabler-eye"
                      />
                    </VBtn>

                    <VBtn
                      v-if="data.status_request_name === 'Approved'"
                      :to="{ name: 'request-assesment-id', params: {id: data.id}}"
                      icon
                      variant="none"
                      density="compact"
                    >
                      <VIcon
                        variant="none"
                        density="compact"
                        color="warning"
                        size="24"
                        icon="mdi-file-document-check-outline"
                      />
                    </VBtn>
                    
                    <VBtn
                      v-if="data.status_request_name === 'Rejected'"
                      icon
                      variant="none"
                      density="compact"
                    >
                      <VIcon
                        variant="none"
                        density="compact"
                        color="error"
                        size="24"
                        icon="mdi-cancel"
                      />
                    </VBtn>

                    <!--
                      <VBtn
                      icon
                      variant="text"
                      color="default"
                      size="x-small"
                      >
                      <VIcon
                      color="warning"
                      size="24"
                      class="me-3"
                      icon="ri:file-excel-2-line"
                      />
                      </VBtn> 
                    -->
                  </div>
                </td>

                <td>
                  <div class="text-no-wrap">
                    <p
                      class="mt-5"
                      style="color: red"
                    >
                      {{ data.ticket_number }} / {{ data.ext_number }}
                    </p>
                  </div>
                </td>
                
                <td>
                  <div class="text-no-wrap">
                    <p
                      class="mt-5"
                    >
                      {{ data.device_requestor.device_name }}
                    </p>
                  </div>
                </td>

                <td>
                  <div class="text-no-wrap">
                    <p class="mt-5">
                      {{ data.requestor.name }}
                    </p>
                  </div>
                </td>

                <td>
                  <div class="text-no-wrap">
                    <p class="mt-5">
                      {{ data.requestor_department }} - {{ data.requestor_position }}
                    </p>
                  </div>
                </td>

                <td>
                  <div class="text-no-wrap">
                    <VChip
                      :color="resolveStatusVariant(data.status_request_name).color"
                      size="small"
                    >
                      {{ resolveStatusVariant(data.status_request_name).text }}
                    </VChip>
                  </div>
                </td>

                <td>
                  <div class="text-no-wrap">
                    <p
                      class="mt-5"
                    >
                      {{ data.request_date }}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">
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
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
