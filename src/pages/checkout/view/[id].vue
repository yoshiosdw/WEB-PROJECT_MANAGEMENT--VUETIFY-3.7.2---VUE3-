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
import { useCheckoutStore } from '../useCheckoutStore'

const emits = defineEmits(['idCheckout', 'save'])

const router = useRouter()
const route = useRoute()

const checkoutId = route.params.id
const assetByIdData = ref()


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
const checkoutTo = ref()
const expectCheckin = ref()
const checkoutDate = ref(new Date())
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
const checkoutStore = useCheckoutStore()

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

const checkoutData = ref([])
const dataCheckoutTo = ref()
const dataReference = ref()


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


const assNum = ref()
const itemName = ref()

const fetchCheckout = async checkoutId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/checkouts/${checkoutId}` )

    checkoutData.value = ret.data.data[0]
    assetId.value = checkoutData.value.check_out_line.asset_id
    dataCheckoutTo.value = checkoutData.value.checkout_to
    note.value = checkoutData.value.note

    // dataReference.value = checkoutData.value.employee.person.name
    qty.value = checkoutData.value.check_out_line.quantity

    assNum.value = checkoutData.value.check_out_line.asset[0].asset_number
    itemName.value = checkoutData.value.check_out_line.asset[0].item.name
 
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
  await fetchCheckout(checkoutId)
  fetchItem()
  fetchLocation()
  fetchEmployee()
})

watch(assetId, async newAssetId => {
  if (newAssetId) {
    await fetchAssetById(newAssetId)
  }
})


watch(checkoutTo, async newCheckoutTo => {
  if (newCheckoutTo && newCheckoutTo.name === 'Item') {
    loading.value = true
    await fetchItem()
    selectedRef.value = true
    selectedReLoc.value = false
    selectedRefEmp.value = false
    loading.value = false

  } else if(newCheckoutTo && newCheckoutTo.name === 'Location') {
    loading.value = true
    await fetchLocation()
    selectedReLoc.value = true
    selectedRef.value = false
    selectedRefEmp.value = false
    loading.value = false
  } else if(newCheckoutTo && newCheckoutTo.name === 'Employee') {
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

watch(dataCheckoutTo, newValue => {
  if (newValue) {
    const matchedFilter = checkoutFilter.find(filter => filter.name === newValue)
    if (matchedFilter) {
      checkoutTo.value = matchedFilter
    } else {
      checkoutTo.value = null
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

watch(dataCheckoutTo, newValue => {
  if (newValue) {
    if (newValue === 'Item') {
      item.value = checkoutData.value.item.name
      itemId.value = checkoutData.value.item.id
      category.value = checkoutData.value.item.item_category.name
      description.value = checkoutData.value.item.description
    } else if (newValue === 'Location') {
      locationId.value = checkoutData.value.location.id
    } else if (newValue === 'Employee') {
      person.value = checkoutData.value.employee.person.name
      personId.value = checkoutData.value.employee.person.id
    }
  }
})
</script>

<template>
  <VRow>
    <VCol
      cols="12"
    >
      <VOverlay v-model="loading" />
      <VRow>
        <VCol cols="12">
          <VTabs>
            <VTab
              @click="goBack"
            >
              <VIcon
                :size="35"
                icon="tabler-corner-down-left-double"
                class="me-1"
              />
              <span> Back </span>
            </VTab>
          </VTabs>
        </VCol>
      </VRow>
      <VCard
        :loading="loading"
        class="mt-3"
      >
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
                  Posting Checkout
                </h6>
              </div>
            </div>
            <div class="mt-4 ma-sm-1">
              <p class="d-flex align-center justify-sm-end mb-2">
                <span class="me-2">Document Number</span>
                <span>
                  <VTextField 
                    v-model="checkoutData.document_number"
                    readonly
                    variant="filled"
                    style="width: 11rem;"
                  />
                </span>
              </p>
              <p class="d-flex align-center justify-sm-end mb-2">
                <span class="me-2">Document Date</span>
                <span>
                  <VTextField 
                    v-model="checkoutData.document_date"
                    density="compact"
                    style="width: 11rem;"
                    variant="filled"
                    readonly
                  />
                </span>
              </p>
              <p class="d-flex align-center justify-sm-end mb-2">
                <span class="me-2">Expectation Checkin</span>
                <span>
                  <VTextField 
                    v-model="checkoutData.expected_checkin_date"
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
                  Checkout To :
                </h6>
                <VRadioGroup
                  v-model="checkoutTo"
                  inline
                  :rules="[requiredValidator]"
                  :disabled="isSaved"
                  readonly
                >
                  <VRadio 
                    v-for="hal in checkoutFilter"
                    :key="hal.name"
                    :label="hal.name"
                    :value="hal"
                    readonly
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
                variant="filled"
                :disabled="isSaved"
                clearable
                :rules="[requiredValidator]"
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
                variant="filled"
                clearable
                :disabled="isSaved"
                :rules="[requiredValidator]"
              />
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
                readonly
                variant="filled"
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
                readonly
                variant="filled"
                :rules="[requiredValidator]"
                :menu-props="{ maxHeight: '300px' }"
              />
            </VCol>

            <VCol cols="4">
              <VSelect
                v-model="floorId"
                item-title="name"
                item-value="id"
                readonly
                variant="filled"
                :disabled="isSaved"
                :items="floorLocation"
                label="Floor"
                @change="fetchSubFloor(buildingId)"
              />
            </VCol>
          </VRow>

          <VRow
            class="mt-3"
          >
            <VCol cols="4">
              <VTextField 
                v-model="assNum"
                label="Asset"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol cols="4">
              <VTextField 
                v-model="itemName"
                label="Item Name"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol cols="4">
              <VTextField 
                v-model="qty"
                label="Quantity"
                readonly
                variant="filled"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VDivider />
        <VCardText class="mx-sm-4">
          <VTextarea
            v-model="note"
            :rows="2"
            readonly
            variant="filled"
            label="Note"
            :rules="[requiredValidator]"
          />
        </VCardText>
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
