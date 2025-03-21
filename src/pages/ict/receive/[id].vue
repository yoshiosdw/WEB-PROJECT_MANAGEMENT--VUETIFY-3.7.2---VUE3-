<script setup>
import { formatDateMySql } from "@/@core/utils/formatters"
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"
import ReceiveLine from './receiveLine.vue'
import { useReceiveStore } from "./useReceiveStore"

const route = useRoute()
const receiveId = route.params.id 
const receive = ref()
const receiveStore = useReceiveStore()

const location = ref()
const locationData = ref()
const vendor = ref()
const vendorData = ref()

const receiveLine = ref()

const isLoading = ref(false)
const saved = ref(false)

const fetchItem = async receiveId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/ict/receive/${receiveId}` )

    receive.value = ret.data.data[0]
    receiveStore.setReceive(ret.data.data[0])
    isLoading.value = false
  } catch(error) {
    Swal.fire({
      text: 'Failed to load Item',
      title: 'LBG',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchItem(receiveId)
})

const fetchReceiveLine = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/ict/receive/line/by', {
      
      params: {
        receive_id: route.params.id,
      },
    })

    receiveLine.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

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
  fetchLocation(),
  fetchReceiveLine()
})

onBeforeUnmount(() => {
  receiveStore.receive = null
})

const updateReceive = async receiveId => {
  if (receiveStore.receive !== null) {
    try {
      const ret = await axiosIns.patch(`/ict/receive/${receiveId}`, {
        document_number: receive.value.document_number,
        document_date: formatDateMySql(receive.value.document_date),
        description: receive.value.description,
        po_number: receive.value.po_number,
        location_id: receive.value.location_id,
        vendor_id: receive.value.vendor_id,
      }, {
        
      })

      Swal.fire({
        title: 'LBG',
        text: 'Update Receive successfully',
        icon: 'success',
      })
      saved.value = true
    } catch(error) {
      Swal.fire({
        title: 'LBG',
        text: error,
        icon: 'error',
      })
    }
  }
}

const refUpdateReceiveForm = ref()

const onSubmit = () => {
  refUpdateReceiveForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateReceive(receiveStore.receive.id)
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="isLoading" />
      <VCard title="Receive">
        <VCardText v-if="receive">
          <VForm
            ref="refUpdateReceiveForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="receive.document_number"
                  :rules="[requireValidator]"
                  readonly="true"
                  label="Document Number"
                />
              </VCol>
              <VCol cols="4">
                <VDateInput 
                  v-model="receive.document_date"
                  :rules="[requiredValidator]"
                  label="Document Date"
                />
                <!--
                  <VTextField 
                  v-model="receive.document_date"
                  :rules="[requireValidator]"
                  readonly="true"
                  label="Name"
                  /> 
                -->
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="receive.po_number"
                  :rules="[requireValidator]"
                  label="Phone Number"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VSelect 
                  v-model="receive.location_id"
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
                  v-model="receive.vendor_id"
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
                  v-model="receive.description"
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
                  v-if="!saved"
                  color="success"
                  type="submit"
                >
                  Save
                </VBtn>
    
                <VBtn 
                  color="warning"
                  :to="{ name: 'ict-receive' }"
                >
                  Close
                </VBtn>
              </VCol>
            </VRow>        
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <ReceiveLine />
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
