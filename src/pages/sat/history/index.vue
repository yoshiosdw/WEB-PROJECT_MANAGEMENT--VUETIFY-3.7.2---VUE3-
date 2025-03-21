<script setup>
import { formatDateMySql, formatDateTimeMySql } from "@/@core/utils/formatters"
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import * as XLSX from 'xlsx'

const histories = ref()
const allHistory = ref()
const selectedStatus = ref('Revised')
const loading = ref(false)
const perPage = ref(10)
const totalHistory = ref(0)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const fetchHistories  = async(page, perPage, find, status) => {
  loading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,
    }

    if (status !== null) {
      params.status = status
    }

    const ret = await axiosIns.get('/sat/histories', {
     
      params: params,
    })

    histories.value = ret.data.data
    totalHistory.value = ret.data.meta.total
    last.value = ret.data.meta.last
    loading.value = false
  } catch(error) {
    loading.value = false
    Swal.fire({
      title: 'LBG',
      text: 'Get data history failed',
      icon: 'error',
    })
    console.log(error)
  }
}

const fetchAllHistory = async() => {
  try{
    const ret = await axiosIns.get('/sat/histories' )

    allHistory.value = ret.data.data
  } catch(error) {
    console.log(error)
  }
}

watchEffect(() => {
  fetchAllHistory(),
  fetchHistories(page.value, perPage.value, find.value, selectedStatus.value)
})

const findHistory = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const statusOptions = [
  { text: 'Revised', value: 0 },
  { text: 'Closed', value: 1 },
  { text: 'Reject', value: 2 },
]

const paginationData = computed(() => {
  const firstIndex = (page.value - 1) * perPage.value + 1

  const lastIndex = Math.min(
    page.value * perPage.value,
    totalHistory.value,
  )

  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalHistory.value}`
})

const exportClickHandler = async() => {
  try{
    await fetchAllHistory()

    const workbook = XLSX.utils.book_new()

    const headerData = [[
      'No',
      'Document Date',
      'Document Number',
      'Rev Number',
      'Bill Date',
      'Bill Number',
      'Region',
      'Qty (Kg)',
      'Request Ship Date',
      'Type',
      'Task Name',
      'Delivery Date',
      'Task Status',
      'Action Date',
    ]]

    const data = allHistory.value.map((data, index) => [
      index + 1,
      data.document_date,
      data.document_number,
      data.rev_number,
      data.bill_date,
      data.bill_number,
      data.sales_region,
      data.qty,
      data.request_ship_date,
      data.status_order,
      data.task_name,
      data.delivery_date,
      data.task_status,
      formatDateTimeMySql(data.created_at),
    ])

    const worksheetData = [...headerData, ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 5 },
      { wch: 13 },
      { wch: 15 },
      { wch: 13 },
      { wch: 13 },
      { wch: 20 },
      { wch: 10 },
      { wch: 8 },
      { wch: 17 },
      { wch: 8 },
      { wch: 35 },
      { wch: 20 },
      { wch: 10 },
      { wch: 18 }, 
    ]

    worksheet['!cols'] = columnWidth

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inquiries')
    XLSX.writeFile(workbook, 'Inquiries_SAT.xlsx')
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: error,
      icon: 'error',
    })
  }
}
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
          <div
            class="d-flex gap-2"
            style="width: 9rem"
          >
            <VSelect 
              v-model="selectedStatus"
              label="Status"
              :items="statusOptions"
              item-title="text"
              item-value="text"
              clearable
            />
          </div>
          <VTextField
            v-model="findText"
            placeholder="Search by bill number / document number"
            @keydown.enter="findHistory"
          />
          
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="none"
              color="warning"
              @click="findHistory"
            />
            <VBtn
              prepend-icon="ri:file-excel-2-line"
              @click="exportClickHandler"
            >
              Export
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
                  Document Date
                </th>
                <th scope="col">
                  Document Number
                </th>
                <th scope="col">
                  Bill Date
                </th>
                <th scope="col">
                  Bill Number
                </th>
                <th scope="col">
                  Qty (Kg)
                </th>
                <th scope="col">
                  Request Ship Date
                </th>
                <!-- <th scope="col">Version</th> -->
                <th scope="col">
                  Task Name
                </th>
                <th scope="col">
                  Delivery Date
                </th>
                <th scope="col">
                  Task Status
                </th>
                <th scope="col">
                  Action Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in histories"
                :key="data.id"
              >
                <td>
                  <div class="text-no-wrap">
                    <p>{{ formatDateMySql(data.document_date) }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p>{{ data.document_number }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p>{{ formatDateMySql(data.bill_date) }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p>{{ data.bill_number }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p style="text-align: right;">
                      {{ data.qty }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p>{{ formatDateMySql(data.request_ship_date) }}</p>
                  </div>
                </td>
                <!--
                  <td>
                  <div class="text-no-wrap">
                  <p>{{ data.version }}</p>
                  </div>
                  </td> 
                -->
                <td>
                  <div class="text-no-wrap">
                    <p>{{ data.task_name }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p>{{ formatDateMySql(data.delivery_date) }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p>{{ data.task_status }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap">
                    <p>{{ formatDateMySql(data.action_date) }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="test-sm text-disabled">
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
    subject: SAT
    redirectIfLoggedIn: false
</route>
