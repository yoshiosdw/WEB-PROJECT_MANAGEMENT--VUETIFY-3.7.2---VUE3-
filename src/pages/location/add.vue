<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import router from "@/router"
import Swal from "sweetalert2"
import { watchEffect } from "vue"

const loading = ref(true)
const refLocationForm = ref()

const location = ref()
const site = ref()
const siteId = ref()
const building = ref()
const buildingId = ref()
const floor = ref()

const selectedSite = ref()
const selectedBuilding = ref()
const selectedFloor = ref()

const code = ref()
const name = ref()
const description = ref()
const parent_id = ref()
const location_category_id = ref()
const locationCategory = ref()

const data = [
  {
    id: 1,
    name: 'Site',
  },
  {
    id: 2,
    name: 'Building',
  },
  {
    id: 3,
    name: 'Floor',
  },
]

const fetchSite = async() => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`locations/getlocation/ticket` )

    site.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  }
}

const fetchBuilding = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`locations/for/building` )

    building.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  }
}

const fetchLocationCategory = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`location/category` )

    locationCategory.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  }
}


const createLocation = async() => {
  loading.value = true
  try {
    parent_id.value = siteId.value || buildingId.value || 9
    
    const response = await axiosIns.post('/locations', {
      code        : code.value,
      name        : name.value,
      keterangan  : description.value,
      parent_id   : parent_id.value,
      location_category_id : location_category_id.value,
    } )

    router.back()
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  } finally{loading.value = false}
}

watch(location, async newLocation => {
  let categoryId = null
  
  if (newLocation?.name === 'Building') {
    loading.value = true
    await fetchSite()
    await fetchLocationCategory()
    selectedBuilding.value = true
    selectedSite.value = false
    selectedFloor.value = false
    loading.value = false

    const category = locationCategory.value.find(cat => cat.category === 'BUILDING')

    categoryId = category ? category.id : null

  } else if (newLocation?.name === 'Floor') {
    loading.value = true
    await fetchBuilding()
    await fetchLocationCategory()
    selectedFloor.value = true
    selectedSite.value = false
    selectedBuilding.value = false
    loading.value = false

    const category = locationCategory.value.find(cat => cat.category === 'FLOOR')

    categoryId = category ? category.id : null

  } else if (newLocation?.name === 'Site') {
    await fetchLocationCategory()

    const category = locationCategory.value.find(cat => cat.category === 'SITE')

    categoryId = category ? category.id : null

  } else {
    selectedFloor.value = true
    selectedSite.value = false
    selectedBuilding.value = false
    selectedFloor.value = false
    loading.value = false
  }

  location_category_id.value = categoryId
})


watchEffect(() => {
  fetchLocationCategory()
})

const goBack = () => {
  router.back()
}

const onSubmit = () => {
  refLocationForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) createLocation()
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VForm
          ref="refLocationForm"
          @submit.prevent="onSubmit"
        >
          <VCardTitle class="mt-2 me-3">
            Add Location For
          </VCardTitle>
          <VCardText class="d-flex flex-wrap justify-space-between flex-column flex-sm-row gap-4">
            <VRadioGroup
              v-model="location"
              inline
              :rules="[requiredValidator]"
            >
              <VRadio 
                v-for="hal in data"
                :key="hal.name"
                :label="hal.name"
                :value="hal"
              />
            </VRadioGroup>
            <VCol
              v-if="selectedBuilding"
              cols="6"
              class="d-flex justify-end gap-3 "
            >
              <VSelect
                v-model="siteId"         
                item-value="id"
                item-title="name"
                :items="site"          
                label="Select Site for Building"
                clearable
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              v-if="selectedFloor"
              cols="6"
              class="d-flex justify-end gap-3 "
            >
              <VSelect
                v-model="buildingId"
                item-value="id"
                :items="building"
                item-title="name"
                label="Select Building for Floor"
                clearable
                :menu-props="{ maxHeight: '300px' }"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VCardText>
          <VDivider />
          <VCardText>
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="code"
                  label="Code"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="name"
                  label="Name Location"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="description"
                  label="Description"
                />
              </VCol>
            </VRow>
          </VCardText>
          <VCardText>
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <VBtn
                    color="warning"
                    @click="goBack"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    color="success"
                    type="submit"
                  >
                    Save
                  </VBtn>
                </div>
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
    subject: Dashboard
    redirectIfLoggedIn: false
  </route>
