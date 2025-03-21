<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { VDateInput } from 'vuetify/lib/labs/components.mjs'
import { usePersonStore } from './usePersonStore'

const emits = defineEmits(['status'])
const personStore = usePersonStore()
const personForm = ref()
const citizen_id_number = ref()
const name = ref('')
const date_of_birth = ref()
const birth_place = ref()
const religion = ref()
const gender = ref()
const blood_type = ref()
const marital_status_id = ref()
const address = ref()
const kelurahan = ref()
const kecamatan = ref()
const postal_code = ref()
const city = ref()
const province = ref()
const phone_number = ref()
const email = ref()
const savingProcess = ref(false)

const maritalStatus = ref()

const errors = ref({
  name: undefined,
})

const sendStatusToParent = status => {
  emits('status', status)
}

const fetchMaritalStatusLoading = ref(true)

const fetchMaritalStatus = async () => {
  fetchMaritalStatusLoading.value = true
  try {
    const response = await axiosIns.get('/marital/statuses' )

    maritalStatus.value = response.data.data
    fetchMaritalStatusLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load data Martial Status',
      icon: 'error',
    })
    console.log(error)
    fetchMaritalStatusLoading.value = false
  }
}

const createPerson = async () => {
  savingProcess.value = true
  try {
    const response = await axiosIns.post('/people',{
      citizen_id_number: citizen_id_number.value,
      name: name.value,
      gender: gender.value.id,
      date_of_birth: formatDateMySql(date_of_birth.value),
      blood_type: blood_type.value,
      birth_place: birth_place.value,
      religion: religion.value,
      address: address.value,
      city: city.value,
      postal_code: postal_code.value,
      marital_status_id: marital_status_id.value.id,
      phone_number: phone_number.value,
      email: email.value,
    } )

    savingProcess.value = false
    personStore.person = response.data.data
    sendStatusToParent(true)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Create Person failed',
      icon: 'error',
    })
    savingProcess.value = false
    console.log(error)
  }
}

watchEffect(() => {
  fetchMaritalStatus()
})

const onSubmit = () => {
  personForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      createPerson()
  })
}
</script>

<template>
  <VRow>
    <VCol
      v-if="!fetchMaritalStatusLoading"
      cols="12"
    >
      <VForm
        ref="personForm"
        @submit.prevent="onSubmit"
      >
        <VRow>
          <VCol cols="3">
            <VTextField 
              v-model="citizen_id_number"
              :rules="[requiredValidator]"
              label="Id Number"
            />
          </VCol>
          <VCol cols="6">
            <VTextField 
              v-model="name"
              :rules="[requiredValidator]"
              label="Name"
            />
          </VCol>
          <VCol cols="3">
            <VSelect 
              v-model="gender"
              label="Gender"
              :items="[{id: 0, name: 'Male'},{id: 1, name: 'Female'}]"
              item-title="name"
              item-value="id"
              single-line
              return-object
              :rules="[requiredValidator]"
            >
              Gender
            </VSelect>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="3">
            <VDateInput 
              v-model="date_of_birth"
              label="Date of Birth"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="3">
            <VSelect 
              v-model="blood_type"
              label="Blood Type"
              :items="['O', 'A', 'B', 'AB']"
            >
              Blood Type
            </VSelect>
          </VCol>
          <VCol cols="3">
            <VTextField 
              v-model="birth_place"
              label="Birth Place"
            />
          </VCol>
          <VCol cols="3">
            <VSelect 
              v-model="religion"
              label="Religion"
              :items="['ISLAM', 'KRISTEN', 'KATHOLIK', 'HINDU','BUDHA', 'OTHER']"
            >
              Religion
            </VSelect>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="6">
            <VTextField 
              v-model="address"
              :rules="[requiredValidator]"
              label="Adress"
            />
          </VCol>
          <VCol cols="3">
            <VTextField 
              v-model="city"
              :rules="[requiredValidator]"
              label="City"
            />
          </VCol>
          <VCol cols="3">
            <VTextField 
              v-model="postal_code"
              label="Postal Code"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="3">
            <VSelect 
              v-model="marital_status_id"
              label="Marital Status"
              :items="maritalStatus"
              item-title="name"
              item-value="id"
              single-line
              return-object
              :rules="[requiredValidator]"
            >
              Marital Status
            </VSelect>
          </VCol>
          <VCol cols="3">
            <VTextField 
              v-model="phone_number"
              :rules="[requiredValidator]"
              label="Phone Number"
            />
          </VCol>
          <VCol cols="6">
            <VTextField 
              v-model="email"
              label="Email"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <div class="d-flex justify-end gap-4">
              <VBtn
                :to="{name: 'person'}"
                color="warning"
              >
                Cancel
              </VBtn>
              <VBtn type="submit">
                Apply
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VForm>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta: 
    action: Read
    subject: Dashboard
    redirectIfLoggedIn: false
</route>
