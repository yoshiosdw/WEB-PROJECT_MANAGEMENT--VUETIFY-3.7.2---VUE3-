<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"
import { ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import LookupLocation from "@/pages/lookup/locationDialog.vue"

const code = ref()
const name = ref()
const location_id = ref()
const loading = ref(false)
const locationName = ref()
const refForm = ref()
const router = useRouter()
const route = useRoute()

const validateForm = () => {
  refForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createRoom()
    }
  })
}

const createRoom = async () => {
  loading.value = true
  try {
    const params = {
      name: name.value,
      location_id: location_id.value,
    }
    const ret = await axiosIns.post(`/qcc/meeting/rooms`, params, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        "Content-Type": "multipart/form-data",
      },
    })
    loading.value = false
    router.back()
  } catch (error) {
    Swal.fire({
      title: "Room",
      text: error,
      icon: "error",
    })
  } finally {
    loading.value = false
  }
}

const getValueFromLocationDialog = (data) => {
  location_id.value = data.id
  locationName.value = data.name
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardTitle>ADD ROOM</VCardTitle>
        <VSpacer/>
        <VOverlay />
        <VCardText>
          <VForm ref="refForm" @submit.prevent="validateForm">
            <VRow>
              <VCol cols="3" class="d-flex gap-3">
                <VTextField
                  v-model="name"
                  label="Room Name"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="4" class="d-flex gap-3">
                <VTextField
                  v-model="locationName"
                  label="Locations"
                  item-title="name"
                  item-value="id"
                  readonly
                  :rules="[requiredValidator]"
                />
                <LookupLocation @location="getValueFromLocationDialog" />
              </VCol>
            </VRow>
            <VRow>
               <VCol cols="12" class="d-flex justify-end gap-3">
                <VBtn color="warning" @click="router.back()"> Cancel </VBtn>
                <VBtn type="submit" color="success"> Save </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
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
