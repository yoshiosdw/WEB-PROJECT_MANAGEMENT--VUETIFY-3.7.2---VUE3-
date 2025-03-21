<script setup>
import { formatDateMySql, formatDateTimeMySql } from '@/@core/utils/formatters'
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import ability from '@/plugins/casl/ability'
import Swal from 'sweetalert2'
import { useRoute, useRouter } from 'vue-router'
import { useJobOrder } from '../useJobOrderStore'
import PostDialog from './postDialog.vue'
import ProcessDialog from './processDialog.vue'
import RejectDialog from './rejectDialog.vue'
import RevisedDialog from './revisedDialog.vue'
import PostDialogCopyDelivery from './postDialogDelivery.vue'

const route = useRoute()
const satId = ref(route.params.task)
const jobOrders = ref()
const jobOrderStore = useJobOrder()
const tasks = ref()

const documentNumber = ref("Created by system")
const documentDate = ref()
const billNumber = ref()
const billDate = ref()
const customerCode = ref()
const customerName = ref()
const salesRegion = ref()
const salesResponsible = ref()
const familyProduct = ref()
const territory = ref()
const attachment = ref()
const quantity = ref(0)
const receivedDate = ref()
const statusOrder = ref()
const lastTask = ref()
const shipDate = ref()

// const status = ref(0)
const labelButton = ref('Next')

const caseData = ref()

const refSatForm = ref()
const isLoading = ref(false)
const savingProcess = ref(false)
const saved = ref(false)
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

const fetchJobOrder = async satId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/job/orders/${satId}` )

    isLoading.value = false
    jobOrders.value = ret.data.data[0]
    documentNumber.value = ret.data.data[0].document_number
    documentDate.value = ret.data.data[0].document_date
    billNumber.value = ret.data.data[0].bill_number
    billDate.value = ret.data.data[0].bill_date
    customerCode.value = ret.data.data[0].customer_code
    customerName.value = ret.data.data[0].customer_name
    salesResponsible.value = ret.data.data[0].sales_responsible
    salesRegion.value = ret.data.data[0].sales_region
    familyProduct.value = ret.data.data[0].family_product
    territory.value = ret.data.data[0].sales_territory
    attachment.value = ret.data.data[0].attachment
    quantity.value = ret.data.data[0].qty 
    receivedDate.value = formatDateMySql(ret.data.data[0].received_date )
    shipDate.value = formatDateMySql(ret.data.data[0].request_ship_date )
    statusOrder.value = ret.data.data[0].status_order_name
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: 'LBG',
      text: 'Get data failed.',
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

watchEffect(() => {
  fetchJobOrder(satId.value),
  fetchTask(satId.value)
})

const realoadTaskData = () => {
  fetchJobOrder(satId.value),
  fetchTask(satId.value)
}

const handlePostUpdated = isUpdated => {
  if(isUpdated) {
    realoadTaskData()
  }
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

const revokedData = async id => {
  try {
    const ret = await axiosIns.patch(`job/order/takses/revoked/data/${id}`)

    fetchTask(satId.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Revoke data failed',
      icon: 'error',
    })
    console.log(error)
  }
}

const btnRevokeClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure revoke data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, revoked!',
  }).then(ret => {
    if (ret.isConfirmed) {
      revokedData(id)      
    }
  })
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
          <VForm ref="refSatForm">
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
                <VTextField 
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
                  :readonly="true"
                  placeholder="Created by system"
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="billDate"
                  label="Bill Date"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <div class="d-flex gap-3">
                  <VTextField 
                    v-model="customerCode"
                    label="Customer"
                    :readonly="true"
                    :rules="[requiredValidator]"
                  />
                </div>
              </VCol>
              <VCol cols="5">
                <VTextField 
                  v-model="customerName"
                  label="Customer Name"
                  :rules="[requiredValidator]"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="salesResponsible"
                  label="Sales"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <div class="d-flex gap-3">
                  <VTextField
                    v-model="salesRegion"
                    label="Region"
                    :readonly="true"
                  />
                  <!-- <SalesRegion @salesRegion="getSalesRegion" /> -->
                </div>
              </VCol>
              <VCol cols="4">
                <div class="d-flex gap-3">
                  <VTextField
                    v-model="familyProduct"
                    label="Family Product"
                    :readonly="true"
                  />
                </div>
              </VCol>
              <VCol cols="4">
                <div class="d-flex gap-3">
                  <VTextField 
                    v-model="territory"
                    label="Territory"
                    :readonly="true"
                  />
                </div>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="quantity"
                  label="Quantity (Kg)"
                  type="number"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="receivedDate"
                  label="Received Date"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="shipDate"
                  label="Request Ship Date"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="statusOrder"
                  label="Order Type"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VTextField 
                  v-model="attachment"
                  :readonly="true"
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
            style="background-color: #efefef;"
          >
            <tr>
              <th scope="col">
                Name
              </th>
              <th scope="col">
                PIC
              </th>
              <!-- <th scope="col">Target Days</th> -->
              <th scope="col">
                Transaction Date
              </th>
              <th scope="col">
                Request Date
              </th>
              <th scope="col">
                Processed By
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
              <td>
                <div class="d-flex flex-column">
                  <p>{{ formatDateTimeMySql(data.transaction_date) }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ formatDateMySql(data.confirmation_date) }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ data.user?.person?.name || '' }}</p>
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
                        <!--
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
                        -->

                        <VListItem v-if="(data.status === 0 || data.status === 2) && ability.can(data.permissions.split(' - ')[1], data.permissions.split(' - ')[0]) && (data.task_sequence === 4)">
                          <PostDialogCopyDelivery
                            :data="data"
                            @task-uploaded="handlePostUpdated"
                          /> 
                        </VListItem>
                        <VListItem v-if="(data.status === 0 || data.status === 2) && ability.can(data.permissions.split(' - ')[1], data.permissions.split(' - ')[0]) && (data.task_sequence === 6)">
                          <PostDialog
                            :data="data"
                            @task-uploaded="handlePostUpdated"
                          /> 
                        </VListItem>
                        <VListItem v-if="(data.status === 0 || data.status === 9) && ability.can(data.permissions.split(' - ')[1], data.permissions.split(' - ')[0]) && (data.task_sequence !== 4 && data.task_sequence !== 6)">
                          <ProcessDialog
                            :data="data"
                            @task-uploaded="handlePostUpdated"
                          />
                        </VListItem>
                        <VListItem v-if="(data.status === 1) && ability.can('Reject', 'PPIC SAT Task') && data.task_sequence === 1">
                          <RejectDialog
                            :data="data"
                            @task-uploaded="handlePostUpdated"
                          />
                        </VListItem>
                        <VListItem v-if="(data.status === 1) && data.task_sequence === 4 && ability.can('Revised', 'BOA SAT Task')">
                          <RevisedDialog
                            :data="data"
                            @task-uploaded="handlePostUpdated"
                          />
                        </VListItem>
                        <!--
                          <VListItem
                          v-if="data.status === 1 && data.task_sequence > 4 && ability.can('Revoked', 'PPIC SAT Task')"
                          value="user"
                          @click="btnRevokeClickHandler(data.id)"
                          >
                          <VIcon
                          color="error"
                          size="24"
                          class="me-3"
                          icon="tabler-copy-x"
                          />
                          <ListItemTitle>Revoked</ListItemTitle>
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
