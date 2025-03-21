<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import DialogAllAsset from '../asset-ict/dialogActiveAndDeploy.vue'
import Person from '../employment/employee/person.vue'

// import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue';

import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)

const documentDate = ref(new Date())
const dueDate = ref(new Date())
const note = ref()
const employees = ref()

const refCheckoutForm = ref()

const person = ref()
const personId = ref()

const maintainId = ref()
const isSaved = ref(false)

const assetId = ref()
const asset = ref()
const assetItem = ref()
const assetNumber = ref()
const assetLocation = ref()

const getValueFromPerson = val => {
  person.value = val.person.name
  personId.value = val.person.id
}

const getValueFromAsset = val => {
  // asset.value = val.person.name
  assetNumber.value = val.asset_number
  assetItem.value = val.item && val.item.name ? val.item.name : '-'
  assetLocation.value = val.location && val.location.name ? val.location.name : '-'
  assetId.value = val.id
}

const formatDateTimeMySql = value => {
  if (!value) return ''

  const date = new Date(value)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  // Format yang diinginkan: YYYY/MM/DD HH:MM
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const fetchEmployee = async() => {
  loading.value = true
  try {
    const ret = await axiosIns.get('employment/employees' )

    loading.value = false
    employees.value = ret.data.data
  } catch(error){
    loading.value = false
    console.log(error)
  }
}


watchEffect(() => {
  fetchEmployee()
})

// const fetchLocation = async () => {
//   loading.value = true
//   try {
//     const ret = await axiosIns.get(`/locations/getlocation/ticket`, {
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
//       },
//     })

//     siteLocation.value = ret.data.data
//     loading.value = false
//   } catch(error) {
//     Swal.fire({
//       title: 'Ticket',
//       text: 'Failed to get Location',
//       icon: 'error',
//     })
//   }
// }

// const fetchSubBuilding = async locationId => {
//   loading.value = true
//   try {
//     const ret = await axiosIns.get(`/locations/building/${locationId}`, {
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
//       },
//     })

//     buildingLocation.value = ret.data.data
//   } catch(error) {
//     Swal.fire({
//       title: 'Ticket',
//       text: 'Get data failed',
//       icon: 'error',
//     })
//   }
// }

// const fetchSubFloor = async buildingId => {
//   loading.value = true
//   if (!buildingId) return
//   try {
//     const ret = await axiosIns.get(`/locations/getlocation/floor/${buildingId}`, {
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
//       },
//     })

//     floorLocation.value = ret.data.data
//   } catch(error) {
//     Swal.fire({
//       title: 'Ticket',
//       text: 'Get data failed',
//       icon: 'error',
//     })
//   }
// }



// watch(checkinFrom, async newcheckinFrom => {
//   if (newcheckinFrom && newcheckinFrom.name === 'Item') {
//     loading.value = true
//     await fetchAsset()
//     selectedRef.value = true
//     selectedReLoc.value = false
//     selectedRefEmp.value = false
//     loading.value = false

//   } else if(newcheckinFrom && newcheckinFrom.name === 'Location') {
//     loading.value = true
//     await fetchLocation()
//     selectedReLoc.value = true
//     selectedRef.value = false
//     selectedRefEmp.value = false
//     loading.value = false
//   } else if(newcheckinFrom && newcheckinFrom.name === 'Employee') {
//     loading.value = true
//     await fetchEmployee()
//     selectedRefEmp.value = true
//     selectedRef.value = false
//     selectedReLoc.value = false
//     loading.value = false

    
//   } else {
//     selectedRef.value = false
//     selectedReLoc.value = false
//     selectedRefEmp.value = false
//   }
// })

// watch(locationId, newLocationId => {
//   loading.value = true
//   buildingId.value = null
//   if (newLocationId){
//     fetchSubBuilding(newLocationId)
//   }
//   loading.value = false
// })


// watch(buildingId, newBuildingId => {
//   loading.value = true
//   floorId.value = null
//   if (newBuildingId){
//     fetchSubFloor(newBuildingId) 
//   }
//   loading.value = false
// })

// const addAsset = () => {
//   if (Array.isArray(assets.value)) {
//     assets.value.push({})
//   } else {
//     console.error('assets.value is not an array')
//   }
// }

const goBack = () => {
  router.push('/maintenance')
}


const createMaintenance = async () => {
  loading.value = true
  try {
    const headerParams = {
      document_date: formatDateTimeMySql(documentDate.value),
      due_date: formatDateTimeMySql(dueDate.value),
      maintain_by: personId.value,
      description: note.value,
    }

    const response = await axiosIns.post('/maintenances', headerParams )

    maintainId.value = response.data.data.id

    const lineParams = {
      maintenance_id: maintainId.value,
      asset_id: assetId.value,
    }

    await axiosIns.post('/maintenance/lines', lineParams )

    router.push('/maintenance')
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
  } finally{loading.value = false}
}

const onSubmit = () => {
  refCheckoutForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) createMaintenance()
  })
}
</script>

<template>
  <VForm
    ref="refCheckoutForm"
    @submit.prevent="onSubmit"
  >
    <VRow>
      <VCol
        cols="12"
        md="9"
      >
        <!-- <EditableCheckout /> -->
        <VOverlay v-model="loading" />
        <VCard :loading="loading">
          <div style="background-color: #f5f5f5; margin: 15px; padding: 15px; border-radius: 15px;">
            <VCardText
              class="d-flex flex-wrap justify-space-between flex-column flex-sm-row"
            >
              <div class="ma-sm-1">
                <div class="d-flex align-center mb-6">
                  <VNodeRenderer
                    :nodes="themeConfig.app.logo"
                    class="me-3"
                  />
                  <h6 class="font-weight-bold text-xl">
                    FORM MAINTENANCE
                  </h6>
                </div>
              </div>
              <div class="mt-4 ma-sm-1">
                <h3 class="d-flex align-center font-weight-medium justify-sm-end text-l mb-2">
                  <span class="me-2">Document Number</span>
                  <span>
                    <VTextField 
                      v-model="documentNumber"
                      disabled
                      label="By System"
                      prefix="#"
                      style="width: 8.9rem;"
                    />
                  </span>
                </h3>
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Maintenance Date</span>
                  <span>
                    <VDateInput 
                      v-model="documentDate"
                      density="compact"
                      style="width: 11rem;"
                      placeholder="YYYY-MM-DD"
                      :config="{ enableTime: true, dateFormat: 'Y-m-d H:i', position: 'auto right ', time_24hr: true, }"
                      :disabled="isSaved"
                      :rules="[requiredValidator]"
                    />
                  </span>
                </p>
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Due Date</span>
                  <span>
                    <VDateInput 
                      v-model="dueDate"
                      density="compact"
                      style="width: 11rem;"
                      placeholder="YYYY-MM-DD"
                      :config="{ enableTime: true, time_24hr: true, dateFormat: 'Y-m-d H:i', position: 'auto right ', minDate: dueDate }"
                      :disabled="isSaved"
                      :rules="[requiredValidator]"
                    />
                  </span>
                </p>
              </div>
            </VCardText>
          </div>
  
          <VDivider />
          <VCardText class="mx-sm-4">
            <VRow>
              <VCol
                cols="8"
                class="d-flex align-center gap-3"
              >
                <h6 class="text-sm font-weight-medium mb-2 text-center">
                  Maintain By:
                </h6>
                <VTextField
                  v-model="person"
                  item-value="id"
                  item-title="name"
                  label="Select Person"
                  readonly
                  :disabled="isSaved"
                  clearable
                  :rules="[requiredValidator]"
                />
                <Person 
                  @person="getValueFromPerson"
                />
              </VCol>
            </VRow>
          </VCardText>
          <VDivider />

          <VDivider />
          <VCardText class="mx-sm-4">
            <VRow>
              <VCol
                cols="4"
                class="d-flex justify-end gap-3 "
              >
                <VTextField
                  v-model="assetNumber"
                  item-value="id"
                  item-title="name"
                  label="Select Asset"
                  readonly
                  :disabled="isSaved"
                  clearable
                  :rules="[requiredValidator]"
                />
                <DialogAllAsset 
                  @asset="getValueFromAsset"
                />
              </VCol>
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="assetItem"
                  readonly
                  label="Item"
                />
              </VCol>
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="assetLocation"
                  readonly
                  label="Location"
                />
              </VCol>
            </VRow>
          </VCardText>
          
          <VCardText class="mx-sm-4">
            <p class="font-weight-semibold mb-2">
              Note:
            </p>
            <VTextarea
              v-model="note"
              :rows="2"
              :disabled="isSaved"
              :rules="[requiredValidator]"
            />
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        cols="12"
        md="3"
      >
        <VCard class="mb-8">
          <VCardText>
            <VBtn
              class="mb-2 mt-2"
              block
              prepend-icon="tabler-send"
              type="submit"
            >
              Save
            </VBtn>
            
            <VBtn
              class="mb-2"
              variant="tonal"
              block
              @click="goBack"
            >
              Cancel
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>      
    </VRow>
  </VForm>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Ticket
    redirectIfLoggedIn: false
</route>
