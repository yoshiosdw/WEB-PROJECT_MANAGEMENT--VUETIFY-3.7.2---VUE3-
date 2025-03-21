<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import ability from '@/plugins/casl/ability'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import Resume from './dashboard/resume.vue'

const retur = ref([])
const totalRetur = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')
const returExc = ref()

const countOfTotalReturn = ref(0)
const countOfCustomer = ref(0)
const countOfOpenReturn = ref(0)
const countOfOverdueReturn = ref(0)

const loading = ref(true)

const fetchRetur = async (page, perPage, find) => {
  loading.value = true
  try {
    const response = await axiosIns.get('/returns', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    retur.value = response.data.data
    totalRetur.value = response.data.meta.total
    last.value = response.data.meta.last
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load data Retur',
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

const refresButton = () => {
  page.value = 1
  perPage.value = 10
  find.value = ''
  findText.value = ''
  fetchRetur(page.value, perPage.value, find.value)
}

const findRetur = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/retur/${id}` )

    fetchRetur(page.value, perPage.value, find.value)
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

watchEffect(() => {
  fetchRetur(page.value, perPage.value, find.value)
})

const paginationData = computed(() => {
  const firstIndex = totalRetur.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalRetur.value ? totalRetur.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalRetur.value} entries`
})

const resolveReturVariant = status => {
  if(status == 'On Going' )
    return {
      color: 'warning',
      icon: 'tabler-circle',
      label: 'On Going',
      chip: { color: 'warning' },
    }
  if(status == 'Overdue' )
    return {
      color: 'error',
      icon: 'tabler-ban',
      label: 'Overdue',
      chip: { color: 'error' },
    }
  if(status == 'Passed' )
    return {
      color: 'success',
      icon: 'tabler-circle-check',
      label: 'Passed',
      chip: { color: 'success' },
    }
}

const resolvePica = department => {
  switch (department) {
  case 'BOA':
    return {
      action: 'Posting',
      subject: 'BOA Task',
    }
  case 'FINANCE':
    return {
      action: 'Posting',
      subject: 'INVOICER Task',
    }
  case 'MANUFACTURE':
    return {
      action: 'Create PICA',
      subject: 'MANUFACTURE',
    }
  case 'LOGISTIC':
    return {
      action: 'Posting',
      subject: 'LOGISTIC Task',
    }
  case 'WAREHOUSE':
    return {
      action: 'Posting',
      subject: 'WAREHOUSE Task',
    }
  default:
    break
  }
}

const returExcel = async() => {
  try {
    const ret = await axiosIns.get(`/return/exports` )

    returExc.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'Manufacture',
      text: 'Get data failed.',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  returExcel()
})

const exportClickHandler = async () => {
  try{
    await returExcel()

    const workbook = XLSX.utils.book_new()

    const lineData = [
      [
        'No',
        'No Komplain',
        'Memo Retur Form',
        'Tgl Memo Retur',
        'Tgl MG/Terima Barang',
        'Customer Acc. Number',
        'Customer Name',
        'Theritory',
        'Nama Salesman Territory',
        'No Sales Order',
        'Jenis Komplain',
        'Nama Personal Penerima',
        'Isi Komplain/Pesan',
        'Category',
        'Sebab Komplain',
        'Quality Case',
        'Penyelesaian yang Diminta',
        'Item Code SKU',
        'Nama SKU',
        'Family Product',
        'Angka',
        'Satuan',
        'Berat(Kg)',
        'Plant',
        'Handling Retur',
        'Nomor SO Retur/Potong Nota/No. TJ',
        'Tanggal SO/Nota TJ',
        'No Invoice',
        'Tanggal Invoice',
        'Tanggal RO ter-Invoice',
        'Keterangan',
        'Status',
        'Tgl Close Cases',
        'Target',
        'ACT (Day)',
        'OVER DAY',
        'Point',
      ],
    ]

    const headerData = [
      [
        { value: 'SUMBER DATA', colspan: 5 },
        { value: 'DATA CUSTOMER', colspan: 4 },
        { value: 'DATA KOMPLAIN', colspan: 8 },
        { value: 'DATA PRODUK', colspan: 8 },
        { value: 'CLEARANCE CASES', colspan: 8 },
      ],
      ...lineData,
    ]

    const data = returExc.value.map((item, index) => [
      index + 1,
      '',
      item.document_number,
      item.document_date,
      '',
      item.customer_account,
      item.customer_name,
      item.customer_theritory,
      item.salesman_name,
      item.so_retur_number,
      item.return_categories,
      '',
      item.retur_note,
      item.return_type,
      item.return_categories,
      item.return_sub_categories,
      item.settlement,
      item.item_code,
      item.item_name,
      item.item_family_product, 
      item.return_quantity,
      item.return_uom,
      '',
      item.plant,
      item.handling_retur,
      item.so_retur_number,
      item.so_retur_date,
      item.invoice_number,
      item.invoice_date,
      '',
      '',
      item.status,
      item.due_date,
      item.target_days,
      item.act_day,
      item.over_day,
      item.point,
    ])

    const worksheetData = [...headerData, ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // worksheet['!rows'] = [{ hpx: 30, s: { bold: true } }];
    const columnWidth = [
      { wch: 8 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 35 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 45 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
    ]

    worksheet['!cols'] = columnWidth

    XLSX.utils.book_append_sheet(workbook, worksheet, 'RO')
    XLSX.writeFile(workbook, 'Return_Order.xlsx')
  } catch(error) {
    Swal.fire({
      title: 'Manufacture',
      text: error,
      icon: 'error',
    })
  }
}

const resolveStatusVariant = status_name => {
  if (status_name === 'Created') {
    return {
      text: status_name,
      color: 'warning',
    }
  } else if (status_name === 'On Progress') {
    return {
      text: status_name,
      color: 'info',
    }
  } else {
    return {
      text: status_name,
      color: 'secondary',
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
            placeholder="Search Retur"
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
              icon="tabler:refresh"
              :size="40"
              variant="none"
              color="warning"
              @click="refresButton"
            />
            
            <VBtn
              v-if="ability.can('Manage', 'Return')"
              :to="{ name: 'retur-add' }"
              prepend-icon="tabler-plus"
            >
              Add Record
            </VBtn>
            <VBtn
              prepend-icon="ri:file-excel-2-line"
              @click="exportClickHandler"
            >
              Eksport
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
                  Action
                </th>
                <th scope="col">
                  DOC. NUMBER
                </th>
                <th scope="col">
                  Memo Doc.NUMBER
                </th>
                <th scope="col">
                  Sub Category
                </th>
                <th scope="col">
                  PIC
                </th>
                <th scope="col">
                  STATUS
                </th>
                <th scope="col">
                  DOC. DATE
                </th>
                <th scope="col">
                  DUE DATE
                </th>
                <th scope="col">
                  CUSTOMER
                </th>
                <th
                  scope="col"
                  style="text-align-last: center;"
                >
                  PERCENTAGE
                </th>
                <th scope="col">
                  NOTE
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in retur"
                :key="data.id"
              >
                <td style="width: 8rem;">
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
                            value="user"
                            :to="{ name: 'retur-tasks-id', params: {id: data.id}}"
                          >
                            <!-- <VListItem value="user" :to="{ name: 'retur-tasks-id', params: {id: data.id}}" v-if="ability.can('Manage', 'Task Retur')"> -->
                            <template #prepend>
                              <VIcon
                                color="primary"
                                size="24"
                                class="me-3"
                                icon="tabler:browser-check"
                              />
                            </template>
                            <VListItemTitle>Tasks</VListItemTitle>
                          </VListItem>
                          <VListItem
                            v-if="ability.can('Manage', 'Task Resoluition')"
                            value="user"
                            :to="{ name: 'retur-settlement-id', params: {id: data.id}}"
                          >
                            <template #prepend>
                              <VIcon
                                color="primary"
                                size="24"
                                class="me-3"
                                icon="tabler:square-rounded-check"
                              />
                            </template>
                            <VListItemTitle>Resolution</VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="ability.can(resolvePica(data.return_categories.department_in_charge).action, resolvePica(data.return_categories.department_in_charge).subject)"
                            value="user"
                            :to="{ name: 'retur-pica-id', params: {id: data.id}}"
                          >
                            <template #prepend>
                              <VIcon
                                color="primary"
                                size="24"
                                class="me-3"
                                icon="tabler-check"
                              />
                            </template>
                            <VListItemTitle>PICA</VListItemTitle>
                          </VListItem>

                          <VDivider />
                          <VListItem
                            v-if="ability.can('Manage', 'Return') && data.status_name === 'Created'"
                            value="duplicate"
                            :to="{ name: 'retur-edit', params: {edit: data.id}}"
                          >
                            <template #prepend>
                              <VIcon
                                color="warning"
                                size="24"
                                class="me-3"
                                icon="tabler-pencil"
                              />
                            </template>
  
                            <VListItemTitle>Edit</VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="ability.can('Read', 'Return')"
                            value="duplicate"
                            :to="{ name: 'retur-id', params: {id: data.id}}"
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
                          
                          <VListItem
                            v-if="data.status_name[0].status_name == 'Open' && ability.can('Manage', 'Task Delete')"
                            value="duplicate"
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
                        </VList>
                      </VMenu>
                    </VBtn>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p
                      style="color: red"
                      class="mt-5"
                    >
                      {{ data.document_number }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p class="mt-5">
                      {{ data.memo_document_number }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p class="mt-5">
                      {{ data.return_sub_categories.name }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p class="mt-5">
                      {{ data.return_categories.department_in_charge }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <VChip
                      :color="resolveStatusVariant(data.status_name).color"
                      size="small"
                    >
                      {{ resolveStatusVariant(data.status_name).text }}
                    </VChip>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p class="mt-5">
                      {{ formatDateMySql(data.document_date) }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p class="mt-5">
                      {{ formatDateMySql(data.due_date) }}
                    </p>
                  </div>
                </td>
                <td class="text-no-wrap">
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.customer_name }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex justify-center">
                    <p class="mt-5">
                      {{ data.percentage[0].percentage }} %
                    </p>
                  </div>
                </td>
                
                <td>
                  <div class="d-flex flex-column">
                    <VChip
                      :color="resolveReturVariant(data.note).color"
                      label
                      size="small"
                      variant="none"
                      :prepend-icon="resolveReturVariant(data.note).icon"
                      style="margin-top: -20px; margin-left: -7px;"
                    >
                      {{ resolveReturVariant(data.note).label }}
                    </VChip>
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
  subject: Return
  redirectIfLoggedIn: false
</route>
