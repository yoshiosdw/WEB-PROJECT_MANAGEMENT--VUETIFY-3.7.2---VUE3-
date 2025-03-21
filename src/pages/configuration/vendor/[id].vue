<script setup>
import axiosIns from "@/plugins/axios"
import { themeConfig } from '@themeConfig'
import Swal from "sweetalert2"
import { useRoute, useRouter } from "vue-router"
import { useVendorStore } from "./useVendorStore"

const route = useRoute()
const router = useRouter()
const vendorId = route.params.id 
const vendor = ref()
const code = ref()
const name = ref()
const phone_number = ref()
const city = ref()
const address = ref()
const vendorStore = useVendorStore()
const refUpdateVendorForm = ref()


const loading = ref(false)

const fetchVendor = async vendorId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/vendors/${vendorId}` )

    vendor.value = ret.data.data[0]
    code.value = vendor.value.code
    name.value = vendor.value.name
    city.value = vendor.value.city
    phone_number.value = vendor.value.phone_number
    address.value = vendor.value.address

    // vendorStore.value = ret.data.data
    // vendorStore.vendor(ret.data.data[0])
    loading.value = false
  } catch(error) {
    Swal.fire({
      text: 'Failed to load Vendor',
      title: themeConfig.app.title,
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchVendor(vendorId)
})

onBeforeUnmount(() => {
  vendorStore.vendor = null
})

const updateVendor = async vendorId => {
  loading.value = true
  try {
    const ret = await axiosIns.patch(`/vendors/${vendorId}`, {
      code:code.value,
      name: name.value,
      phone_number: phone_number.value,
      city: city.value,
      address: address.value,
    } )

    router.back()
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }finally{loading.value = false}
  
}

const goBack = () => {
  router.back()
}


const onSubmit = () => {
  refUpdateVendorForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateVendor(vendorId)
  })
}
</script>

<template>
  <div>
    <VOverlay v-model="loading" />
    <VCard>
      <VCardText v-if="vendor">
        <VForm
          ref="refUpdateVendorForm"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="6">
              <VTextField 
                v-model="code"
                label="Code"
              />
            </VCol>
            <VCol cols="6">
              <VTextField 
                v-model="name"
                label="Name"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextField 
                v-model="phone_number"
                label="Phone Number"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="city"
                label="City"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea 
                v-model="address"
                label="Address"
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
                type="submit"
              >
                Save
              </VBtn>

              <VBtn 
                color="warning"
                @click="goBack"
              >
                Close
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
