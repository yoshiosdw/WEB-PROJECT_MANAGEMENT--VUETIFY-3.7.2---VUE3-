<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import Person from '@/pages/ticket/person.vue'
import axiosIns from "@/plugins/axios"
import router from "@/router"
import Swal from "sweetalert2"
import { useRoute } from 'vue-router'

const route = useRoute()

const IdEmployee = ref(route.params.id)

const refForm = ref()

const showLoading = ref(true)
const savingProcess = ref(false)

const employee = ref ()

const loading = ref(true)

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


const fetchEmployee = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/employment/employees/${IdEmployee.value}` )

    employee.value = ret.data.data[0]

    const parent = employee.value.parent?.[0]
    const children = parent?.children?.[0]
    const grandChildren = children?.children?.[0]
    const greatGrandChildren = grandChildren?.children?.[0]

    // Set bui value first
    if (children?.name) {
      bui.value = children.name

      const businessIdVal = children.id
      if (businessIdVal) {
        businessId.value = businessIdVal
        await fetchDepartment(businessIdVal)
      }
    }

    // Then set departmentBiu
    if (greatGrandChildren?.name) {
      departmentBiu.value = greatGrandChildren.name
    } else if (grandChildren?.name) {
      departmentBiu.value = grandChildren.name
    } else if (children?.name) {
      departmentBiu.value = children.name
    }


    personName.value = employee.value.person?.name || "-"
    job.value = employee.value.job_function?.name || "-"
    companyEmail.value = employee.value.company_email || "-"

  } catch (error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  } finally {
    showLoading.value = false
  }
}

const fetchJobFunctions =  async () => {
  showLoading.value = true
  try {
    const response = await axiosIns.get('/job/functions' )

    jobFunctions.value = response.data.data
    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error, 
      icon: 'error',
    })
  }finally{showLoading.value = false}
}

const fetchBusinessUnit =  async () => {
  showLoading.value = true
  try {
    const response = await axiosIns.get('/organizations/getByBiu' )

    business.value = response.data.data
    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error, 
      icon: 'error',
    })
  }finally{showLoading.value = false}
}

const fetchDepartment =  async businessId => {
  if (!businessId) return
  showLoading.value = true
  try {
    const response = await axiosIns.get(`/organizations/departmentBiu/${businessId}` )

    departments.value = response.data.data
    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error, 
      icon: 'error',
    })
  }finally{showLoading.value = false}
}

const updateEmployee = async() => {
  showLoading.value = true
  try {
    const response = await axiosIns.patch(`/employment/employees/${IdEmployee.value}`, {

      person_id: personId.value || employee.value.person.id,
      organization_id:guid.value || employee.value.organization.guid,
      org_id:id.value || employee.value.organization.id,
      job_function_id:job.value || employee.value.job_function.id,
      company_email:companyEmail.value || employee.value.company_email,
      
    } )

    showLoading.value = false

    router.back()
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
    showLoading.value = false
  }
}

watchEffect(() => {
  fetchEmployee()
  fetchJobFunctions()
  fetchBusinessUnit()

})

const guid = ref(null)
const id = ref(null)

watch(bui, async newBuiId => {
  if (!newBuiId) return

  loading.value = true
  departmentBiu.value = null
  guid.value = null
  id.value = null

  if (newBuiId) {
    guid.value = newBuiId.guid
    id.value = newBuiId.id
    if (newBuiId.id) {
      await fetchDepartment(newBuiId.id)
    }
  }
  loading.value = false
})


watch(departmentBiu, newDepatmentBui => {
  loading.value = true
  if(newDepatmentBui){
    id.value = newDepatmentBui.id
  }
  loading.value = false

})


const onSubmit = () => {
  refForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) updateEmployee()
  })
}

const back = () => {
  router.back()
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">    
        <VCardTitle>Update Employee</VCardTitle>  
        <VOverlay />
        <VCardText>
          <VForm
            ref="refForm"
            enctype="multipart/form-data"
            @submit.prevent="onSubmit"
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
                <VSelect
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
                <VSelect
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
                <VSelect
                  v-model="job"
                  label="Job Function"
                  item-title="name"
                  item-value="id"
                  :items="jobFunctions"
                  clearable
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
                  Update
                </VBtn>

               
                <VBtn
                  color="error"
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
    subject: Organization
    redirectIfLoggedIn: false
  </route>
