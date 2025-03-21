<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const routeId = ref(route.params.edit)
const formId = ref()
const docById = ref(null)

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

const requestDate = ref(new Date())
const requestorDepartment = ref('')
const requestorName = ref('')
const requestorNik = ref('')
const requestorPosition = ref('')
const ticketNumber = ref('')
const extNumber = ref('')
const emailRequestor = ref('')
const detailDeviceType = ref('')

const requestorDeviceId = ref('')
const deviceLocationId = ref('')

const description = ref('')
const businessImpact = ref('')
const businessBenefit = ref('')
const approverEmployeeId = ref('')
const requestForm = ref()

const device = ref([])
const deviceTypeId = ref(null)

const locations = ref([])

const isLoading = ref(false)
const savingProcess = ref(false)
const saved = ref(false)
const requestorNameId = ref()

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

const fetchgetDevice = async () => {
  isLoading.value = true
  try {
    const response = await axiosIns.get('/device' )

    device.value = response.data.data
    
    isLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load data Request',
      icon: 'error',
    })
    isLoading.value = false
    console.log(error)
  }
}

watchEffect(() => {
  fetchgetDevice()
})

const fetchLocation = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get('/locations' )

    locations.value = ret.data.data
    isLoading.value = false
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  } isLoading.value = false
}

watchEffect(() => {
  fetchLocation()
})

const editData = async id => {
  savingProcess.value = true
  try {
    const response = await axiosIns.patch(`/request/form/requestor/edit/${id}`, {

      requestor_email: reqEmail.value,

      device_type_id: devName.value.id,
      device_location_id: devLoc.value.id,

      detail_device_type: detailDeviceType.value,

      description: desc.value,
      business_impact: bussImpact.value,
      business_benefit: bussBen.value,

    })

    savingProcess.value = false
    saved.value = true

    router.push({ name: 'request' })

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
        editData(routeId.value)
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
        {{ routeId }}
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
                <VSelect
                  v-model="devName"
                  label="Device Name"
                  :items="device"
                  item-title="device_name"
                  item-value="id"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="3">
                <VSelect
                  v-model="devLoc"
                  label="Device Location"
                  :items="locations"
                  item-title="name"
                  item-value="id"
                  :rules="[requiredValidator]"
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
                />
              </VCol>
              <VCol cols="6">
                <VTextarea
                  v-model="bussBen"
                  rows="4"
                  label="Business Benefit"
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
                    Save
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
          <!--
            <VForm
            ref="requestForm"
            @submit.prevent="onSubmit"
            >
            <VRow
            class="mt-9 mx-1"
            >
            <VCol
            v-if="docById && docById.document_type"
            cols="4"
            >
            <VTextField
            v-model="docById.document_type.document_number"
            label="Document Number"
            readonly
            />
            </VCol>
            <VCol
            v-if="docById && docById.document_type"
            cols="4"
            >
            <VTextField
            v-model="docById.document_type.document_date"
            label="Request Date"
            readonly
            />
            </VCol>
            </VRow>

            <VRow class="mt-4 mx-1">
            <VCol
            v-if="docById && docById.requestor"
            cols="4"
            class="d-flex gap-4"
            >
            <VTextField
            v-model="docById.requestor.name"
            label="Requestor Name"
            />
            </VCol>
            <VCol
            v-if="docById && docById.requestor"
            cols="2"
            >
            <VTextField
            v-model="docById.requestor_nik"
            label="Requestor NIK"
            />
            </VCol>

            <VCol
            v-if="docById"
            cols="3"
            >
            <VTextField
            v-model="docById.requestor_department"
            label="Requestor Department"
            />
            </VCol>
           
            <VCol
            v-if="docById"
            cols="3"
            >
            <VTextField
            v-model="docById.requestor_position"
            label="Requestor Position"
            />
            </VCol>
            </VRow>

            <VRow class="mt-2 mx-1">
            <VCol
            v-if="docById"
            cols="7"
            >
            <VTextField
            v-model="docById.requestor_email"
            label="Email"
            />
            </VCol>

            <VCol
            v-if="docById"
            cols="5"
            >
            <VTextField
            v-model="docById.approver_employee_id"
            label="Approver Employee"
            />
            </VCol>
            </VRow>

            <VRow
            v-if="docById"
            class="mt-2 mx-1"
            >
            <VCol cols="4">
            <VTextField
            v-model="docById.ticket_number"
            label="Ticket Number"
            />
            </VCol>
            <VCol cols="2">
            <VTextField
            v-model="docById.ext_number"
            label="Ext Number"
            />
            </VCol>

            <VCol
            v-if="docById && docById.device_requestor"
            cols="3"
            >
            <VTextField
            v-model="docById.device_requestor.device_name"
            label="Device Name"
            />
            </VCol>

            <VCol
            v-if="docById && docById.device_location"
            cols="3"
            >
            <VTextField
            v-model="docById.device_location.name"
            label="Device Location"
            />
            </VCol>
            </VRow>

            <VRow
            v-if="docById"
            class="mt-2 mx-1"
            >
            <VCol cols="12">
            <VTextField
            v-model="docById.detail_device_type"
            label="Detail Device Type"
            />
            </VCol>
            </VRow>

            <VRow
            v-if="docById"
            class="mt-2 mx-1"
            >
            <VCol cols="12">
            <VTextarea
            v-model="docById.description"
            rows="2"
            label="Description"
            />
            </VCol>
            </VRow>

            <VRow
            v-if="docById"
            class="mt-2 mx-1"
            >
            <VCol cols="6">
            <VTextarea
            v-model="docById.business_impact"
            label="Business Impact"
            rows="4"
            />
            </VCol>
            <VCol cols="6">
            <VTextarea
            v-model="docById.business_benefit"
            rows="4"
            label="Business Benefit"
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
            Saved
            </VBtn>
            </div>
            </VCol>
            </VRow>
            </VForm>
          -->
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
