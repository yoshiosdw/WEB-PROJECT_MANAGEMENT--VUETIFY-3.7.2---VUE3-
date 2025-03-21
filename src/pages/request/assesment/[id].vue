<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const routeId = ref(route.params.id)
const formId = ref()
const docById = ref(null)

const requestForm = ref()
const formAssesment = ref()

const docNo = ref(null)
const docDate = ref(null)

const reqName = ref(null)
const reqNik = ref(null)
const reqDepart = ref(null)
const reqPos = ref(null)

const appName = ref(null)
const appNik = ref(null)
const appDepart = ref(null)
const appPos = ref(null)

const ticket = ref(null)
const ext = ref(null)
const devName = ref(null)
const devLoc = ref(null)
const reqEmail = ref(null)

const detailDevType = ref(null)
const desc = ref(null)
const bussImpact = ref(null)
const bussBen = ref(null)

const isLoading = ref(true)
const savingProcess = ref(false)
const saved = ref(false)

const isDialogVisible = ref(false)

const router = useRouter()


const fetchgetId = async id => {
  isLoading.value = true
  try {
    const response = await axiosIns.get(`/request/form/${id}` )

    docById.value = response.data.data
    docNo.value = response.data.data.document_type.document_number
    docDate.value = response.data.data.document_type.document_date

    reqName.value = response.data.data.requestor.name
    reqNik.value = response.data.data.requestor_nik
    reqDepart.value = response.data.data.requestor_department
    reqPos.value = response.data.data.requestor_position
    reqEmail.value = response.data.data.requestor_email

    appName.value = response.data.data.approver_employee_id
    appNik.value = response.data.data.approver_nik
    appDepart.value = response.data.data.approver_department
    appPos.value = response.data.data.approver_position

    ticket.value = response.data.data.ticket_number
    ext.value = response.data.data.ext_number
    devName.value = response.data.data.device_requestor.device_name
    devLoc.value = response.data.data.device_location.name

    detailDevType.value = response.data.data.detail_device_type
    desc.value = response.data.data.description
    bussImpact.value = response.data.data.business_impact
    bussBen.value = response.data.data.business_benefit
    
    isLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load data Document',
      icon: 'error',
    })
    isLoading.value = false
    console.log(error)
  }
}

watchEffect(() => {
  fetchgetId(routeId.value)
})


const approve = async id => {
  savingProcess.value = true
  try {
    const response = await axiosIns.patch(`/request/form/approval_req/${id}`, {
      business_impact: bussImpact.value,
      business_benefit: bussBen.value,
    })

    savingProcess.value = false
    saved.value = true
    isDialogVisible.value = false
    fetchgetId(routeId)

    router.push({ name: 'request' })

    // const newItem = ret.data.data 

  } catch (error) {
    Swal.fire({
      title: 'DEV REQUEST',
      text: error,
      icon: 'error',
    })
    savingProcess.value = false
    saved.value = false
    console.log(error)
  }
}

const onSubmit = () => {
  requestForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
    {
      if(!saved.value){
        approve(routeId)
        isDialogVisible.value = false
      } else {
        isDialogVisible.value = false
      }
    }
  })
}

const reject = async id => {
  savingProcess.value = true
  try {
    const response = await axiosIns.patch(`/request/form/reject/${id}`, {
      business_impact: bussImpact.value,
      business_benefit: bussBen.value,
    })

    savingProcess.value = false
    saved.value = true
    isDialogVisible.value = false
    fetchgetId(routeId)

    router.push({ name: 'request' })

    // const newItem = ret.data.data 

  } catch (error) {
    Swal.fire({
      title: 'DEV REQUEST',
      text: error,
      icon: 'error',
    })
    savingProcess.value = false
    saved.value = false
    console.log(error)
  }
}

const btnRejectClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure Reject data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'error',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, Reject it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      reject(routeId)
    }
  })
}

const createAssesment = async id => {
  savingProcess.value = true
  try {
    const response = await axiosIns.post(`/request/form/assessment/${id}`, {
      business_impact: bussImpact.value,
      business_benefit: bussBen.value,
    })

    savingProcess.value = false
    saved.value = true
    isDialogVisible.value = false
    fetchgetId(routeId)

    router.push({ name: 'request' })

    // const newItem = ret.data.data 

  } catch (error) {
    Swal.fire({
      title: 'DEV REQUEST',
      text: error,
      icon: 'error',
    })
    savingProcess.value = false
    saved.value = false
    console.log(error)
  }
}

const submit = () => {
  formAssesment.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
    {
      if(!saved.value){
        createAssesment(routeId)
        isDialogVisible.value = false
      } else {
        isDialogVisible.value = false
      }
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <Resume />
      <VSpacer class="mt-5" />
      <VCard :loading="isLoading">
        <VCardText>
          <VCardTitle>
            COMPUTER & DEVICE REQUEST FORM
          </VCardTitle>
          <VForm
            ref="requestForm"
            @submit.prevent="onSubmit"
          >
            <VRow
              class="mt-9 mx-1"
            >
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="docNo"
                  label="Document Number"
                  readonly
                />
              </VCol>
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="docDate"
                  label="Request Date"
                  readonly
                />
              </VCol>
            </VRow>

            <VRow class="mt-4 mx-1">
              <VCol
                cols="3"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="reqName"
                  label="Requestor Name"
                  readonly
                />
              </VCol>
              <VCol cols="2">
                <VTextField
                  v-model="reqNik"
                  label="Req. NIK"
                  readonly
                />
              </VCol>

              <VCol cols="2">
                <VTextField
                  v-model="reqDepart"
                  label="Req. Depart"
                  readonly
                />
              </VCol>
           
              <VCol cols="2">
                <VTextField
                  v-model="reqPos"
                  label="Req. Position"
                  readonly
                />
              </VCol>

              <VCol cols="3">
                <VTextField
                  v-model="reqEmail"
                  label="Email"
                  readonly
                />
              </VCol>
            </VRow>

            <VRow class="mt-2 mx-1">
              <VCol cols="4">
                <VTextField
                  v-model="appName"
                  label="Approver Name"
                  readonly
                />
              </VCol>
              <VCol cols="2">
                <VTextField
                  v-model="appNik"
                  label="Approver Nik"
                  readonly
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="appDepart"
                  label="Approver Department"
                  readonly
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="appPos"
                  label="Approver Position"
                  readonly
                />
              </VCol>
            </VRow>

            <VRow class="mt-2 mx-1">
              <VCol cols="4">
                <VTextField
                  v-model="ticket"
                  label="Ticket Number"
                  readonly
                />
              </VCol>
              <VCol cols="2">
                <VTextField
                  v-model="ext"
                  label="Ext Number"
                  readonly
                />
              </VCol>

              <VCol cols="3">
                <VTextField
                  v-model="devName"
                  label="Device Name"
                  readonly
                />
              </VCol>

              <VCol cols="3">
                <VTextField
                  v-model="devLoc"
                  label="Device Location"
                  readonly
                />
              </VCol>
            </VRow>

            <VRow
              class="mt-2 mx-1"
            >
              <VCol cols="12">
                <VTextField
                  v-model="detailDevType"
                  label="Detail Device Type"
                  readonly
                />
              </VCol>
            </VRow>

            <VRow
              class="mt-2 mx-1"
            >
              <VCol cols="12">
                <VTextarea
                  v-model="desc"
                  rows="2"
                  label="Description"
                  readonly
                />
              </VCol>
            </VRow>

            <VRow
              class="mt-2 mx-1"
            >
              <VCol cols="6">
                <VTextarea
                  v-model="bussImpact"
                  label="Business Impact"
                  rows="4"
                  readonly
                />
              </VCol>
              <VCol cols="6">
                <VTextarea
                  v-model="bussBen"
                  rows="4"
                  label="Business Benefit"
                  readonly
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>

      <VCard
        :loading="isLoading"
        class="mt-10"
      >
        <VCardText>
          <VCardTitle>
            ASSESSMENT & RECOMMENDATION
          </VCardTitle>
          <VForm
            ref="formAssesment"
            @submit.prevent="submit"
          >
            <VRow
              class="mt-9 mx-1"
            >
              <VCol
                cols="4"
              >
                <VDateInput
                  label="Assesment Date"
                />
              </VCol>

              <VCol
                cols="4"
              >
                <VTextField
                  label="Assessed by / Support"
                />
              </VCol>

              <VCol
                cols="4"
              >
                <VTextField
                  label="Position"
                />
              </VCol>
            </VRow>

            <VRow
              class="mt-3 mx-1"
            >
              <VCol
                cols="4"
              >
                <VDateInput
                  label="IMEM Date"
                />
              </VCol>

              <VCol
                cols="4"
              >
                <VTextField
                  label="IMEM Number"
                />
              </VCol>

              <VCol
                cols="4"
              >
                <VTextField
                  label="IMEM by"
                />
              </VCol>
            </VRow>

            <VRow
              class="mt-3 mx-1"
            >
              <VCol
                cols="12"
              >
                <VTextarea
                  label="IMEM Subject"
                  rows="1"
                />
              </VCol>
            </VRow>

            <VRow
              class="mt-3 mx-1"
            >
              <VCol
                cols="12"
              >
                <VTextarea
                  label="Verification Notes"
                  rows="2"
                />
              </VCol>
            </VRow>

            <VRow
              class="mt-3 mx-1"
            >
              <VCol
                cols="3"
              >
                <VTextField
                  label="Access Reviewer"
                />
              </VCol>

              <VCol
                cols="3"
              >
                <VTextField
                  label="Position"
                />
              </VCol>
              <VCol
                cols="3"
              >
                <VTextField
                  label="Access Approval"
                />
              </VCol>

              <VCol
                cols="3"
              >
                <VTextField
                  label="Position"
                />
              </VCol>
            </VRow>

            <VRow
              class="mt-3 mx-1"
            >
              <VCol
                cols="12"
              >
                <VTextarea
                  label="Departement Head Notes"
                  rows="2"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4 mx-4 mt-3">
                  <VBtn
                    v-if="!saved"
                    :to="{name: 'request'}"
                    color="warning"
                    :disabled="savingProcess"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    v-if="saved"
                    :to="{name: 'request'}"
                    color="warning"
                    :disabled="savingProcess"
                  >
                    Close
                  </VBtn>

                  <VBtn
                    color="success"
                    type="submit"
                    :disabled="savingProcess"
                  >
                    Process
                  </VBtn>
                  <VBtn
                    color="success"
                    :disabled="savingProcess"
                    @click="btnRejectClickHandler"
                  >
                    Reject
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
      <VProgressLinear
        v-if="savingProcess"
        :height="4"
        color="primary"
        indeterminate
      />
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta: 
    action: Manage
    subject: Return
    redirectIfLoggedIn: false
</route>
