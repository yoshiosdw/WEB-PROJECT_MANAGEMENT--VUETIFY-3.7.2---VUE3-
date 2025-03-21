<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import userImg from '@/assets/images/sjb.png'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const receiveId = route.params.id

const loading = ref(false)

const receives = ref ([])
const refReceive = ref()

const reNumber = ref()
const reDate = ref()
const purchase = ref()

const item = ref()
const itemId = ref()

const descrip = ref()
const price = ref()
const vendor = ref()
const qty = ref()
const uom = ref()

const organization = ref()
const organizationId = ref()

const manufactureData = ref()
const manufacture = ref()

const locationId = ref()
const buildingId = ref()
const floorId = ref()
const siteLocation = ref()
const buildingLocation = ref()
const floorLocation = ref()

const condition = ref()
const brand = ref()
const serialNumber = ref()

const itemCategoryId = ref()

const receiveLoc = ref ([])
const floorIdSent = ref ([])

const optionCondition = [
  { text: 'Baru' },
  { text: 'Bekas' },
  { text: 'Baik' },
  { text: 'Jelek' },
  { text: 'Rusak' },
]

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

const fetchReceives = async receiveId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/receives/${receiveId}` )

    loading.value = false

    receives.value = ret.data.data[0]
    reNumber.value = receives.value.document_number
    reDate.value = receives.value.document_date
    purchase.value = receives.value.purchase_number
    descrip.value = receives.value.description
    vendor.value = receives.value.vendor.name
    item.value = receives.value.line[0].item.name
    itemId.value = receives.value.line[0].item.id
    price.value = receives.value.line[0].price
    uom.value = receives.value.line[0].uom.code
    qty.value = receives.value.line[0].quantity
    itemCategoryId.value = receives.value.line[0].item.item_category_id
  
  } catch(error){
    loading.value = false
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

const fetchReceiveLoc = async itemCategoryId => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/receive/location', {
     
      params: {
        item_category_id: itemCategoryId,
      },
    })

    receiveLoc.value = ret.data.data[0]
    
    // locationId.value = receiveLoc.value.location.ancestors[1].name
    // buildingId.value = receiveLoc.value.location.ancestors[2].name
    // floorId.value = receiveLoc.value.location.name

    floorIdSent.value = receiveLoc.value.location.id
    loading.value = false
  } catch(error) {
    loading.value = false
    console.log(error)
  }
}

const posting = async receiveId => {
  loading.value = true
  try {
    const promises = []
    for (let i = 0; i < qty.value; i++) {
      const params = {
        serial_number: serialNumber.value,
        item_id: itemId.value,
        description: descrip.value,
        item_condition: condition.value,
        brand: brand.value,
        manufacturer_id: manufacture.value,
        organization_id: organizationId.value,
        receive_id: receiveId,
      }

      const locationIdStr = String(locationId.value)

      if (receiveLoc.value && receiveLoc.value.location) {
        params.location_id = floorIdSent.value
      } else if (locationIdStr === '111') {
        params.location_id = locationIdStr
      } else {
        params.location_id = floorId.value ? floorId.value : buildingId.value
      }

      promises.push(axiosIns.post(`/receive/lines/posting`, params, {
        
      }))
    }

    await Promise.all(promises)
    router.push('/receive')
    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}


const onSubmit = () => {
  refReceive.value?.validate().then(({ valid: isValid }) => {
    if(isValid) posting(receiveId)
  })
}

watchEffect(() => {
  fetchReceives(), 
  fetchLocation(), fetchOrganization(),
  fetchManufacture()
})

watch(itemCategoryId, async newItemCategoryId => {
  if (newItemCategoryId) {
    await fetchReceiveLoc(newItemCategoryId)
  }
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

watchEffect(() => {
  if (receiveLoc.value && receiveLoc.value.location) {
    locationId.value = receiveLoc.value.location.ancestors[1].name
    buildingId.value = receiveLoc.value.location.ancestors[2].name
    floorId.value = receiveLoc.value.location.name
  }
})

watchEffect(() => {
  fetchReceives(receiveId)
})

const goBack = () => {
  router.push('/receive')
}
</script>

<template>
  <VForm
    ref="refReceive"
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
                    CONFIRM FORM
                  </h6>
                </div>
              </div>
            
              <div class="mt-4 ma-sm-1">
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Receive Number</span>
                  <span>
                    <VTextField 
                      v-model="reNumber"
                      readonly
                      style="width: 11rem;"
                      variant="filled"
                    />
                  </span>
                </p>
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Purchase Number</span>
                  <span>
                    <VTextField 
                      v-model="purchase"
                      readonly
                      style="width: 11rem;"
                      variant="filled"
                    />
                  </span>
                </p>
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Receive Date</span>
                  <span>
                    <VTextField 
                      v-model="reDate"
                      readonly
                      style="width: 11rem;"
                      variant="filled"
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
                cols="4"
                class="d-flex "
              >
                <VTextField
                  v-model="purchase"
                  label="Vendor"
                  variant="filled"
                  readonly
                />
              </VCol>

              <VCol
                cols="4"
                class="d-flex "
              >
                <VTextField
                  v-model="item"
                  label="Item"
                  variant="filled"
                  readonly
                />
              </VCol>

              <VCol
                cols="4"
                class="d-flex "
              >
                <VTextField
                  v-model="price"
                  label="Price"
                  variant="filled"
                  readonly
                />
              </VCol>
            </VRow>
            <VRow class="mt-2">
              <VCol
                cols="4"
                class="d-flex "
              >
                <VTextField
                  v-model="uom"
                  label="Uom"
                  variant="filled"
                  readonly
                />
              </VCol>

              <VCol
                cols="4"
                class="d-flex "
              >
                <VTextField
                  v-model="qty"
                  label="Qty"
                  variant="filled"
                  readonly
                />
              </VCol>
            </VRow>

            <VRow
              cols="12"
              class="mt-2"
            >
              <VTextField
                v-model="descrip"
                :rows="2"
                label="Description"
                readonly
                variant="filled"
              />
            </VRow>
          </VCardText>

          <VDivider />
          <VCardTitle class="mt-3 mx-sm-4">
            Confirm Detail
          </VCardTitle>
          <VCardText class="mx-sm-4 mt-3">
            <VRow>
              <VCol
                cols="4"
                class="d-flex "
              >
                <VTextField
                  v-model="serialNumber"
                  label="Serial Number"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol
                cols="4"
                class="d-flex "
              >
                <VTextField
                  v-model="brand"
                  label="Brand"
                />
              </VCol>

              <VCol
                cols="4"
                class="d-flex "
              >
                <VSelect
                  v-model="condition"
                  label="condition"
                  :items="optionCondition"
                  item-title="text"
                  item-value="text"
                  clearable
                />
              </VCol>
            </VRow>

            <VRow class="mt-2">
              <VCol cols="6">
                <VSelect 
                  v-model="manufacture"
                  label="Manufacturer"
                  :items="manufactureData"
                  item-title="name"
                  item-value="id"
                  :rules="[requiredValidator]"
                  clearable
                />
              </VCol>

              <VCol cols="6">
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

            <VRow class="mt-2">
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
                  clearable
                  :items="buildingLocation"
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
                  :items="floorLocation"
                  clearable
                  label="Floor"
                  :rules="[requiredValidator]"
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
    subject: Dashboard
    redirectIfLoggedIn: false
</route>
