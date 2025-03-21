<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"
import { useAssetsStore } from "./useAssetsStore"


const props = defineProps({
  assetId: {
    type: String,
    required: true,
  },
})


const route = useRoute()

const assetId = props.assetId

// const assetId = route.params.id 
const item = ref()
const asset = ref([])
const selectedItem = ref()
const assetStore = useAssetsStore()

const isVisible = ref(false)

const loading = ref(false)
const saved = ref(false)
const refUpdateAssetForm = ref()

const itemId = ref()
const itemFilter = ref()
const manufactureData = ref()
const locationId = ref()
const buildingId = ref()
const floorId = ref()

const siteLocation = ref(null)
const buildingLocation = ref(null)
const floorLocation = ref(null)

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

const isByod = ref(isByodValue.value[1])

const organization = ref()
const organizationId = ref()

const assetNumber = ref()
const assetSerialNumber = ref()
const assetBrand = ref()
const assetItemCondition= ref()

const assetItemName = ref()
const assetManufacturer= ref()
const assetOrganization = ref()
const assetDesc = ref()

const getValueFromItem = val => {
  item.value = val.name
  itemId.value = val.id
}


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


const fetchAssets = async assetId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/assets/${assetId}` )

    asset.value = ret.data.data[0]
    assetNumber.value = asset.value.asset_number
    assetSerialNumber.value = asset.value.serial_number
    assetBrand.value = asset.value.brand
    assetItemCondition.value = asset.value.item_condition

    assetItemName.value = asset.value.item ? asset.value.item.name: '-'
    assetManufacturer.value = asset.value.manufacturer ? asset.value.manufacturer.name: '-'
    assetOrganization.value = asset.value.organization ? asset.value.organization.name: '-'

    // locationId.value = asset.value.location ? asset.value.organization.name: '-'
    // buildingId.value = asset.value.organization ? asset.value.organization.name: '-'
    // floorId.value = asset.value.organization ? asset.value.organization.name: '-'


    assetDesc.value = asset.value.description
    assetStore.setAssets(ret.data.data[0])
    loading.value = false
  } catch(error) {
    Swal.fire({
      text: 'Failed to load Asset',
      title: error,
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchAssets(assetId)
})


const updateAsset = async assetId => {
  loading.value = true
  if (assetStore.asset !== null) {
    try {
      const ret = await axiosIns.patch(`/asset/${assetId}`, {
        asset_number: asset.value.asset_number,
        serial_number: asset.value.serial_number,
        item_id: asset.value.item_id,
        condition: asset.value.condition,
        item_condition: asset.value.item_condition,
      }, {
        
      })

      closeDialog ()
      saved.value = true
    } catch(error) {
      Swal.fire({
        title: 'LBG',
        text: error,
        icon: 'error',
      })
    }loading.value = false
  }
}

const closeDialog = () => {
  isVisible.value = false
}


const onSubmit = () => {
  refUpdateAssetForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateAsset(assetId)
  })
}
</script>

<template>
  <VDialog 
    v-model="isVisible" 
    width="1024" 
    transition="dialog-bottom-transition" 
    persistent
  >
    <template #activator="{ props }">
      <VListItemTitle
        v-bind="props"
        @click="showEditDialog(props.data.id)"
      >
        <VIcon
          icon="tabler-pencil" 
          variant="primary" 
          density="compact"
          color="warning"
        />
        Edit
      </VListItemTitle>
    </template>

    <VOverlay v-model="loading" />
    <DialogCloseBtn @click="isVisible = !isVisible" />

    <VCard :loading="loading">
      <VCardTitle>Modify Asset</VCardTitle>

      <VForm
        ref="refUpdateAssetForm"
        @submit.prevent="onSubmit"
      >
        <VCardText
          v-if="asset"
          class="mt-3"
        >
          <VRow>
            <VCol cols="3">
              <VTextField 
                v-model="assetNumber"
                :rules="[requireValidator]"
                label="Asset Number"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="assetSerialNumber"
                :rules="[requireValidator]"
                label="Serial Number"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="assetBrand"
                :rules="[requireValidator]"
                label="Brand"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="assetItemCondition"
                :rules="[requireValidator]"
                label="Condition"
              />               
            </VCol>
          </VRow>

          <VRow>
            <VCol cols="4">
              <VTextField 
                v-model="assetItemName"
                label="Item"
                placeholder="Item"
                :items="item"
                item-title="name"
                item-value="id"
                single-line
                :rules="[requireValidator]"
              />                
              <ItemDIalog @item="getValueFromItem" /> 
            </VCol>
            <VCol cols="4">
              <VSelect 
                v-model="assetManufacturer"
                label="Manufacturer"
                :items="manufactureData"
                item-title="name"
                item-value="id"
              />
            </VCol>

            <VCol cols="4">
              <VSelect
                v-model="assetOrganization"
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
            <VCol cols="12">
              <VTextField
                v-model="assetDesc"
                rows="2"
                :rules="[requireValidator]"
                label="Description"
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
                color="warning"
                @click="closeDialog"
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
  </VDialog>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
