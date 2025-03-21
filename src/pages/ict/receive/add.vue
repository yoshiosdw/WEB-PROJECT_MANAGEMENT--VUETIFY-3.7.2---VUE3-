<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import ReceiveLine from './receiveLine.vue'
import { useReceiveStore } from './useReceiveStore'

const receiveForm = ref()
const receiveStore = useReceiveStore()

const document_number = ref()
const document_date = ref()
const description = ref()
const phone_number = ref()
const location = ref()
const locationData = ref()
const vendor = ref()
const vendorData = ref()

const isLoading = ref(true)
const saved = ref(false)

const fetchVendor = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/vendor/', {
      
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    vendorData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

const fetchLocation = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/location/', {
      
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    locationData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

onMounted(() => {
  fetchVendor(),
  fetchLocation()
})

const createReceive = async() => {
  try {
    const ret = await axiosIns.post('/ict/receive', {
      document_number: document_number.value,
      document_date: formatDateMySql(document_date.value),
      description: description.value,
      po_number: phone_number.value,
      location_id: location.value,
      vendor_id: vendor.value,
    } )

    // document_number.value = null;
    // document_date.value = null
    // description.value = null
    // phone_number.value = null
    // location.value = null
    // vendor.value = null
    
    Swal.fire({
      title: 'LBG',
      text: 'Create new Receive success',
      icon: 'success',
    })
    saved.value = true
    receiveStore.receive = ret.data.data
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: 'Create Receive failed',
      icon: 'error',
    })
  }
}

const onSubmit = () => {
  receiveForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createReceive()
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <!-- <VOverlay v-model="isLoading" /> -->
      <VCard>
        <VCardText>
          <VForm
            ref="receiveForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="document_number"
                  :rules="[requireValidator]"
                  label="Document Number"
                />
              </VCol>
              <VCol cols="4">
                <VDateInput 
                  v-model="document_date"
                  :rules="[requiredValidator]"
                  label="Document Date"
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="phone_number"
                  :rules="[requireValidator]"
                  label="Phone Number"
                />               
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VSelect 
                  v-model="location"
                  label="Location"
                  placeholder="Location"
                  :items="locationData"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requireValidator]"
                />                
              </VCol>
              <VCol cols="6">
                <VSelect 
                  v-model="vendor"
                  label="Vendor"
                  placeholder="Vendor"
                  :items="vendorData"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requireValidator]"
                />                
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  :rules="[requireValidator]"
                  label="Description"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  :to="{name: 'ict-receive'}"
                  color="warning"
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
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard v-if="saved">
        <!-- <VCardText> -->
        <ReceiveLine />
      <!-- </VCardText> -->
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
