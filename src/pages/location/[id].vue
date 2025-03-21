<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import router from "@/router"
import Swal from "sweetalert2"
import { watchEffect } from "vue"
import { useRoute } from 'vue-router'

const route = useRoute()

const loading = ref(true)
const locId = ref(route.params.id)

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
const locationCategoryname = ref()

const dataLoc = ref()

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


const fetchDataLocation = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`locations/${locId.value}` )

    location.value = ret.data.data[0]

    code.value                  = location.value.code
    name.value                  = location.value.name
    description.value           = location.value.keterangan
    locationCategoryname.value  = location.value.location_category.category 
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  }
}

watch(locationCategoryname, newCategory => {
  const category = data.find(cat => cat.name === newCategory)
  if (category) {
    location.value = category
  }
})


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

    selectedSite.value = true
    selectedBuilding.value = false
    selectedFloor.value = false
    

    const category = locationCategory.value.find(cat => cat.category === 'SITE')

    categoryId = category ? category.id : null

    parent_id.value = 9

  } else {
    selectedSite.value = false
    selectedBuilding.value = false
    selectedFloor.value = false
    loading.value = false
    
  }

  location_category_id.value = categoryId
})

watch(locationCategoryname, newCategory => {
  let categoryName = ''
  let ancestorId = null

  switch (newCategory) {
  case 'SITE':
    categoryName = 'Site'

    parent_id.value = siteId.value || 9
    break
  case 'BUILDING':
    categoryName = 'Building'
    ancestorId = location.value.ancestor ? location.value.ancestor.id : null
    siteId.value = ancestorId  
    break
  case 'FLOOR':
    categoryName = 'Floor'
    ancestorId = location.value.ancestor ? location.value.ancestor.id : null
    buildingId.value = ancestorId  
    break
  default:
    categoryName = ''
  }

  if (categoryName) {
    location.value = data.find(item => item.name === categoryName)
  }
})


watch([siteId, buildingId, selectedSite], () => {

  if (selectedSite.value) {
    parent_id.value = 9 
  } else if (buildingId.value) {
    parent_id.value = buildingId.value
  } else if (siteId.value) {
    parent_id.value = siteId.value
  } else {
    parent_id.value = 9 
  }


})


const updateLocations = async() => {
  loading.value = true
  try {
    
    const response = await axiosIns.patch(`/locations/${locId.value}`, {
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

watchEffect(() => {
  fetchDataLocation()
})

const goBack = () => {
  router.back()
}

const onSubmit = () => {
  refLocationForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) updateLocations()
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        {{ parent_id }}
        <VForm
          ref="refLocationForm"
          @submit.prevent="onSubmit"
        >
          <VCardTitle class="mt-2 me-3">
            Modify Location
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
