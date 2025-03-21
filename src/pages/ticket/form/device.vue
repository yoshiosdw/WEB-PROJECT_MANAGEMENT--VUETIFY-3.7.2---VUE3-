<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import Person from '@/pages/ticket/person.vue'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const props = defineProps({
  data: {
    type: String,
    default: null,
  },
})

const formId = ref()
const loading = ref(true)
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
const loc = ref()

const requestorDeviceId = ref('')
const deviceLocationId = ref('')
const isOtherDeviceChecked = ref(false)
const otherDeviceName = ref('')

const description = ref('')
const requestForm = ref()



const selectedUserType = ref('same_as_requestor') 

const device = ref('')
const deviceNameId = ref(null)
const approval = ref()
const locations = ref([])
const isLoading = ref(true)
const savingProcess = ref(false)
const saved = ref(false)
const requestorNameId = ref()

const editableDepartment = ref(true)
const editablePosition = ref(true)
const locationId = ref()
const buildingId = ref()
const floorId = ref()

const siteLocation = ref([])
const buildingLocation = ref([])
const floorLocation = ref([])

const router = useRouter()

const userData = JSON.parse(localStorage.getItem('sinarjoUserData'))
const userId = ref(JSON.parse(localStorage.getItem('sinarjoUserData')).id)


const getPerson = val => {
 
  requestorName.value = val.person.name
  requestorNik.value = val.person.nik
  emailRequestor.value = val.person.email

  requestorNameId.value = val.id

  if (formType.value.id === 2) {
    requestorDeviceId.value = val.id
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
  if(formType.value && formType.value.id == 1){

    requestorName.value = userData.person.name

    // requestorNameId.value = userData.id

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


const fetchDevice = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get('/item/categories' )

    device.value = ret.data.data
    isLoading.value = false
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  } isLoading.value = false
}


const createRequest = async () => {
  savingProcess.value = true
  try {
    let requestForId = formType.value.id === 1 ? userId.value : requestorNameId.value
      
    const locationIdStr = String(locationId.value)
    if (locationIdStr === '111') {
      loc.value = locationIdStr
    } else {
      loc.value = floorId.value ? floorId.value : buildingId.value
    }

    const ret = await axiosIns.post('/request/form',{
      request_for: requestForId,
      ticket_id:props.data,
      item_category_id: deviceNameId.value,
      detail_device_type: detailDeviceType.value,
      
      device_location: loc.value,
      description: description.value,
    })

    savingProcess.value = false
    saved.value = true
    formId.value = ret.data.data.id

    // window.location.reload()
    router.push('/home')
  } catch (error) {
    console.log(error)
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    savingProcess.value = false
    saved.value = false
    console.log(error)
  }
}


const computedRulesBuilding = computed(() => {
  const locationIdStr = String(locationId.value)
  
  return locationIdStr === '111' ? [] : [requiredValidator]
})

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

watchEffect(() => {
  fetchDevice()
  fetchLocation()
})


watch(locationId, newLocationId => {
  loading.value = true
  buildingId.value = null
  if(newLocationId){
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
      <VCard :loading="isLoading">
        <VCardTitle>
          Computer & Device Detail
        </VCardTitle>
        <VOverlay />

        <VCardText class="mt-1">
          <VForm
            ref="requestForm"
            @submit.prevent="onSubmit"
          >
            <VRow class="mt-3">
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

        
            <VRow class="mt-4">
              <VCol
                cols="4"
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
              
              <VCol cols="4">
                <VTextField
                  v-model="requestorNik"
                  label="Requestor NIK"
                  :rules="[requiredValidator]"
                  :readonly="selectedUserType === 'same_as_requestor'"
                />
              </VCol>

              <VCol cols="4">
                <VTextField
                  v-model="requestorDepartment"
                  label="Requestor Department"
                  :readonly="formType.id === 1"
                />
              </VCol>
            </VRow>
            <VRow class="mt-2">
              <VCol cols="3">
                <VTextField
                  v-model="requestorPosition"
                  label="Requestor Position"
                  :readonly="formType.id === 1"
                />
              </VCol>

              <VCol cols="9">
                <VTextField
                  v-model="emailRequestor"
                  label="Email"
                  :readonly="selectedUserType === 'same_as_requestor'"
                />
              </VCol>
            </VRow>

            <VRow class="mt-3">
              <VCol cols="3">
                <VSelect
                  v-model="locationId"
                  item-title="name"
                  item-value="id"
                  :items="siteLocation"
                  :readonly="readonlyFields"
                  label="location Site"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="5">
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
                />
              </VCol>
            </VRow>

            <VRow class="mt-2">
              <VCol
                cols="4"
              >
                <VSelect
                  v-model="deviceNameId"
                  label="Device Name"
                  :items="device"
                  item-title="name"
                  item-value="id"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="detailDeviceType"
                  label="Detail Device Type"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VRow class="mt-2">
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  rows="2"
                  label="Description / Reason"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4 mx-4 mt-3">
                  <VBtn
                    v-if="!saved"
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
    action: Read
    subject: Dashboard
    redirectIfLoggedIn: false
</route>
