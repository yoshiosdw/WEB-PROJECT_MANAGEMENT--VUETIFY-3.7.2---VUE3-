<script setup>
import { formatDateMySql, formatDateTimeMySql } from '@/@core/utils/formatters'
import { requiredValidator } from '@/@core/utils/validators'
import ability from '@/plugins/casl/ability'

// import Customer from '@/pages/lookup/customers.vue';
import Customer from '@/pages/lookup/satCustomers.vue'
import axiosIns from '@/plugins/axios'

// import router from '@/router';
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import PostDialog from './task/postDialog.vue'
import ProcessDialog from './task/processDialog.vue'

const satId = ref()
const tasks = ref()
const documentNumber = ref("Created by system")
const documentDate = ref(new Date())
const billNumber = ref()
const billDate = ref(new Date())
const customerCode = ref()
const customerName = ref()
const salesRegion = ref()
const salesResponsible = ref()
const familyProductData = ref()
const familyProduct = ref()
const territory = ref()
const quantity = ref(0)
const receivedDate = ref()
const statusOrder = ref()
const lastTask = ref()
const attachment = ref()
const attachFile = ref()
const shipDate = ref(new Date())
const status = ref(0)
const labelButton = ref('Next')

const caseData = ref()
const router = useRouter()

const handleFileChange = event => {
  attachFile.value = event.target.files[0]
  console.log(attachFile.value)
}

const refSatForm = ref()
const isLoading = ref(false)
const savingProcess = ref(false)
const saved = ref(false)

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
    id: '0',
    name: 'New',
  },
  {
    id: '1',
    name: 'Repeat',
  },
]

const fetchTask = async id => {
  isLoading.value = true
  try{
    const ret = await axiosIns.get(`/job/order/takses/by/${id}`, {
       
    })

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

const fetchFamilyProduct = async() => {
  try {
    const ret = await axiosIns.get('/datawarehouse/family/products' )

    familyProductData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: 'Get data failed.',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchFamilyProduct()
})

const createJobOrder = async() => {
  savingProcess.value = true
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
    formData.append('status_order', statusOrder.value)
    formData.append('request_ship_date', formatDateTimeMySql(shipDate.value))
    formData.append('status', status.value)
    if (attachFile.value) {
      formData.append('attachment', attachFile.value)
    }

    // formData.append('attachment', attachFile.value)

    const ret = await axiosIns.post('/job/orders', formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem("sinarjoAccessToken"),
        'Content-Type': 'multipart/form-data',
        'Accept': allowedMimeTypes.join(','),
      },
    })

    satId.value = ret.data.data.id
    savingProcess.value = false
    saved.value = true
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: 'Create data failed.',
      icon: 'error',
    })
    console.log(error)
  }
}

const onSubmit = () => {
  refSatForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createJobOrder()
  })
}

const realoadTaskData = () => {
  fetchTask(satId.value)
}

const handlePostUpdated = isUpdated => {
  if(isUpdated) {
    realoadTaskData()
  }
}

watchEffect(() => {
  fetchTask(satId.value)
})

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
        <VCardTitle>Create SAT</VCardTitle>
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
                <div class="d-flex gap-2">
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
                  :rules="[requiredValidator]"
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
              <!-- {{ familyProduct }} -->
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="quantity"
                  label="Quantity (Kg)"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol cols="3">
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
                  v-model="statusOrder"
                  :rules="[requiredValidator]"
                  label="Order Type"
                  :items="statusOrderData"
                  item-title="name"
                  item-value="id"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VFileInput 
                  v-model="attachment"
                  label="Attach File"
                  :rules="[requiredValidator]"
                  accept=".pdf"
                  clearable
                  @change="handleFileChange"
                />
              </VCol>
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
                    v-if="!saved"
                    color="success"
                    type="submit"
                    :loading="savingProcess"
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
      <!-- <VCard> -->
      <VCard v-if="saved">
        <VCardTitle>Task</VCardTitle>
        <VTable>
          <!-- {{ satId }} -->
          <thead
            class="text-uppercase"
            style="background-color: #efefef"
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
                <p style="text-align:right;">{{ data.target_in_days }}</p>
                </div>
                </td> 
              -->
              <td>
                <div class="d-flex flex-column">
                  <p>{{ formatDateMySql(data.transaction_date) }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ formatDateTimeMySql(data.request_ship_date) }}</p>
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
                          <template v-if="(data.status === 0 || data.status === 2) && ability.can(data.permissions.split(' - ')[1], data.permissions.split(' - ')[0]) && data.task_sequence === 4">
                            <PostDialog
                              :data="data"
                              @task-uploaded="handlePostUpdated"
                            />                        
                          </template>
  
                          <template v-if="(data.status === 0 || data.status === 9) && ability.can(data.permissions.split(' - ')[1], data.permissions.split(' - ')[0]) && data.task_sequence !== 4">
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

                          <template v-if="data.status === 1 && data.task_sequence === 4 && ability.can('Revised', 'BOA SAT Task')">
                            <RevisedDialog
                              :data="data"
                              @task-uploaded="handlePostUpdated"
                            />
                          </template>
                        </VListItem>

                        <!--
                          <VListItem value="user" v-if="data.status === 1 && data.task_sequence === 1 && ability.can('Reject', 'PPIC SAT Task')">
                          <RejectDialog :data="data" @task-uploaded="handlePostUpdated" />
                          </VListItem>
                        
                          <VListItem value="user" v-if="data.status === 1 && data.task_sequence === 4 && ability.can('Revised', 'BOA SAT Task')">
                          <RevisedDialog :data="data" @task-uploaded="handlePostUpdated" />
                          </VListItem>
                        -->
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
