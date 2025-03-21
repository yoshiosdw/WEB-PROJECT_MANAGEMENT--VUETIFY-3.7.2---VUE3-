<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import ItemDIalog from '../item/itemDialog.vue'


const router = useRouter()
const refReceiveForm = ref()
const refReceiveLineForm = ref()

const documentNumber = ref('')
const documentDate = ref(new Date())
const locationData = ref()
const location = ref()
const vendorData = ref()
const vendor = ref()
const purchaseNumber = ref()
const description = ref()
const loading = ref(false)
const saved = ref(false)

const item = ref()
const items = ref()
const itemId = ref()
const itemCategoryId = ref()

const brand = ref()
const serialNumber = ref()

const organization = ref()
const organizationId = ref()

const manufactureData = ref()
const manufacture = ref()


const uom = ref()
const uomData = ref()
const quantity = ref()
const price = ref()

const locationId = ref()
const buildingId = ref()
const floorId = ref()
const siteLocation = ref()
const buildingLocation = ref()
const floorLocation = ref()

const receiveId = ref()

const getValueFromItem = val => {
  item.value = val.name
  itemId.value = val.id
  itemCategoryId.value = val.item_category.id
}

const fetchItem = async() => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/items' )

    items.value = ret.data.data
    loading.value = false
  } catch(error) {
    loading.value = false
    console.log(error)
  }
}

const receiveLoc = ref ([])
const floorIdSent = ref ([])


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

const fetchVendor = async() => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/vendors' )

    vendorData.value = ret.data.data
  } catch(error) {
    console.log(error)
  }
}


watchEffect(() => {
  fetchVendor(), fetchItem(), fetchUom()
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

// watchEffect(() => {
//   if (receiveLoc.value && receiveLoc.value.location) {
//     locationId.value = receiveLoc.value.location.ancestors[1].name
//     buildingId.value = receiveLoc.value.location.ancestors[2].name
//     floorId.value = receiveLoc.value.location.name
//   }
// })

// watch(locationId, newLocationId => {
//   loading.value = true
//   buildingId.value = null
//   if (newLocationId){
//     fetchSubBuilding(newLocationId)
//   }
//   loading.value = false
// })

// watch(buildingId, newBuildingId => {
//   loading.value = true
//   floorId.value = null
//   if (newBuildingId){
//     fetchSubFloor(newBuildingId) 
//   }
//   loading.value = false
// })



const createReceive = async() => {
  loading.value = true
  try {
    const ret = await axiosIns.post('/receives', {
      document_date: formatDateMySql(documentDate.value),
      description: description.value,
      vendor_id: vendor.value,
      purchase_number: purchaseNumber.value,
    } )

    receiveId.value = ret.data.data.id
    saved.value = true
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
  }finally{loading.value = false}
}

const onSubmit = () => {
  refReceiveForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createReceive()
    }
  })
}

const createReceiveLine = async() => {
  loading.value = true
  try {

    const params = {
      receive_id: receiveId.value,
      uom_id: uom.value,
      item_id: itemId.value,
      quantity: quantity.value,
      price: price.value,

      // serial_number: serialNumber.value,
      // brand: brand.value,
      // manufacturer_id: manufacture.value,
      // organization_id: organizationId.value,
    
    }

    // const locationIdStr = String(locationId.value)

    // if (receiveLoc.value && receiveLoc.value.location) {
    //   params.location_id = floorIdSent.value
    // } else if (locationIdStr === '111') {
    //   params.location_id = locationIdStr
    // } else {
    //   params.location_id = floorId.value ? floorId.value : buildingId.value
    // }

    const ret = await axiosIns.post('/receive/lines', params )

    router.push('/receive')
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
  }finally{loading.value = false}
}

const submit = () => {
  refReceiveForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createReceiveLine()
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardTitle>Receive Form</VCardTitle>
        <VForm
          ref="refReceiveForm"
          @submit.prevent="onSubmit"
        >
          <VCardText>
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="purchaseNumber"
                  label="Purchase Number"
                  :readonly="saved"
                  :rules="[requiredValidator]"
                />
              </VCol>
             
              <VCol cols="4">
                <VDateInput 
                  v-model="documentDate"
                  label="Document Date"
                  :readonly="saved"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VSelect 
                  v-model="vendor"
                  label="Vendor"
                  :items="vendorData"
                  item-title="name"
                  item-value="id"
                  :readonly="saved"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="8">
                <VTextField 
                  v-model="description"
                  label="Description"
                  :readonly="saved"
                />
              </VCol>
            </VRow>
          
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  v-if="!saved"
                  :to="{name: 'receive'}"
                  color="warning"
                >
                  Close
                </VBtn>
                <VBtn
                  v-if="!saved"
                  color="success"
                  type="submit"
                >
                  Next
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VForm>
      </VCard>

      <Spacer />
      <VCard
        v-if="saved"
        class="mt-3"
      >
        <VCardTitle>Detail Receive</VCardTitle>
        <VForm
         
          ref="refReceiveLineForm"
          @submit.prevent="submit"
        >
          <VCardText>
            <VRow>
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
                />
                <ItemDIalog @item="getValueFromItem" /> 
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="quantity"
                  label="quantity"
                  type="number"
                  reverse
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="3">
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
            </VRow>

            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="price"
                  :rules="[requiredValidator]"
                  label="Price"
                  type="number"
                  reverse
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  color="success"
                  @click="createReceiveLine"
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
