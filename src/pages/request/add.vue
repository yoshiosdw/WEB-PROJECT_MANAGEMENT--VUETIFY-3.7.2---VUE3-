<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import { requiredValidator } from '@/@core/utils/validators'
import Person from '@/pages/lookup/person.vue'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const formId = ref()
const documentTypeId = ref(null)
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
const approverName = ref('')
const approverNik = ref('')
const approverDepartment = ref('')
const approverPosition = ref('')
const requestForm = ref()

const selectedUserType = ref('same_as_requestor') 

const documentNumber = ref('F-ICT-005')

const device = ref([])
const deviceTypeId = ref(null)

const locations = ref([])

const isLoading = ref(true)
const savingProcess = ref(false)
const saved = ref(false)
const requestorNameId = ref()

const editableDepartment = ref(true)
const editablePosition = ref(true)

const router = useRouter()

const userData = JSON.parse(localStorage.getItem('sinarjoUserData'))

const getPerson = val => {
  if (val) {
    requestorName.value = val.name
    requestorNik.value = val.nik
    emailRequestor.value = val.email

    requestorNameId.value = val.id

    if (formType.value.id === 2) {
      requestorDeviceId.value = val.id
    }
  }
}

const formData = [
  {
    id: 1,
    name: "Same as requestor",
  }, {
    id: 2,
    name: "Other user",
  },
]

const formType = ref(formData[0])

watchEffect(()=>{
  if(formType.value.id == 1){
    editableDepartment.value = false
    editablePosition.value = false

    requestorName.value = userData.person.name
    requestorNameId.value = userData.person.id

    requestorNik.value = userData.person.nik || '-'
    requestorDepartment.value = userData.person.employee.organization.code 

    const roleParts = userData.role.split(' ')
    const position = roleParts[roleParts.length - 1]

    requestorPosition.value = position
    emailRequestor.value = userData.person.email || '-'
  } else {
    requestorName.value = '' 
    requestorNik.value = '' 
    requestorDepartment.value = ''
    requestorPosition.value = ''
    emailRequestor.value = ''
  }
})

const fetchgetDoc = async () => {
  isLoading.value = true
  try {
    const response = await axiosIns.get('/request/document' )

    documentTypeId.value = response.data.data[0].id
    
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
  fetchgetDoc()
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

const createRequest = async () => {
  savingProcess.value = true
  try {
    const ret = await axiosIns.post('/request/form', {

      document_type_id: documentTypeId.value,
      request_date: formatDateMySql(requestDate.value),

      is_same_as_requestor: formType.value.id, 
    
      requestor_employee_id: requestorNameId.value,
      requestor_nik: requestorNik.value,
      requestor_department: requestorDepartment.value,
      requestor_position: requestorPosition.value,
      ticket_number: ticketNumber.value,
      ext_number: extNumber.value,

      requestor_device_id: formType.value.id === 1 ? requestorNameId.value : requestorDeviceId.value,
      device_type_id: deviceTypeId.value,
      requestor_email: emailRequestor.value,
      detail_device_type: detailDeviceType.value,
      device_location_id: deviceLocationId.value,
      description: description.value,
      business_impact: businessImpact.value,
      business_benefit: businessBenefit.value,
      approver_employee_id: approverName.value,
      approver_nik: approverNik.value,
      approver_department: approverDepartment.value,
      approver_position: approverPosition.value,
    })

    savingProcess.value = false
    saved.value = true
    formId.value = ret.data.data.id

    router.push({ name: 'request' })
  } catch (error) {
    Swal.fire({
      title: 'DEV REQUEST',
      text: 'Create Request failed',
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
        createRequest()
      } else {
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
      <VCard :is-loading="isLoading">
        <VCardText>
          <VCardTitle>
            COMPUTER & DEVICE REQUEST FORM
          </VCardTitle>
          <VForm
            ref="requestForm"
            @submit.prevent="onSubmit"
          >
            <VRow class="mt-4 mx-1">
              <VCol cols="4">
                <VTextField
                  v-model="documentNumber"
                  label="Document Number"
                  readonly
                />
              </VCol>
              <VCol cols="4">
                <VDateInput
                  v-model="requestDate"
                  label="Request Date"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VDivider class="mt-4" />

            <VCardTitle class="mt-5">
              Detail Form
            </VCardTitle>
            <VRow class="mt-3 mx-1">
              <VCol cols="12">
                <VRadioGroup
                  v-model="formType"
                  inline
                >
                  <VRadio
                    v-for="type in formData"
                    :key="type.id"
                    :label="type.name"
                    :value="type"
                  />
                </VRadioGroup>
              </VCol>
            </VRow>

        
            <VRow class="mt-4 mx-1">
              <VCol
                cols="3"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="requestorName"
                  label="Requestor Name"
                  :rules="[requiredValidator]"
                  readonly
                />
                <Person
                  v-if="formType.id === 2" 
                  @person="getPerson"
                />
              </VCol>
              <VCol cols="2">
                <VTextField
                  v-model="requestorNik"
                  label="Req. NIK"
                  :rules="[requiredValidator]"
                  :readonly="selectedUserType === 'same_as_requestor'"
                />
              </VCol>

              <VCol cols="2">
                <VTextField
                  v-model="requestorDepartment"
                  label="Req. Depart"
                  :rules="[requiredValidator]"
                  :readonly="formType.id === 1"
                />
              </VCol>
           
              <VCol cols="2">
                <VTextField
                  v-model="requestorPosition"
                  label="Req. Position"
                  :rules="[requiredValidator]"
                  :readonly="formType.id === 1"
                />
              </VCol>

              <VCol cols="3">
                <VTextField
                  v-model="emailRequestor"
                  label="Email"
                  :rules="[requiredValidator]"
                  :readonly="selectedUserType === 'same_as_requestor'"
                />
              </VCol>
            </VRow>

            <VRow class="mt-2 mx-1">
              <VCol cols="4">
                <VTextField
                  v-model="approverName"
                  label="Approver Name"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="2">
                <VTextField
                  v-model="approverNik"
                  label="Approver Nik"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="approverDepartment"
                  label="Approver Department"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="approverPosition"
                  label="Approver Position"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VRow class="mt-2 mx-1">
              <VCol cols="4">
                <VTextField
                  v-model="ticketNumber"
                  label="Ticket Number"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="2">
                <VTextField
                  v-model="extNumber"
                  label="Ext Number"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="3">
                <VSelect
                  v-model="deviceTypeId"
                  label="Device Name"
                  :items="device"
                  item-title="device_name"
                  item-value="id"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="3">
                <VSelect
                  v-model="deviceLocationId"
                  label="Device Location"
                  :items="locations"
                  item-title="name"
                  item-value="id"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VRow class="mt-2 mx-1">
              <VCol cols="12">
                <VTextField
                  v-model="detailDeviceType"
                  label="Detail Device Type"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VRow class="mt-2 mx-1">
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  rows="2"
                  label="Description"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VRow class="mt-2 mx-1">
              <VCol cols="6">
                <VTextarea
                  v-model="businessImpact"
                  label="Business Impact"
                  rows="4"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="6">
                <VTextarea
                  v-model="businessBenefit"
                  rows="4"
                  label="Business Benefit"
                  :rules="[requiredValidator]"
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
                    Cancel
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
