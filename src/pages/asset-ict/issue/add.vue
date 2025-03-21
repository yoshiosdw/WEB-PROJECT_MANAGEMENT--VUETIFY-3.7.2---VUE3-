<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import ItemDialog from '@/pages/item/itemDialog.vue'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from 'vue'

// import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue';

import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)

const documentDate = ref(new Date())
const dueDate = ref(new Date())


const issueForm = ref()
const issueId = ref()


const item = ref()
const items = ref()
const itemId = ref()
const itemCategoryId = ref()

const uom = ref()
const uomData = ref()
const description = ref()
const quantity = ref()
const price = ref()

const locationId = ref()
const buildingId = ref()
const floorId = ref()
const siteLocation = ref()
const buildingLocation = ref()
const floorLocation = ref()


const getValueFromItem = val => {
  item.value = val.name
  itemId.value = val.id
  itemCategoryId.value = val.item_category.id
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

const fetchUom = async(page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/uoms', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    uomData.value = ret.data.data
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    loading.value = false
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
  fetchUom(), fetchLocation()
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
  // router.push('/assets-issue')
  router.back()

}

const computedRulesBuilding = computed(() => {
  const locationIdStr = String(locationId.value)
  
  return locationIdStr === '111' ? [] : [requiredValidator]
})

const createIssue = async () => {
  loading.value = true
  try {
    const headerParams = {
      document_date: documentDate.value,
      description: description.value,
    }

    const locationIdStr = String(locationId.value)
    if (locationIdStr === '111') {
      headerParams.location_id = locationIdStr
    } else {
      headerParams.location_id = floorId.value ? floorId.value : buildingId.value
    }
    
    const response = await axiosIns.post('/issues', headerParams )

    issueId.value = response.data.data.id

    const lineParams = {
      issue_id: issueId.value,
      item_id: itemId.value,
      uom_id: uom.value,
      quantity: quantity.value,
      price: price.value,
    }

    await axiosIns.post('/issue/lines', lineParams )

    router.back()
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
  } finally{loading.value = false}
}

const onSubmit = () => {
  issueForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) createIssue()
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VForm
          ref="issueForm"
          @submit.prevent="onSubmit"
        >
          <VCardTitle>Add Issue</VCardTitle>
          <VCardText class="mt-4">
            <VRow>
              <VCol cols="4">
                <VDateInput 
                  v-model="documentDate"
                  :rules="[requiredValidator]"
                  :config="{ dateFormat: 'Y-m-d H:i', position: 'auto right ', minDate: dueDate }"
                  :disabled="isSaved"
                  label="Document Date"
                />
              </VCol>

              <VCol
                cols="8"
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
                  :rules="[requiredValidator]"
                />   
                <ItemDialog @item="getValueFromItem" />              
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="4">
                <VSelect
                  v-model="uom"
                  :items="uomData"
                  item-title="code"
                  item-value="id"
                  :rules="[requiredValidator]"
                  label="Uom"
                  clearable
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="quantity"
                  :rules="[requiredValidator]"
                  label="quantity"
                  type="number"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="price"
                  :rules="[requiredValidator]"
                  label="price"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="4">
                <VSelect
                  v-model="locationId"
                  item-title="name"
                  item-value="id"
                  :items="siteLocation"
                  clearable
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
                  label="Building"
                  clearable
                  :rules="computedRulesBuilding"
                  :menu-props="{ maxHeight: '300px' }"
                />
              </VCol>

              <VCol cols="4">
                <VSelect
                  v-model="floorId"
                  item-title="name"
                  item-value="id"
                  :items="floorLocation"
                  clearable
                  label="Floor"
                  @change="fetchSubFloor(buildingId)"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  :rules="[requiredValidator]"
                  label="Description"
                  rows="2"
                />
              </VCol>
            </VRow>

            
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
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
