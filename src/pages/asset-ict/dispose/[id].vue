<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const loading = ref(false)
const route = useRoute()
const router = useRouter()
const assetId = route.params.id
const refDispose = ref()

const assetData = ref([])
const item = ref([])
const organization = ref()
const description = ref()

const locationId = ref()
const buildingId = ref()
const floorId = ref()
const siteLocation = ref()
const buildingLocation = ref()
const floorLocation = ref()


const fetchAsset = async assetId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/assets/${assetId}` )

    assetData.value = ret.data.data[0]
    item.value = assetData.value.item ? assetData.value.item.name : '-'
    organization.value = assetData.value.organization ? assetData.value.organization.name : '-'
   
  } catch(error){
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }finally{loading.value = false}
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
  fetchAsset(assetId), fetchLocation()
})

watch(locationId, newLocationId => {
  loading.value = true
  buildingId.value = null
  floorId.value = null

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

const computedRulesBuilding = computed(() => {
  const locationIdStr = String(locationId.value)
  
  return locationIdStr === '111' ? [] : [requiredValidator]
})

const goBack = () => {
  router.back()
}

const dispose = async assetId => {
  loading.value = true
  try {
    const params = {
      description: description.value,
      asset_id: assetId,
    }


    const locationIdStr = String(locationId.value)
    if (locationIdStr === '111') {
      params.location_id = locationIdStr
    } else {
      params.location_id = floorId.value ? floorId.value : buildingId.value
    }

    const response = await axiosIns.post(`/assets/dispose/${assetId}`, params )

    router.back()
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  } finally{loading.value = false}
}

const onSubmit = () => {
  refDispose.value?.validate().then(({ valid: isValid }) => {
    if(isValid) dispose(assetId)
  })
}
</script>

<template>
  <VForm
    ref="refDispose"
    @submit.prevent="onSubmit"
  >
    <VRow>
      <VCol>
        <VOverlay v-model="loading" />
        <VCard :loading="loading">
          <VCardTitle>
            Asset Detail
          </VCardTitle>
          <VCardText class="mt-3">
            <VRow>
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="assetData.asset_number"
                  label="Asset Number"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="assetData.serial_number"
                  label="Serial Number"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="item"
                  label="Item Name"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
      
            <VRow class="mt-3">
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="assetData.item_condition"
                  label="Condition"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="assetData.brand"
                  label="Brand"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="organization"
                  label="Organization"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
      
            <VRow class="mt-3">
              <VCol
                cols="12"
              >
                <VTextField
                  v-model="assetData.description"
                  label="Description"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VCard
          :loading="loading"
          class="mt-3"
        >
          <VCardTitle>
            Dispose Detail
          </VCardTitle>
          <VCardText class="mt-3">
            <VRow>
              <VCol
                cols="12"
              >
                <VTextField
                  v-model="description"
                  label="Description"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
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
                  :rules="computedRulesBuilding"
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
      
            <VRow class="mt-3">
              <VCol
                cols="12"
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  class="mb-2 mt-2"
                  color="warning"
                  @click="goBack"
                >
                  Cancel
                </VBtn>
                <VBtn
                  class="mb-2 mt-2"
                  color="success"
                  type="submit"
                >
                  Dispose
                </VBtn>
              </VCol>
            </VRow>
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
