<script setup>
import { formatDateMySql, formatDateTimeMySql } from '@/@core/utils/formatters'
import { requiredValidator } from '@/@core/utils/validators'
import Customer from '@/pages/lookup/satCustomers.vue'
import axiosIns from '@/plugins/axios'
import ability from '@/plugins/casl/ability'
import Swal from 'sweetalert2'
import { useRoute, useRouter } from 'vue-router'
import PostDialog from './task/postDialog.vue'
import RejectDialog from './task/rejectDialog.vue'
import RevisedDialog from './task/revisedDialog.vue'
import { useJobOrder } from './useJobOrderStore'

const route = useRoute()
const satId = ref(route.params.id)
const jobOrders = ref()
const jobOrderStore = useJobOrder()
const tasks = ref()

const documentNumber = ref("Created by system")
const documentDate = ref(new Date())
const billNumber = ref()
const billDate = ref()
const customerCode = ref()
const customerName = ref()
const salesRegion = ref()
const salesResponsible = ref()
const familyProduct = ref()
const familyProductData = ref()
const territory = ref()
const quantity = ref(0)
const attachment = ref()
const reAttachment = ref()
const receivedDate = ref()
const shipDate = ref(new Date())
const status = ref(0)
const labelButton = ref('Save')

const caseData = ref()
const selectedStatus = ref([])

const refSatForm = ref()
const isLoading = ref(false)

const router = useRouter()

const handleKeyDown = event => {
  // Mengatur ketiika tombol yang ditekan adalah tombol "Esc" (kode tombol 27)
  if (event.keyCode === 27) {
    // alert('tes')
    router.push({ name: 'sat' })
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

const getCustomer = val => {
  customerCode.value = val.CustAccount
  customerName.value = val.CustName
  salesRegion.value = val.Area
  territory.value = val.Territory
  salesResponsible.value = val.SalesResponsible
}

const statusOrderData = [
  {
    id: 0,
    name: 'New',
  },
  {
    id: 1,
    name: 'Repeat',
  },
]

const resolveStatusOrder = status => {
  if(status == '0')
    return {
      label: 'Open',
    }
  if(status == '1')
    return {
      label: 'Confirm',
    }
  if(status == '2')
    return {
      label: 'Revised',
    }
  if(status == '9')
    return {
      label: 'Reject',
    }
}

const fetchJobOrder = async satId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/job/orders/${satId}` )

    isLoading.value = false
    jobOrders.value = ret.data.data[0]
    documentNumber.value = ret.data.data[0].document_number
    billNumber.value = ret.data.data[0].bill_number
    billDate.value = ret.data.data[0].bill_date
    customerCode.value = ret.data.data[0].customer_code
    customerName.value = ret.data.data[0].customer_name
    salesResponsible.value = ret.data.data[0].sales_responsible
    salesRegion.value = ret.data.data[0].sales_region
    familyProduct.value = ret.data.data[0].family_product
    territory.value = ret.data.data[0].sales_territory
    reAttachment.value = ret.data.data[0].attachment

    // attachment.value = ret.data.data[0].attachment
    quantity.value = ret.data.data[0].qty 
    receivedDate.value = ret.data.data[0].received_date 
    shipDate.value = ret.data.data[0].request_ship_date 
    selectedStatus.value = ret.data.data[0].status_order
    
    const statusObj = statusOrderData.find(item => item.id === selectedStatus.value)
    if (statusObj) {
      selectedStatus.value = statusObj
    }
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: 'LBG',
      text: 'Get data SAT failed.',
      icon: 'error',
    })
    console.log(error)
  }
}

const fetchTask = async satId => {
  isLoading.value = true
  try{
    const ret = await axiosIns.get(`/job/order/takses/by/${satId}` )

    isLoading.value = false
    tasks.value = ret.data.data
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      text: 'Failed to load task',
      title: 'LBG',
      icon: 'error',
    })
    console.log(error)
  }
}

const realoadTaskData = () => {
  fetchJobOrder(satId.value),
  fetchTask(satId.value)
}

const handlePostUpdated = isUpdated => {
  if(isUpdated) {
    realoadTaskData()
  }
}

const fetchFamilyProduct = async() => {
  try {
    const ret = await axiosIns.get('/datawarehouse/family/products' )

    familyProductData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: 'Get family product failed',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchFamilyProduct()
  fetchTask(satId.value)
  fetchJobOrder(satId.value)

})

const attachFile = ref()

const handleFileChange = event => {
  reAttachment.value = event.target.files[0]
  console.log(attachFile.value)
}

const updateJobOrder = async id => {
  try {
    const allowedMimeTypes = ['application/pdf']

    const formData = new FormData()

    formData.append('document_date', formatDateMySql(documentDate.value))
    formData.append('bill_number', billNumber.value)
    formData.append('bill_date', formatDateMySql(billDate.value))
    formData.append('sales_responsible', salesResponsible.value)
    formData.append('sales_region', salesRegion.value)
    formData.append('customer_code', customerCode.value)
    formData.append('customer_name', customerName.value)
    formData.append('sales_territory', territory.value)
    formData.append('family_product', JSON.stringify(familyProduct.value))
    formData.append('qty', quantity.value)
    formData.append('received_date', formatDateTimeMySql(receivedDate.value))
    formData.append('status_order', selectedStatus.value.id)
    formData.append('request_ship_date', formatDateTimeMySql(shipDate.value))
    formData.append('status', status.value)
    if (attachment.value) {
      formData.append('attachment', attachFile.value)
    }

    const ret = await axiosIns.post(`/job/order/modify/${id}`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem("sinarjoAccessToken"),
        'Content-Type': 'multipart/form-data',
        'Accept': allowedMimeTypes.join(','),
      },
    })

    Swal.fire({
      title: 'LBG',
      text: 'Update data successfully',
      icon: 'success',
    })
    fetchTask(satId.value)
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: 'Update data failed',
      icon: 'error',
    })
    console.log(error)
  }
}

// const updateJobOrder = async(id) => {
//   try {
//     const ret = await axiosIns.patch(`/job/orders/${id}`, {
//       bill_number: billNumber.value,
//       bill_date: billDate.value,
//       customer_code: customerCode.value,
//       customer_name: customerName.value,
//       sales_responsible: salesResponsible.value,
//       sales_region: salesRegion.value,
//       family_product: familyProduct.value,
//       sales_territory: territory.value,
//       qty: quantity.value,
//       received_date: receivedDate.value,
//       request_ship_date: shipDate.value,
//       status_order: selectedStatus.value.id,
//     }, {
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem("sinarjoAccessToken")
//       }
//     })
//     Swal.fire({
//       title: 'LBG',
//       text: 'Update data successfully',
//       icon: 'success'
//     })
//     fetchTask(satId.value)
//   } catch(error) {
//     Swal.fire({
//       title: 'LBG',
//       text: 'Update data failed',
//       icon: 'error'
//     })
//     console.log(error);
//   }
// }

const onSubmit = () => {
  refSatForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateJobOrder(satId.value)
    fetchTask(satId.value)
  })
}

const downloadFile = async id => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/job/order/takses/download/${id}`, {
      responseType: 'blob',
      
    })

    isLoading.value = false
    saveAs(ret.data, 'SAT_Task')
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: 'Download data failed',
      icon: 'error',
    })
    console.log(error)
  }
}

const truncateText = text => {
  return `${text.substring(0, 6)}...`
}

const resolveAttachVariant = attachment => {
  if (attachment !== null)
    return {
      text: attachment,
      color: 'success',
    }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="isLoading" />
      <VCard>
        <VCardTitle>View SAT</VCardTitle>
        <VCardText>
          <VForm
            ref="refSatForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="documentNumber"
                  :rules="[requiredValidator]"
                  label="Document Number"
                  placeholder="Created by system"
                  :readonly="true"
                />
              </VCol>
              <!--
                <VCol cols="3">
                <AppDateTimePicker 
                :rules="[requiredValidator]"
                v-model="documentDate"
                label="Document Date"
                :readonly="true"
                />
                </VCol> 
              -->
              <VCol cols="4">
                <VTextField 
                  v-model="billNumber"
                  :rules="[requiredValidator]"
                  label="Bill Number"
                />
              </VCol>
              <VCol cols="4">
                <AppDateTimePicker 
                  v-model="billDate"
                  :rules="[requiredValidator]"
                  label="Bill Date"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <div class="d-flex gap-5">
                  <VTextField 
                    v-model="customerCode"
                    label="Customer"
                    :readonly="true"
                    :rules="[requiredValidator]"
                  />
                  <Customer @customer="getCustomer" />
                </div>
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="customerName"
                  label="Customer Name"
                  :rules="[requiredValidator]"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="salesResponsible"
                  label="Sales"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="salesRegion"
                  label="Region"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="territory"
                  label="Teritorry"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="4">
                <VSelect 
                  v-model="familyProduct"
                  label="Family Product"
                  :items="familyProductData"
                  item-title="ProductFamilyCode"
                  item-value="ProductFamilyCode"
                  :rules="[requiredValidator]"
                  :menu-props="{ maxHeight: '320px' }"
                  multiple
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="quantity"
                  label="Quantity (Kg)"
                  type="number"
                />
              </VCol>
              <VCol cols="3">
                <!--
                  <AppDateTimePicker 
                  v-model="receivedDate"
                  label="Received Date"
                  /> 
                -->
                <AppDateTimePicker
                  v-model="receivedDate"
                  label="Received Date"
                  :rules="[requiredValidator]"
                  :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }"
                />
              </VCol>
              <VCol cols="3">
                <AppDateTimePicker 
                  v-model="shipDate"
                  label="Request Ship Date"
                />
              </VCol>
              <VCol cols="3">
                <VSelect 
                  v-model="selectedStatus"
                  label="Order Type"
                  :items="statusOrderData"
                  item-title="name"
                  item-value="id"
                  return-object
                  single-line
                />
              </VCol>
              <!-- {{ statusOrder.id }} -->
            </VRow>
            <VRow>
              <VCol cols="6">
                <VTextField 
                  v-model="reAttachment"
                  label="Existing Attched File"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="6">
                <VFileInput 
                  v-model="attachment"
                  label="Reupload"
                  :rules="[requiredValidator]"
                  accept=".pdf"
                  clearable
                  @change="handleFileChange"
                />
              </VCol>
              <!--
                <VCol cols="6">
                <VFileInput label="Reupload" v-model="attachment"/>
                </VCol> 
              -->
              <!-- {{ attachment }} -->
            </VRow>
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <VBtn
                    :to="{name: 'sat'}"
                    color="warning"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    color="success"
                    type="submit"
                  >
                    {{ labelButton }}
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
      <VSpacer class="mt-6" />
      <VCard>
        <VCardTitle>Task</VCardTitle>
        <VTable>
          <thead
            class="text-uppercase"
            style="background-color:#efefef"
          >
            <tr>
              <th scope="col">
                Name
              </th>
              <th scope="col">
                PIC
              </th>
              <!-- <th scope="col" style="text-align: center;">Target Days</th> -->
              <th scope="col">
                Transaction Date
              </th>
              <th scope="col">
                Request Date
              </th>
              <th scope="col">
                Note
              </th>
              <th scope="col">
                Status
              </th>
              <th scope="col">
                Attachment
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in tasks"
              :key="data.id"
            >
              <td>
                <div class="d-flex flex-column">
                  <p>{{ data.task_name }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ data.department_in_charge }}</p>
                </div>
              </td>
              <!--
                <td>
                <div class="d-flex flex-column">
                <p style="text-align: right;">{{ data.target_in_days }}</p>
                </div>
                </td> 
              -->
              <td>
                <div class="d-flex flex-column">
                  <p>{{ formatDateTimeMySql(data.transaction_date) }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ formatDateMySql(data.request_ship_date) }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ data.note }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ data.status_name }}</p>
                </div>
              </td>              
              <td
                style="word-wrap: break-word;"
                class="text-wrap"
              >
                <div
                  class="d-flex flex-column text-wrap"
                  @click="downloadFile(data.id)"
                >
                  <VChip 
                    v-if="data.attachment !== null"
                    :color="resolveAttachVariant(data.attachment).color"
                    size="small"
                  >
                    {{ truncateText(data.attachment) }}
                  </VChip>
                  <template v-else>
                    {{ data.attachment }}
                  </template>
                </div>
              </td>
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
                        <VListItem value="user">
                          <template v-if="(data.status === 0 || data.status === 2) && ability.can(data.permissions.split(' - ')[1], data.permissions.split(' - ')[0]) && (data.task_sequence === 4 || data.task_sequence === 6)">
                            <PostDialog
                              :data="data"
                              @task-uploaded="handlePostUpdated"
                            />                        
                          </template>
  
                          <template v-if="(data.status === 0 || data.status === 9) && ability.can(data.permissions.split(' - ')[1], data.permissions.split(' - ')[0]) && (data.task_sequence !== 4 && data.task_sequence !== 6)">
                            <ProcessDialog
                              :data="data"
                              @task-uploaded="handlePostUpdated"
                            />
                          </template>
                          
                          <template v-if="(data.status === 1) && ability.can('Reject', 'PPIC SAT Task') && data.task_sequence === 1">
                            <RejectDialog
                              :data="data"
                              @task-uploaded="handlePostUpdated"
                            />
                          </template>

                          <template v-if="(data.status === 1) && data.task_sequence === 4 && ability.can('Revised', 'BOA SAT Task')">
                            <RevisedDialog
                              :data="data"
                              @task-uploaded="handlePostUpdated"
                            />
                          </template>
                        </VListItem>
                      </VList>
                    </VMenu>
                  </VBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
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
