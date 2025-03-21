<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import Person from '../employment/employee/person.vue'
import ItemDIalog from '../item/itemDialog.vue'
import CheckinAsset from './checkinAsset.vue'

// import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue';

import { useRouter } from 'vue-router'
import { useCheckinStore } from './useCheckinStore'

const emits = defineEmits(['idCheckin', 'save'])

const router = useRouter()

const goBack = () => {
  router.push('/checkout')
}

const isLoading = ref(false)

const checkoutFilter = [
  {
    id: 1,
    name: 'Employee',
  },
  {
    id: 2,
    name: 'Item',
  },
  {
    id: 3,
    name: 'Location',
  },
]

const documentDate = ref(new Date())
const checkinFrom = ref()
const checkinDate = ref()

// const checkinDate = ref(new Date())
const referenceId = ref()
const note = ref()
const refName = ref()
const refDesc = ref()
const refCategory = ref()
const employees = ref()
const items = ref()
const locations = ref()
const selectedRef = ref()
const selectedReLoc = ref()
const selectedRefEmp = ref()

// const assets = ref([])
const assets = ref([])
const assetData = ref()
const refCheckoutForm = ref()
const checkinStore = useCheckinStore()

const person = ref()
const personId = ref()

const item = ref()
const itemId = ref()
const category = ref('')
const description = ref('')

const loading = ref(true)
const locationId = ref()
const buildingId = ref()
const floorId = ref()
const siteLocation = ref()
const buildingLocation = ref()
const floorLocation = ref()

const isSaved = ref(false)

const assetId = ref('')
const qty = ref(0)

const getValueFromPerson = val => {
  person.value = val.person.name
  personId.value = val.id
}

const getValueFromItem = val => {
  item.value = val.name
  itemId.value = val.id
  description.value = val.description
  category.value = val.item_category.name
}

const fetchItem = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get('/items' )

    items.value = ret.data.data
    isLoading.value = false
  } catch(error) {
    isLoading.value = false
    console.log(error)
  }
}

const fetchEmployee = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get('employment/employees' )

    isLoading.value = false
    employees.value = ret.data.data
  } catch(error){
    isLoading.value = false
    console.log(error)
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


watchEffect(() => {
  fetchItem(), fetchLocation(), fetchEmployee()
})

watch(checkinFrom, async newcheckinFrom => {
  if (newcheckinFrom && newcheckinFrom.name === 'Item') {
    loading.value = true
    await fetchItem()
    selectedRef.value = true
    selectedReLoc.value = false
    selectedRefEmp.value = false
    loading.value = false

  } else if(newcheckinFrom && newcheckinFrom.name === 'Location') {
    loading.value = true
    await fetchLocation()
    selectedReLoc.value = true
    selectedRef.value = false
    selectedRefEmp.value = false
    loading.value = false
  } else if(newcheckinFrom && newcheckinFrom.name === 'Employee') {
    loading.value = true
    await fetchEmployee()
    selectedRefEmp.value = true
    selectedRef.value = false
    selectedReLoc.value = false
    loading.value = false

    
  } else {
    selectedRef.value = false
    selectedReLoc.value = false
    selectedRefEmp.value = false
  }
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

const addAsset = () => {
  if (Array.isArray(assets.value)) {
    assets.value.push({})
  } else {
    console.error('assets.value is not an array')
  }
}


const removeAsset = id => {
  assets.value.splice(id, 1)
}

const updateAsset = ({ id, asset }) => {
  assets.value[id] = asset
}

const idCheckin = ref ()

const createCheckout = async () => {
  loading.value = true
  try {
    const params = {
      document_date: formatDateMySql(documentDate.value),
      checkin_from: checkinFrom.value.name,

      // reference_id: referenceId.value,
      
      checkin_date: formatDateMySql(checkinDate.value),
      note: note.value,
    }

    if (checkinFrom.value.name === 'Item') {
      params.reference_id = itemId.value
    } else if (checkinFrom.value.name === 'Employee') {
      params.reference_id = personId.value
    } else if (checkinFrom.value.name === 'Location') {

      const locationIdStr = String(locationId.value)
      if (locationIdStr === '111') {
        params.reference_id = locationIdStr
      } else {
        params.reference_id = floorId.value ? floorId.value : buildingId.value
      }
    }

    const response = await axiosIns.post('/checkins', params )

    assetData.value = response.data.data
    idCheckin.value = assetData.value.id

    emits('idCheckin',  idCheckin.value )
    isSaved.value = true

    // router.push('/checkout')
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
    if(isValid) createCheckout()
  })
}

const checkoutDataOld = async () => {
  try {
    const ret = await axiosIns.get('/checkouts', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken') },
    })

    checkouts.value = ret.data.data
  } catch (error) {
    console.log(error)
  }
}


const createAssets = async () => {
  loading.value = true

  try {
    for (let i = 0; i < assets.value.length; i++) {
      const asset = assets.value[i]

      await axiosIns.post('/checkin/lines', {
        checkin_id: idCheckin.value,
        asset_id: asset.assetId,
        quantity: asset.qty,
      }, {
        
      })
    }

    router.push('/checkin')


  } catch (error) {
    // Handle error
  } finally {
    loading.value = false
  }
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
                    FORM CHECKIN
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
                  <span class="me-2">Document Date</span>
                  <span>
                    <VDateInput 
                      v-model="documentDate"
                      density="compact"
                      style="width: 8.9rem;"
                      placeholder="YYYY-MM-DD"
                      :config="{ position: 'auto right ' }"
                      :disabled="isSaved"
                    />
                  </span>
                </p>
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Checkin Date</span>
                  <span>
                    <VDateInput 
                      v-model="checkinDate"
                      density="compact"
                      style="width: 8.9rem;"
                      placeholder="YYYY-MM-DD"
                      :config="{ position: 'auto right ' }"
                      :disabled="isSaved"
                      :rules="[requiredValidator]"
                    />
                  </span>
                </p>
              </div>
            </VCardText>
          </div>
  
          <VDivider />
          <VCardText class="d-flex flex-wrap justify-space-between flex-column flex-sm-row gap-4">
            <div
              class="ma-sm-3"
              style="width: 25rem"
            >
              <h6 class="text-sm font-weight-medium mb-2">
                Checkin From :
              </h6>
              <VRadioGroup
                v-model="checkinFrom"
                inline
                :rules="[requiredValidator]"
                :disabled="isSaved"
              >
                <VRadio 
                  v-for="hal in checkoutFilter"
                  :key="hal.name"
                  :label="hal.name"
                  :value="hal"
                  :disabled="isSaved"
                />
              </VRadioGroup>
            </div>
       
            <!--
              <div
              v-if="selectedRefEmp"
              class="ma-sm-3 mt-4"
              style="width: 18rem"
              >
              <VSelect
              v-model="referenceId"
              class="mt-7"
              :items="employees"
              item-value="id"
              item-title="person.name"
              />
              </div>
            -->
          </VCardText>

          <VCardText v-if="selectedRefEmp">
            <VCol
             
              cols="6"
              class="d-flex justify-end gap-3 "
            >
              <VTextField
                v-model="person"
                item-value="id"
                item-title="name"
                label="Select Person"
                readonly
                :disabled="isSaved"
                clearable
              />
              <Person 
                @person="getValueFromPerson"
              />
            </VCol>
          </VCardText>

          <VCardText v-if="selectedRef">
            <VRow>
              <VCol
              
                cols="6"
                class="d-flex justify-end gap-2 "
              >
                <VTextField
                  v-model="item"
                  item-value="id"
                  item-title="name"
                  label="Select Item"
                  readonly
                  clearable
                  :disabled="isSaved"
                />
                <ItemDIalog @item="getValueFromItem" /> 
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="category"
                  label="Category"
                  readonly
                  variant="filled"
                  :disabled="isSaved"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="description"
                  label="Description"
                  readonly
                  variant="filled"
                  :disabled="isSaved"
                />
              </VCol>
            </VRow>
          </VCardText>

          <VCardText v-if="selectedReLoc">
            <VRow class="mt-2">
              <VCol cols="4">
                <VSelect
                  v-model="locationId"
                  :disabled="isSaved"
                  item-title="name"
                  item-value="id"
                  :items="siteLocation"
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
                  :disabled="isSaved"
                  label="Building"
                  :rules="[requiredValidator]"
                  :menu-props="{ maxHeight: '300px' }"
                />
              </VCol>

              <VCol cols="4">
                <VSelect
                  v-model="floorId"
                  item-title="name"
                  item-value="id"
                  :disabled="isSaved"
                  :items="floorLocation"
                  label="Floor"
                  @change="fetchSubFloor(buildingId)"
                />
              </VCol>
            </VRow>
          </VCardText>

          <VDivider />
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
  
          <VDivider />
          <VCardText
            v-if="isSaved"
            class="add-asset-form"
          >
            <div class="mt-4 ma-sm-4 d-flex justify-end">
              <VBtn
                v-if="isSaved"
                @click="addAsset"
              >
                Add Asset
              </VBtn>
            </div>
            <div
              v-if="assets.length > 0"
              class="ma-sm-4"
            >
              <div
                v-for="(asset, index) in assets"
                :key="index"
                class="mb-4"
              >
                <CheckinAsset
                  :id="index"
                  :data="asset"
                  @update-asset="updateAsset"
                />
                <VBtn
                  color="red"
                  @click="removeAsset(index)"
                >
                  Remove
                </VBtn>
              </div>
            </div>
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
              v-show="isSaved"
              class="mb-2 mt-2"
              block
              prepend-icon="tabler-send"
              @click="createAssets"
            >
              Save
            </VBtn>
            <VBtn
              v-show="!isSaved"
              type="submit"
              class="mb-2 mt-2"
              block
              prepend-icon="tabler-send"
            >
              Next
            </VBtn>
            <VBtn
              v-show="!isSaved"
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
