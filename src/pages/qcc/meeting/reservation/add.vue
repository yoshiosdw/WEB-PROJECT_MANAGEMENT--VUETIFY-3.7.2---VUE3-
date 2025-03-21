<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"
import { ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import LookupEmployee from "@/pages/lookup/employeeDialog.vue"
import { formatDateMySql, formatDateTimeMySql } from '@/@core/utils/formatters'

const room = ref()
const selectedRoom = ref()
const transaction_date = ref()
const selectedQcc = ref()
const qcc = ref()
const loading = ref(false)
const router = useRouter()
const route = useRoute()
const personId = ref()
const personName = ref()
const refForm = ref()

const fetchRoom = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/qcc/meeting/rooms` )

    room.value = ret.data.data
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: "Failed to get Data",
      icon: "error",
    })
    loading.value = false
  }
}

const fetchQcc = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/qcc/qccs` )

    qcc.value = ret.data.data
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: "Failed to get Data",
      icon: "error",
    })
    loading.value = false
  }
}

const getValueFromPersonDialog = data => {
  personId.value = data.id
  personName.value = data.person.name
}

// const goBack = () => {
// router.back()


watchEffect(() => {
  fetchRoom()
  fetchQcc()
})

const createReservation = async () => {
  loading.value = true
  try{
    const params = {
      meeting_rooms_id: selectedRoom.value,
      transaction_date: formatDateMySql(transaction_date.value),
      qcc_id: selectedQcc.value,
      reserved_by: personId.value,
    }

    const ret = await axiosIns.post(`/qcc/meeting/room/reservations`, params, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
        'Content-Type': 'multipart/form-data',
      },
    })

    loading.value = false
    router.back()

  }catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
  }
  finally{
    loading.value = false
  }
}

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      createReservation()
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardTitle>Form Meeting Room Reservation</VCardTitle>
        <VOverlay />
        <VForm  
          ref="refForm"
          @submit.prevent="validateFom" 
        >
          <VRow class="mx-3">
            <VCol
              cols="4"
              class="d-flex gap-3"
            >
              <VSelect
                v-model="selectedRoom"
                label="Room"
                :items="room"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="4"
              class="d-flex gap-3"
            >
              <VDateInput
                v-model="transaction_date"
                label="Date"
                density="compact"
                :rules="[requiredValidator]"
                :config="{
                  dateFormat: 'Y-m-d',
                }"
              />
            </VCol>
          </VRow>

          <VRow class="mx-3">
            <VCol
              cols="4"
              class="d-flex gap-3"
            >
              <VSelect
                v-model="selectedQcc"
                label="QCC"
                :items="qcc"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="8"
              class="d-flex gap-3"
            >
              <VTextField
                v-model="personName"
                label="Reserved By"
                item-title="name"
                item-value="id"
                readonly
                :rules="[requiredValidator]"
              />
              <LookupEmployee @employee="getValueFromPersonDialog" />
            </VCol>
          </VRow>
          <VRow class="mt-3 mx-3 mb-4">
            <VCol
              cols="12"
              class="d-flex justify-end gap-3"
            >
              <VBtn
                color="warning"
                @click="router.back()"
              >
                Cancel
              </VBtn>
              <VBtn
                type="submit"
                color="success"
              >
                Save
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
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
