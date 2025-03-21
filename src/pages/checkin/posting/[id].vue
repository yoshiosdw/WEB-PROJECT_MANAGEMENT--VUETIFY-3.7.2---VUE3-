<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import Person from '@/pages/employment/employee/person.vue'
import ItemDIalog from '@/pages/item/itemDialog.vue'
import axiosIns from '@/plugins/axios'
import EditCheckoutAsset from '@/views/apps/checkout/EditCheckoutAsset.vue'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from 'vue'

// import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue';

import { useRoute, useRouter } from 'vue-router'
import { useCheckinStore } from '../useCheckinStore'

const emits = defineEmits(['idCheckout', 'save'])

const router = useRouter()
const route = useRoute()

const checkinId = route.params.id
const assetByIdData = ref()


const isLoading = ref(false)

const checkinFilter = [
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
const expectCheckin = ref()
const checkinDate = ref(new Date())
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
const refCheckinForm = ref()
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

// const assetId = ref('')
const assetId = ref()

const qty = ref(0)

// const assetId = ref()

const checkinData = ref([])
const dataCheckinFrom = ref()
const dataReference = ref()

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

const goBack = () => {
  router.back()
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

const fetchCheckin = async checkinId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/checkins/${checkinId}` )

    checkinData.value = ret.data.data[0]
    assetId.value = checkinData.value.line[0] ? checkinData.value.line[0].asset_id : '-'
    dataCheckinFrom.value = checkinData.value.checkin_from
    note.value = checkinData.value.note

    // dataReference.value = checkinData.value.employee.person.name

 
    isLoading.value = false
  } catch(error) {
    isLoading.value = false
    console.log(error)
  }
}

const fetchAssetById = async assetId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/assets/${assetId}` )

    assetByIdData.value = ret.data.data
    isLoading.value = false
  } catch(error) {
    isLoading.value = false
    console.log(error)
  }
}

// watchEffect(() => {
//   fetchItem()
//   fetchLocation()
//   fetchEmployee()
// })

watchEffect(async () => {
  await fetchCheckin(checkinId)
  fetchItem()
  fetchLocation()
  fetchEmployee()
})

watch(assetId, async newAssetId => {
  if (newAssetId) {
    await fetchAssetById(newAssetId)
  }
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

watch(assetByIdData, newData => {
  if (newData) {
    assets.value = newData.map(asset => ({
      assetId: asset.id,
      assetNumber: asset.asset_number,
      assetItem: asset.item ? asset.item.name : '',
      qty: asset.qty,
    }))
  }
})

watch(dataCheckinFrom, newValue => {
  if (newValue) {
    const matchedFilter = checkinFilter.find(filter => filter.name === newValue)
    if (matchedFilter) {
      checkinFrom.value = matchedFilter
    } else {
      checkinFrom.value = null
    }
  }
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

const idCheckout = ref ()

const posting = async checkinId => {
  loading.value = true
  try {
    const asset = assets.value[0]
    
    const payload = {
      checkin_from: checkinFrom.value.name,
      note: note.value,
      asset_id: assetId.value !== null && assetId.value === asset.assetId ? assetId.value : asset.assetId,
      quantity:  assets.value.qty !== undefined && assets.value.qty !== '' ? assets.value.qty : 1,
      checkin_id:checkinId,
    }

    if (checkinFrom.value.name === 'Item') {
      payload.reference_id = itemId.value
    } else if (checkinFrom.value.name === 'Employee') {
      payload.reference_id = personId.value
    } else if (checkinFrom.value.name === 'Location') {
      const locationIdStr = String(locationId.value)
      if (locationIdStr === '111') {
        payload.reference_id = locationIdStr
      } else {
        payload.reference_id = floorId.value ? floorId.value : buildingId.value
      }
    }

    const ret = await axiosIns.post(`/checkins/post/${checkinId}`, payload )

    router.back()

  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const onSubmit = () => {
  refCheckinForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) posting(checkinId)
  })
}

watch(dataCheckinFrom, newValue => {
  if (newValue) {
    if (newValue === 'Item') {
      item.value = checkinData.value.item.name
      itemId.value = checkinData.value.item.id
      category.value = checkinData.value.item.item_category.name
      description.value = checkinData.value.item.description
    } else if (newValue === 'Location') {
      locationId.value = checkinData.value.location.id
    } else if (newValue === 'Employee') {
      person.value = checkinData.value.employee.person.name
      personId.value = checkinData.value.employee.person.id
    }
  }
})
</script>

<template>
  <VForm
    ref="refCheckinForm"
    @submit.prevent="onSubmit"
  >
    <VRow>
      <VCol
        cols="12"
        md="9"
      >
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
                    Posting Checkin
                  </h6>
                </div>
              </div>
              <div class="mt-4 ma-sm-1">
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Document Number</span>
                  <span>
                    <VTextField 
                      v-model="checkinData.document_number"
                      readonly
                      variant="filled"
                      style="width: 11rem;"
                    />
                  </span>
                </p>
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Checkin Date</span>
                  <span>
                    <VTextField 
                      v-model="checkinData.checkin_date"
                      density="compact"
                      readonly
                      variant="filled"
                      style="width: 11rem;"
                    />
                  </span>
                </p>
              </div>
            </VCardText>
          </div>
  
          <VDivider />
          <VCardText>
            <VRow>
              <VCol cols="12">
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
                      v-for="hal in checkinFilter"
                      :key="hal.name"
                      :label="hal.name"
                      :value="hal"
                      :disabled="isSaved"
                    />
                  </VRadioGroup>
                </div>
              </VCol>
            </VRow>
       
            <VRow
              v-if="selectedRefEmp"
              class="mt-3"
            >
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
                  :rules="[requiredValidator]"
                />
                <Person 
                  @person="getValueFromPerson"
                />
              </VCol>
            </VRow>

            <VRow
              v-if="selectedRef"
              class="mt-4"
            >
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
                  :rules="[requiredValidator]"
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
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VRow
              v-if="selectedReLoc"
              class="mt-3"
            >
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
            <VTextarea
              v-model="note"
              :rows="2"
              label="Note"
              :rules="[requiredValidator]"
            />
          </VCardText>
  
          <VDivider />
          <VCardText
            class="add-asset-form"
          >
            <div class="mt-4 ma-sm-4 d-flex justify-end">
              <VBtn
                @click="addAsset"
              >
                Add Asset
              </VBtn>
            </div>
            <div
              v-if="assetByIdData && assetByIdData.length > 0"
              class="ma-sm-4"
            >
              <div
                v-for="(asset, index) in assetByIdData"
                :key="asset.id"
                class="mb-4"
              >
                <EditCheckoutAsset
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
              class="mb-2 mt-2"
              block
              prepend-icon="tabler-send"
              type="submit"
            >
              Posting
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
