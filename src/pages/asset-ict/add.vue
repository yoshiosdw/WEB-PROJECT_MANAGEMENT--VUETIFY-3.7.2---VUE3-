<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import ItemDIalog from '../item/itemDialog.vue'

const assetForm = ref()
const router = useRouter()
const serialNumber = ref()
const item = ref()
const itemId = ref()
const itemFilter = ref()
const brand = ref()
const description = ref()
const manufactureData = ref()
const manufacture = ref()
const itemCondition = ref()
const warranty = ref()

const locationId = ref()
const buildingId = ref()
const floorId = ref()

const siteLocation = ref(null)
const buildingLocation = ref(null)
const floorLocation = ref(null)
const loading = ref(true)

const isByodValue = ref([
  {
    name: 'Yes',
    type: '0',
  },
  {
    name: 'No',
    type: '1',
  },
])

const locationFilter = ref()
const location = ref()
const isByod = ref(isByodValue.value[1])
const status = ref()

const organization = ref()
const organizationId = ref()

const getValueFromItem = val => {
  item.value = val.name
  itemId.value = val.id
}

const saved = ref(false)

const fetchItem = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/items', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    itemFilter.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

const fetchManufacture = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/manufacturers', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    manufactureData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

const fetchOrganization = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/organizations/by/parent` )

    organization.value = ret.data.data
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Failed to get Location',
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
  if (!locationId) return
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
  fetchItem(), fetchManufacture(), fetchLocation(), fetchOrganization()
})

watch(locationId, newLocationId => {
  loading.value = true
  buildingId.value = null

  fetchSubBuilding(newLocationId)
  loading.value = false
})


watch(buildingId, newBuildingId => {
  loading.value = true
  floorId.value = null

  fetchSubFloor(newBuildingId) 
  loading.value = false
})

const createAsset = async() => {
  try {

    const locationIdStr = String(locationId.value)

    let locationIdToSend
    if (locationIdStr === '111') {
      locationIdToSend = locationIdStr
    } else {
      locationIdToSend = floorId.value ? floorId.value : buildingId.value
    }
    
    const ret = await axiosIns.post('/assets', {
      serial_number: serialNumber.value,
      item_id: itemId.value,
      description: description.value,
      item_condition: itemCondition.value,
      brand: brand.value,
      manufacturer_id: manufacture.value,
      is_byod: isByod.value.type,
      location_id: locationIdToSend,
      organization_id: organizationId.value,
    } )

    router.push('/assets')

    // serialNumber.value = null
    // item.value = null
    // description.value = null
    // itemCondition.value = null
    // manufacture.value = null
    // location.value = null
    // isByod.value = 1
    // locationId.value = null
    // buildingId.value = null
    // floorId.value = null
    // brand.value = null
    // organizationId.value = null

  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

const onSubmit = () => {
  assetForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createAsset()
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VForm
          ref="assetForm"
          @submit.prevent="onSubmit"
        >
          <VCardTitle>Create Asset</VCardTitle>
          <VCardText class="mt-3">
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="serialNumber"
                  :rules="[requireValidator]"
                  label="Serial Number"
                />
              </VCol>
              <VCol cols="4">
                <VSelect 
                  v-model="manufacture"
                  label="Manufacturer"
                  :items="manufactureData"
                  item-title="name"
                  item-value="id"
                />
              </VCol>

              <VCol cols="4">
                <VSelect
                  v-model="organizationId"
                  item-title="name"
                  item-value="id"
                  :items="organization"
                  clearable
                  label="Organization"
                  :rules="[requiredValidator]"
                />
                <template #prepend-item>
                  <small v-if="organization && organization.name">{{ organization.name }}</small>
                </template>
              </VCol>
            </VRow>

            <VRow>
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
                  :rules="[requiredValidator]"
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

            <VRow>
              <VCol
                cols="4"
                class="d-flex justify-end gap-2 "
              >
                <VTextField 
                  v-model="item"
                  item-value="id"
                  item-title="name"
                  label="Select Item"
                  readonly
                  clearable
                  single-line
                  :rules="[requireValidator]"
                />   
                <ItemDIalog @item="getValueFromItem" />              
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="itemCondition"
                  label="Item Condition"
                />            
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="brand"
                  label="Item Brand"
                />            
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  :rules="[requireValidator]"
                  label="Description"
                  rows="2"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="4">
                <VRadioGroup
                  v-model="isByod"
                  inline 
                  :rules="[requiredValidator]"
                  label="Is BYOD?"
                >
                  <VRadio 
                    v-for="hal in isByodValue"
                    :key="hal.type" 
                    :label="hal.name" 
                    :value="hal" 
                    :readonly="saved"
                  />
                </VRadioGroup>
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  :to="{name: 'assets'}"
                  color="warning"
                >
                  Close
                </VBtn>
                <VBtn
                  color="success"
                  type="submit"
                >
                  Save
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Ticket
    redirectIfLoggedIn: false
</route>
