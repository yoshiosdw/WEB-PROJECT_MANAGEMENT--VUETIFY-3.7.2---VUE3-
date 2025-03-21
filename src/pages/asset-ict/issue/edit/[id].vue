<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import userImg from '@/assets/images/sjb.png'
import ItemDialog from '@/pages/item/itemDialog.vue'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from 'vue'

// import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue';

import { useRoute, useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)

const route = useRoute()
const issueId = route.params.id

const issueForm = ref()

const item = ref()
const items = ref()
const itemId = ref()
const itemIdSelect = ref()
const itemCategoryId = ref()

const uom = ref()
const uomId = ref()
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
const floorIdSent = ref()

const issueData = ref([])

const documentNumber = ref()
const documentDate = ref()

const getValueFromItem = val => {
  item.value = val.name
  itemIdSelect.value = val.id
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

const fetchIssue = async issueId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/issues/${issueId}` )

    issueData.value = ret.data.data[0]

    documentNumber.value = issueData.value.document_number
    documentDate.value = issueData.value.document_date
    item.value = issueData.value.line[0].item.name
    itemId.value = issueData.value.line[0].item.id
    uom.value =issueData.value.line[0].uom.code
    uomId.value =issueData.value.line[0].uom.id
    price.value = issueData.value.line[0].price
    quantity.value = issueData.value.line[0].quantity
    description.value = issueData.value.description

    // locationId.value = issueData.value.location.ancestors[1].name
    // locationId.value = issueData.value.location.ancestors[2].name
    // locationId.value = issueData.value.location.name

    floorIdSent.value = issueData.value.location.id

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
  if (issueData.value && issueData.value.location) {
    locationId.value = issueData.value.location.ancestors[1] ? issueData.value.location.ancestors[1].name : '-'
    buildingId.value = issueData.value.location.ancestors[2] ? issueData.value.location.ancestors[2].name : '-'
    floorId.value = issueData.value.location.name
  }
})

watchEffect(() => {
  fetchUom(), fetchLocation(), fetchIssue(issueId)
})

watch(locationId, newLocationId => {
  if (typeof newLocationId === 'number') {
    loading.value = true
    buildingId.value = null
    floorId.value = null
    fetchSubBuilding(newLocationId).then(() => {
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  }
})

watch(buildingId, newBuildingId => {
  if (typeof newBuildingId === 'number') {
    loading.value = true
    floorId.value = null
    fetchSubFloor(newBuildingId).then(() => {
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  }
})


const goBack = () => {
  // router.push('/assets-issue')
  router.back()

}

const computedRulesBuilding = computed(() => {
  const locationIdStr = String(locationId.value)
  
  return locationIdStr === '111' ? [] : [requiredValidator]
})

const updateIssue = async issueId => {
  loading.value = true
  try {
    const params = {
      description: description.value,
      uom_id: uom.value.id === null ? uom.value.id : uomId.value,
      issue_id: issueId.value,
      quantity: quantity.value,
      price: price.value,
      item_id: itemIdSelect.value === null ? itemIdSelect.value : itemId.value,
    }

    const locationIdStr = String(locationId.value)
    if (issueData.value && issueData.value.location) {
      params.location_id = floorIdSent.value
    } else if (locationIdStr === '111') {
      params.location_id = locationIdStr
    } else {
      params.location_id = floorId.value ? floorId.value : buildingId.value
    }
    
    const response = await axiosIns.patch(`/issues/${issueId}`, params )

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
    if(isValid) updateIssue(issueId)
  })
}
</script>

<template>
  <VForm
    ref="issueForm"
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
                    class="me-3"
                  />
                  
                  <VAvatar
                    rounded
                    :size="40"
                    color="primary"
                    variant="none"
                  >
                    <VImg 
                      max-width="100"
                      :src="userImg"
                    />
                  </VAvatar>
                  <h6 class="font-weight-bold text-xl ms-3">
                    DETAIL ISSUE
                  </h6>
                </div>
              </div>

              <div class="mt-4 ma-sm-1">
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Document Number</span>
                  <span>
                    <VTextField 
                      v-model="documentNumber"
                      readonly
                      variant="filled"
                      style="width: 8.9rem;"
                    />
                  </span>
                </p>
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Document Date</span>
                  <span>
                    <VTextField 
                      v-model="documentDate"
                      density="compact"
                      style="width: 8.9rem;"
                      readonly
                      variant="filled"
                    />
                  </span>
                </p>
              </div>
            </VCardText>
          </div>

          <VDivider />
          <VCardText>
            <VRow>
              <VCol
                cols="6"
                class="d-flex justify-end gap-3 "
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
              <VCol
                cols="3"
                class="d-flex justify-end gap-3 "
              >
                <VSelect
                  v-model="uom"
                  :items="uomData"
                  item-title="code"
                  return-object
                  :rules="[requiredValidator]"
                  label="Uom"
                />
              </VCol>
              <VCol
                cols="3"
                class="d-flex justify-end gap-3 "
              >
                <VTextField
                  v-model="quantity"
                  label="Quantity"
                  type="number"
                />
              </VCol>
            </VRow>

            <VRow class="mt-3">
              <VCol
                cols="4"
                class="d-flex justify-end gap-3 "
              >
                <VTextField
                  v-model="price"
                  label="price"
                />
              </VCol>
              <VCol
                cols="8"
                class="d-flex justify-end gap-3 "
              >
                <VTextField
                  v-model="description"
                  label="description"
                />
              </VCol>
            </VRow>

            <VRow class="mt-3">
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
              color="error"
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
