<script setup>
import { formatDateMySql, formatRibuan } from "@/@core/utils/formatters"
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"
import * as XLSX from 'xlsx'
import { useInquiriesStore } from './useInquiriesStore'

const inquiriesStore = useInquiriesStore()
const transactions = ref(null)
const findText = ref()
const findData = ref()
const totalTransaction = ref(0)
const perPage = ref(10)
const currentPage = ref(1)
const last = ref(0)

const route = useRoute()
const showLoading = ref(false)

const fetchInquiries = async(page, perPage, fromDate, toDate, docno) => {
  try {
    const fromDateString = formatDateMySql(fromDate)
    const toDateString = formatDateMySql(toDate)

    showLoading.value = true

    const ret = await axiosIns.get('production/transactions', {
      params: {
        page: page,
        perPage: perPage,
        fromDate: fromDateString,
        toDate: toDateString,
        document_number: findData.value,
      },
    })

    showLoading.value = false
    transactions.value = ret.data.data
    inquiriesStore.transaction = ret.data.data
    totalTransaction.value = ret.data.meta.total 
    last.value = ret.data.meta.last 
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Get data inquiries failed.',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchInquiries(currentPage.value, perPage.value, inquiriesStore.fromDate, inquiriesStore.toDate, findData.value)
})

const findSpk = () => {
  currentPage.value = 1
  perPage.value = 10
  findData.value = findText.value

  // inquiriesStore.document_number = findText.value
}

const paginationData = computed(()=>{
  const firstIndex = currentPage.value == 1 ? 1 : perPage.value * currentPage.value + 1
  const lastIndex = currentPage.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalTransaction.value}`
})

const exportClickHandler = async() => {
  try {
    // await fetchInquiries(currentPage.value, perPage.value, inquiriesStore.fromDate, inquiriesStore.toDate)

    await fetchInquiries(1, totalTransaction.value, inquiriesStore.fromDate, inquiriesStore.toDate)


    const workbook = XLSX.utils.book_new()

    const header = [
      [
        'SPK Date',
        'SPK Number',
        'BS Type',
        'Code Order',
        'Item Name',
        'Item Description',
        'Item Size',
        'QTY Order',
        'Process Name',
        'Process Item Code',
        'Process Item Name',
        'Process Item Desc',
        'BO Number',
        'Process Item Size',
        'Waste Target',
        'Machine',
        'Speed',
        'Type',
        'Quantity',
        'Quantity Convers',
        'Quantity Uom',
        'Long Conversion',
        'Long Conversion UOM',
        'Shift',
        'Bill Number',
        'Transaction Date',
        'Input By',
        'Sync Time',
      ],
    ] 

    const data = transactions.value.map(item => [
      item.transaction_date,
      item.work_order_line.work_order.document_number,
      item.bs_type.name,
      item.work_order_line.work_order.item_code, 
      item.work_order_line.work_order.item_name,
      item.work_order_line.work_order.item_description,
      item.work_order_line.work_order.item_size, 
      item.work_order_line.work_order.quantity,
      item.work_order_line.process.name,
      item.work_order_line.item_code,
      item.work_order_line.item_name,
      item.work_order_line.item_description,
      item.production_number,
      item.work_order_line.item_size,
      item.work_order_line.waste_target, 
      item.machine_number,
      item.machine_speed,
      item.transaction_type === 1 ? 'GOOD' : (item.transaction_type  === 2 ? 'WASTE' : 'SUPPLY'),
      item.order_quantity, 
      item.conversion_quantity,
      item.uom.code,
      item.long_conversion,
      item.uom.code,
      item.shift,
      item.work_order_line.work_order.bill_number, 
      item.mobile_created_at,
      item.created_by,
      item.sync_time,
    ])

    const worksheetData = [...header, ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 45 },
      { wch: 50 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 35 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 10, alignment: { horizontal: 'right' } },
      { wch: 15 },
      { wch: 20,alignment: { horizontal: 'right' } },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
    ]

    worksheet['!cols'] = columnWidth
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SPK')
    XLSX.writeFile(workbook, 'SPK.xlsx')
  } catch(error){
    Swal.fire({
      title: 'SPK',
      text: error,
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
            style="width: 20rem"
          >
            <VDateInput
              v-model="inquiriesStore.fromDate"
              placeholder="From Date"
              density="compact"
            />

            <VDateInput
              v-model="inquiriesStore.toDate"
              placeholder="To Date"
              density="compact"
            />
          </div>

          <VTextField
            v-model="findText"
            placeholder="Search by SPK Number.."
            @keydown.enter="findSpk"
          />

          <div class="d-flex flex-wrap gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="none"
              color="warning"
              @click="findSpk"
            />
            <VBtn
              v-if="ability.can('Manage', 'SPK Inquiries')"
              prepend-icon="tabler-file-export"
              @click="exportClickHandler"
            >
              Export
            </VBtn>
          </div>
        </VCardText>
        <!-- {{ statusOptions }} -->
        <VDivider />
        <VTable class="text-no-wrap">
          <thead class="text-uppercase">
            <tr>
              <!-- <th scope="col">Action</th> -->
              <th scope="col">
                SPK Date
              </th>
              <th scope="col">
                SPK ID
              </th>
              <th scope="col">
                BS Type
              </th>
              <th scope="col">
                Code Order
              </th>
              <th scope="col">
                Item Name
              </th>
              <th scope="col">
                Item Desc.
              </th>
              <th scope="col">
                Item Size
              </th>
              <th scope="col">
                Qty Order
              </th>
              <th scope="col">
                Process Name
              </th>
              <th scope="col">
                Process Item Code
              </th>
              <th scope="col">
                Process Item Name
              </th>
              <th scope="col">
                Process Item Desc.
              </th>
              <th scope="col">
                BO Number
              </th>
              <th scope="col">
                Process Item Size
              </th>
              <th scope="col">
                Waste Target
              </th>
              <th scope="col">
                Machine
              </th>
              <th scope="col">
                Speed
              </th>
              <th scope="col">
                Type
              </th>
              <th scope="col">
                Quantity
              </th>
              <th scope="col">
                Quantity Convers
              </th>
              <th scope="col">
                Quantity UOM
              </th>
              <th scope="col">
                Long Conversion
              </th>
              <th scope="col">
                Long Conversion UOM
              </th>
              <th scope="col">
                Shift
              </th>
              <th scope="col">
                Bill Number
              </th>
              <th scope="col">
                Transaction Date
              </th>
              <th scope="col">
                Input By
              </th>
              <th scope="col">
                Sync Time
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in transactions"
              :key="data.id"
              style="height: 3rem;"
            >
              <td>
                <p>{{ data.transaction_date }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line?.work_order?.document_number }}</p>
              </td>
              <td>
                <p>{{ data.bs_type.name }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line.work_order.item_code }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line.work_order.item_name }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line.work_order.item_description }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line.work_order.item_size }}</p>
              </td>
              <td>
                <p style="text-align: right;">
                  {{ formatRibuan(data.work_order_line.work_order.quantity) }}
                </p>
              </td>
              <td>
                <p>{{ data.work_order_line.process.name }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line.item_code }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line.item_name }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line.item_description }}</p>
              </td>
              <td>
                <p>{{ data.production_number }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line.item_size }}</p>
              </td>
              <td>
                <p style="text-align: right;">
                  {{ formatRibuan(data.work_order_line.waste_target) }}
                </p>
              </td>
              <td>
                <p>{{ data.machine_number }}</p>
              </td>
              <td>
                <p>{{ data.machine_speed }}</p>
              </td>
              <!--
                <td>
                <p>{{ data.transaction_type }}</p>
                </td> 
              -->
              <td>
                <p v-if="data.transaction_type === 1">
                  GOOD
                </p>
                <p v-else-if="data.transaction_type === 2">
                  WASTE
                </p>
                <p v-else-if="data.transaction_type === 0">
                  SUPPLY
                </p>
              </td>
              <td>
                <p style="text-align: right;">
                  {{ formatRibuan(data.order_quantity) }}
                </p>
              </td>
              <td>
                <p style="text-align: right;">
                  {{ formatRibuan(data.conversion_quantity) }}
                </p>
              </td>
              <td>
                <p>{{ data.uom.code }}</p>
              </td>
              <td>
                <p style="text-align: right;">
                  {{ formatRibuan(data.long_conversion) }}
                </p>
              </td>
              <td>
                <p>{{ data.uom.code }}</p>
              </td>
              <td>
                <p>Shift {{ data.shift }}</p>
              </td>
              <td>
                <p>{{ data.work_order_line.work_order.bill_number }}</p>
              </td>
              <td>
                <p>{{ data.mobile_created_at }}</p>
              </td>
              <td>
                <p>{{ data.created_by }}</p>
              </td>
              <td>
                <p>{{ data.sync_time }}</p>
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
    subject: SPK Inquiries
    redirectIfLoggedIn: false
</route>
