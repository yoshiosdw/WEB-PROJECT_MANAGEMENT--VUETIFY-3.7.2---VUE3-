<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import Device from '@/pages/ticket/form/device.vue'
import Person from '@/pages/ticket/person.vue'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from "vue"
import { useRouter } from 'vue-router'


const props = defineProps({
  departmentsId: {
    type: String,
    default: null,
  },
})


const emits = defineEmits(['ticketCreated'])

const router = useRouter()
const refForm = ref()
const sinarjoUserData = ref(JSON.parse(localStorage.getItem('sinarjoUserData')))

const selectedFile = ref(null)
const employeeId = ref(null)
const employeeName = ref(null)
const ticketTypeValue = ref([])
const selectedTicketSubCategory = ref('')

const ticketCategoryValue = ref([])
const subCategoryValue = ref([])
const selectedDepartment = ref(null)
const ticketId = ref('')
const ticketCreated = ref(false)
const extension_number = ref('')
const ip_address = ref('')
const business_benefit = ref('')
const business_impact = ref('')
const description = ref('')
const ticketType = ref()
const ticketCategory = ref()
const subCategory = ref()
const attachment = ref()
const attachFile = ref()

const departments = ref()
const departName = ref ()

const location = ref()
const locationId = ref()
const buildingId = ref()
const floorId = ref()

const siteLocation = ref([])
const buildingLocation = ref([])
const floorLocation = ref([])

const formRequest = ref()
const showVSelect = ref(false)
const selectedRequest = ref(null)

const hideNextButton = ref(false)
const readonlyFields = ref(false)

// const document_number = ref('')
const loading = ref(true)
const saved = ref(false)
let errorMessage = ref()

const approvalName = ref()
const approvalNik = ref()
const approvalId = ref()

const getApprovalPerson = val => {
 
  approvalName.value = val.person.name
  approvalNik.value = val.person.nik

  approvalId.value = val.id

}


const createTicket = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    if(attachFile.value) {
      formData.append('attachment', attachFile.value)
    }

    // formData.append('location_id', floorId.value ? floorId.value : buildingId.value)
    if (ticketType.value.name === 'Request') {
      formData.append('approval_id', approvalId.value)
    }

    const locationIdStr = String(locationId.value)
    if (locationIdStr === '111') {
      formData.append('location_id', locationIdStr)
    } else {
      formData.append('location_id', floorId.value ? floorId.value : buildingId.value)
    }


    formData.append('extension_number', extension_number.value)
    formData.append('ip_address', ip_address.value)
    formData.append('form_requests_id', selectedRequest.value)
    formData.append('description', description.value)
    formData.append('ticket_types_id', ticketType.value.id)
    formData.append('business_benefit', business_benefit.value)
    formData.append('business_impact', business_impact.value)
    formData.append('ticket_category_id', ticketCategory.value)
    if (props.departmentsId !== null) {
      formData.append('ticket_department_id', props.departmentsId)
    } else {
      formData.append('ticket_department_id', selectedDepartment.value)
    }
    formData.append('ticket_sub_category_id', subCategory.value)

    const ret = await axiosIns.post(`/tickets`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
        'Content-Type': 'multipart/form-data',
      },
    })

    ticketCreated.value = true
  
    if (ticketType.value.name === 'Complain' || (ticketType.value.name === 'Request' && selectedRequestName.value !== 'COMPUTER & DEVICE REQUEST')) {
      router.push('/home')
    }

    ticketId.value = ret.data.data.id

    emits('ticketCreated', ticketId.value)
    
    saved.value = true
    if (ticketType.value.name === 'Request') {
      hideNextButton.value = true
      readonlyFields.value = true
    }
    loading.value = false
    
  } catch(error) {
    const errorMessage = getErrorMessage(error)

    Swal.fire({
      title: 'Ticket',
      text: errorMessage,
      icon: 'error',
    })
    loading.value = false
  }
}

const clear = () =>{
  attachFile.value = null

  locationId.value = null
  buildingId.value = null
  floorId.value = null
  extension_number.value = ''
  ip_address.value = ''
  description.value = ''
  ticketType.value = null
  business_benefit.value = ''
  business_impact.value = ''
  ticketCategory.value = null
  subCategory.value = null
}


const getErrorMessage = error => {
  if (error.response && error.response.status === 400 && error.response.data && error.response.data.message) {
    const errorFields = error.response.data.message

    const formattedErrors = Object.keys(errorFields).map(field => {
      const fieldLabel = getFieldLabel(field)
      const errorMessage = errorFields[field][0]

      if (field === 'extension_number' && errorMessage === 'The extension number must be a number.') {
        return 'extension number not Valid'
      } else if (field === 'ip_address' && errorMessage === 'The ip address must be a valid IP address.') {
        return 'IP address not Valid'
      } else {
        return `${fieldLabel}`
      }
    
    })

    return `Please fill field: ${formattedErrors.join(", ")}`
  } else {
    return 'Create Ticket Failed.'
  }
}


const getFieldLabel = field => {
  switch (field) {
  case 'description':
    return 'field description'
  case 'location_id':
    return 'field location'
  case 'ticket_category_id':
    return 'field category'
  case 'ticket_sub_category_id':
    return 'field sub category'
  default:
    return field
  }
}

const handleFileChange = event => {
  attachFile.value = event.target.files[0]
}

const fetchEmployeeId = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/people/${sinarjoUserData.value.person.id}` )

    employeeId.value = ret.data.data.id
    employeeName.value = ret.data.data.name
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to get employee',
      icon: 'error',
    })
    loading.value = false
  }
}


const fetchDepart = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/ticket/departments` )

    departments.value = ret.data.data

    departName.value = ret.data.data[0].name
    selectedDepartment.value = ret.data.data[0].id

    // departId.value = ret.data.data.id
    loading.value = false

  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}


const fetchRequest = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/form/request` )

    
    formRequest.value = ret.data.data
    console.log("API Response:", ret.data.data); // Log hasil API
    formRequest.value = Array.isArray(ret.data.data) ? ret.data.data : [];
    loading.value = false

  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to get Data',
      icon: 'error',
    })
    loading.value = false
  }
}

const fetchTicketType = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/ticket/types' )

    // ticketType.value = ticketTypeValue.value.find(type => type.name === 'Complain')

    ticketTypeValue.value = ret.data.data
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to get ticket types',
      icon: 'error',
    })
    loading.value = false
  }
}

onMounted(async () => {
  await fetchTicketType() 
  ticketType.value = ticketTypeValue.value.find(type => type.name === 'Complain')
})

const fetchTicketCategory = async departmentId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/ticket/categories/by/${departmentId}` )

    ticketCategoryValue.value = ret.data.data
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Failed to get data for ticket categories.',
      icon: 'error',
    })
  }
}


const fetchSubCategory = async categoryId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/ticket/sub/categories/by/${categoryId}` )

    subCategoryValue.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Get data failed',
      icon: 'error',
    })
  }
}


const fetchLocation = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/locations/getlocation/ticket` )

    siteLocation.value = ret.data.data
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Failed to get Location',
      icon: 'error',
    })
  }
}

const fetchSubBuilding = async locationId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/locations/building/${locationId}` )

    buildingLocation.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Get data failed',
      icon: 'error',
    })
  }
}

const fetchSubFloor = async buildingId => {
  loading.value = true
  if (!buildingId) return
  try {
    const ret = await axiosIns.get(`/locations/getlocation/floor/${buildingId}` )

    floorLocation.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Get data failed',
      icon: 'error',
    })
  }
}

const fileUpload = event => {
  const file = event.target.files[0]

  attachment.value = file
}

watchEffect(() => {
  fetchDepart()
  fetchEmployeeId()
  fetchRequest()

  fetchLocation()
})


watch(locationId, newLocationId => {
  loading.value = true
  buildingId.value = null
  if (newLocationId){
    fetchSubBuilding(newLocationId)
  }
  loading.value = false
})


watch(buildingId, newBuildingId => {
  loading.value = true
  floorId.value = null
  if (newBuildingId){
    fetchSubFloor(newBuildingId) 
  }
  loading.value = false
})


const goBack = () => {
  router.back()
}

// watchEffect(() => {
//   if (selectedDepartment.value !== null) {
//     fetchTicketCategory(selectedDepartment.value)
//   }
// })

watchEffect(() => {
  if (props.departmentsId !== null) {
    fetchTicketCategory(props.departmentsId)
  } else {
    fetchTicketCategory(selectedDepartment.value)
  }
})


watch(ticketType, async newTicketType => {
  if (newTicketType && newTicketType.name === 'Request') {
    await fetchRequest()

    showVSelect.value = true
  } else {
    showVSelect.value = false
  }
})


watch(ticketCategory, newCategoryId => {
  loading.value = true
  subCategory.value = null

  fetchSubCategory(newCategoryId)
  loading.value = false
})

const filteredTicketTypes = computed(() => {
  if (props.departmentsId !== null) {
    return ticketTypeValue.value.filter(type => type.name === 'Complain')
  } else {
    return ticketTypeValue.value
  }
})

// watch(selectedRequest, newVal => {
//   const selectedRequestObj = formRequest.value.find(request => request.id === newVal)
//   if (selectedRequestObj && selectedRequestObj.name !== 'COMPUTER & DEVICE REQUEST') {
//     Swal.fire({
//       title: 'Form is still coming soon',
//       text: 'This form is not yet available',
//       icon: 'info',
//     })
//   }
// })

const selectedRequestName = computed(() => {
  const requestObj = formRequest.value.find(request => request.id === selectedRequest.value)
  
  return requestObj ? requestObj.name : ''
})

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      createTicket()
    }
  })
}

const computedRulesBuilding = computed(() => {
  const locationIdStr = String(locationId.value)
  
  return locationIdStr === '111' ? [] : [requiredValidator]
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard
       
        :loading="loading"
      >    
        <VCardTitle>
          {{ props.departmentsId !== null ? 'Ticket GA' : 'Ticket ICT' }}
        </VCardTitle>

        <VOverlay />
        <VCardText>
          <VForm
            ref="refForm"
            enctype="multipart/form-data"
            @submit.prevent="validateFom"
          >
            <VRow>
              <VCol cols="6">
                <VRadioGroup
                  v-if="!props.departmentsId"
                  v-model="ticketType"
                  inline 
                  :rules="[requiredValidator]"
                >
                  <VRadio 
                    v-for="hal in filteredTicketTypes"
                    :key="hal.id" 
                    :label="hal.name" 
                    :value="hal" 
                    :readonly="readonlyFields"
                  />
                </VRadioGroup>
              <!-- {{ ticketType }} -->
              </VCol>
            </VRow>

            <VRow class="mt-6">
              <VCol
                v-if="showVSelect"
                cols="6"
              >
                <VSelect
                  v-model="selectedRequest"
                  :items="formRequest"
                  item-title="name"
                  item-value="id"
                  label="Type Request"
                  :readonly="readonlyFields"
                />
              </VCol>

              <VCol
                v-if="showVSelect"
                cols="6"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="approvalName"
                  label="Approver Name"
                  item-title="name"
                  item-value="id"
                  readonly
                  :rules="[requiredValidator]"
                />
                <Person
                  @person="getApprovalPerson"
                />
              </VCol>
            </VRow>

            <VRow class="mt-3">
              <VCol cols="4">
                <VSelect
                  v-model="locationId"
                  item-title="name"
                  item-value="id"
                  :items="siteLocation"
                  :readonly="readonlyFields"
                  label="location Site"
                  :rules="[requiredValidator]"
                />
                <template #prepend-item>
                  <small v-if="siteLocation && siteLocation.keterangan">{{ siteLocation.keterangan }}</small>
                </template>
              </VCol>

              <VCol cols="4">
                <VSelect
                  v-model="buildingId"
                  item-title="name"
                  item-value="id"
                  :items="buildingLocation"
                  :readonly="readonlyFields"
                  label="Building"
                  :rules="computedRulesBuilding"
                  :menu-props="{ maxHeight: '300px' }"
                />
              </VCol>

              <VCol cols="4">
                <VSelect
                  v-model="floorId"
                  item-title="name"
                  item-value="id"
                  :readonly="readonlyFields"
                  :items="floorLocation"
                  label="Floor"
                  @change="fetchSubFloor(buildingId)"
                />
              </VCol>
            </VRow>

            <VRow class="mt-3">
              <VCol cols="4">
                <VSelect 
                  v-model="ticketCategory"
                  :readonly="readonlyFields"
                  :items="ticketCategoryValue"
                  item-title="name"
                  item-value="id"
                  label="Category"
                  :menu-props="{ maxHeight: '300px' }"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <!-- {{ ticketCategory }} -->
              <VCol cols="4">
                <VSelect 
                  v-model="subCategory"
                  :readonly="readonlyFields"
                  :items="subCategoryValue"
                  item-title="name"
                  item-value="id"
                  label="Sub Category"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="4">
                <VFileInput 
                  v-model="attachment"
                  :disabled="readonlyFields"
                  label="Attach File"
                  accept=".pdf, .xlsx"
                  clearable
                  @change="handleFileChange"
                />
              </VCol>
            </VRow>

            <VRow
              class="mt-3"
            >
              <VCol cols="4">
                <VTextField
                  id="extension_number"
                  v-model="extension_number"
                  :readonly="readonlyFields"
                  label="Extension Number"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  id="ip_address"
                  v-model="ip_address"
                  :readonly="readonlyFields"
                  label="IP Adress"
                />
              </VCol>
            </VRow>            

            <VRow class="mt-3">
              <VCol cols="12">
                <VTextarea
                  id="description"
                  v-model="description"
                  :readonly="readonlyFields"
                  rows="2"
                  :rules="[requiredValidator]"
                  label="Description"
                />
              </VCol>
            </VRow>

            <VRow class="mt-3">
              <VCol cols="6">
                <VTextarea
                  id="business_impact"
                  v-model="business_impact"
                  :readonly="readonlyFields"
                  rows="2"
                  label="Business Impact"
                />
              </VCol>
              <VCol cols="6">
                <VTextarea
                  id="business_benefit"
                  v-model="business_benefit"
                  rows="2"
                  label="Business Benefit"
                  :readonly="readonlyFields"
                />
              </VCol>
            </VRow>

            <VRow class="mt-3">
              <VCol
                cols="12"
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  v-if="!hideNextButton"
                  color="error"
                  :disabled="showLoading"
                  @click="goBack"
                >
                  Cancel
                </VBtn>
                <VBtn
                  v-if="ticketType && (ticketType.name === 'Complain' || (ticketType.name === 'Request' && selectedRequestName !== 'COMPUTER & DEVICE REQUEST'))"
                  type="submit"
                  color="success"
                  :readonly="loading"
                  @click="() => { refForm?.validate(); }"
                >
                  <p
                    class="text-center mt-3"
                    style="color: white;"
                  >
                    SAVE
                  </p>
                </VBtn>

                <VBtn
                  v-if="!hideNextButton && ticketType && ticketType.name === 'Request' && selectedRequestName === 'COMPUTER & DEVICE REQUEST'"
                  type="submit"
                  color="success"
                  :readonly="loading"
                  @click="() => { refForm?.validate(); }"
                >
                  <p
                    class="text-center mt-3"
                    style="color: white;"
                  >
                    NEXT
                  </p>
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
      <VSpacer style="padding-top: 15px;" />
      <Device
        v-show="saved && selectedRequestName === 'COMPUTER & DEVICE REQUEST'"
        :data="ticketId"
      />
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
