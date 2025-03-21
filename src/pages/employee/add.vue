<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import Person from '@/pages/ticket/person.vue'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref, watch, watchEffect } from "vue"
import { useRouter } from 'vue-router'



const router = useRouter()
const refForm = ref()

const hideNextButton = ref(false)
const readonlyFields = ref(false)

// const document_number = ref('')
const loading = ref(true)
const saved = ref(false)
let errorMessage = ref()

const personName = ref()
const personNik = ref()
const personId = ref()
const person = ref()

const jobFunctions = ref()
const job = ref(null)

const business = ref()
const businessId = ref()
const bui = ref(null)

const departments = ref()
const departmentId = ref()
const departmentBiu = ref(null)
const companyEmail = ref()

const getPerson = val => {
 
  personName.value = val.person.name
  personNik.value = val.person.nik

  personId.value = val.person.id

}

const createEmployee = async () => {
  loading.value = true
  try {
    let organization_id, org_id

    if (departmentBiu.value) {
      organization_id = departmentBiu.value.guid
      org_id = departmentBiu.value.id
    } else if (bui.value) {
      organization_id = bui.value.guid
      org_id = bui.value.id
    } else {
      throw new Error('No organization data available.')
    }

    const formData = {
      person_id: personId.value,
      organization_id: organization_id,
      org_id: org_id,
      job_function_id: job.value || 0,
      company_email: companyEmail.value,
    }

    const ret = await axiosIns.post(`/employment/employees`, formData )

    loading.value = false
    clear()
    router.back()
    
  } catch(error) {
    if (error.response && error.response.data && error.response.data.message) {
      const errorMessage = error.response.data.message.toLowerCase()
      if (errorMessage.includes('duplicate entry')) {
        Swal.fire({
          title: 'Error',
          text: 'Duplicate entry detected.',
          icon: 'error',
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      }
    } else {
      Swal.fire({
        title: 'Error',
        text: 'An unexpected error occurred.',
        icon: 'error',
      })
    }
  }finally{loading.value = false}
}

const clear = () =>{

  personId.value = null
  job.value = null
  departmentId.value = null
  companyEmail.value = null
}

const fetchJobFunctions =  async () => {
  loading.value = true
  try {
    const response = await axiosIns.get('/job/functions' )

    jobFunctions.value = response.data.data
    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error, 
      icon: 'error',
    })
  }finally{loading.value = false}
}

const fetchBusinessUnit =  async () => {
  loading.value = true
  try {
    const response = await axiosIns.get('/organizations/getByBiu' )

    business.value = response.data.data
    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error, 
      icon: 'error',
    })
  }finally{loading.value = false}
}

const fetchDepartment =  async businessId => {
  loading.value = true
  try {
    const response = await axiosIns.get(`/organizations/departmentBiu/${businessId}` )

    departments.value = response.data.data
    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error, 
      icon: 'error',
    })
  }finally{loading.value = false}
}


watchEffect(() => {
  fetchJobFunctions()
  fetchBusinessUnit()
})

const guid = ref(null)
const id = ref(null)

watch(bui, newBuiId => {
  loading.value = true
  departmentBiu.value = null
  guid.value = null
  id.value = null
  if(newBuiId){
    guid.value = newBuiId.guid
    id.value = newBuiId.id
  }

  fetchDepartment(newBuiId.id)
  loading.value = false
})

watch(departmentBiu, newDepatmentBui => {
  loading.value = true
  if(newDepatmentBui){
    id.value = newDepatmentBui.id
  }
  loading.value = false

})

const back = () => {
  router.back()
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">    
        <VCardTitle>Setting Employee</VCardTitle>  
        <VOverlay />
        <VCardText>
          <VForm
            ref="refForm"
            enctype="multipart/form-data"
            @submit.prevent="createEmployee"
          >
            <VRow class="mt-6">
              <VCol
                cols="6"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="personName"
                  label="Select Person"
                  item-title="name"
                  item-value="id"
                  readonly
                  :rules="[requiredValidator]"
                />
                <Person
                  @person="getPerson"
                />
              </VCol>

              <VCol
                cols="3"
                class="d-flex gap-3"
              >
                <VAutocomplete
                  v-model="bui"
                  label="Business Unit"
                  item-title="name"
                  item-value="id"
                  return-object
                  :items="business"
                  :rules="[requiredValidator]"
                  :menu-props="{ maxHeight: '450px' }"
                />
              </VCol>

              <VCol
                cols="3"
                class="d-flex gap-3"
              >
                <VAutocomplete
                  v-model="departmentBiu"
                  label="Department "
                  item-title="name"
                  item-value="id"
                  return-object
                  :items="departments"
                  :menu-props="{ maxHeight: '450px' }"
                />
              </VCol>
            </VRow>

            <VRow class="mt-3">
              <VCol
                cols="6"
                class="d-flex gap-3"
              >
                <VAutocomplete
                  v-model="job"
                  label="Job Function"
                  item-title="name"
                  item-value="id"
                  :items="jobFunctions"
                  single-line
                  :menu-props="{ maxHeight: '450px' }"
                />
              </VCol>
              <VCol
                cols="6"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="companyEmail"
                  label="Company Email"
                />
              </VCol>
            </VRow>
           
            <VRow class="mt-3">
              <VCol
                cols="12"
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  type="submit"
                  color="success"
                  :readonly="loading"
                >
                  SAVE
                </VBtn>

               
                <VBtn
                  color="error"
                  :disabled="showLoading"
                  @click="back"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
