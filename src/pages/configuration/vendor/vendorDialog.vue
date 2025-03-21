<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const emit = defineEmits(['saved'])
const vendorForm = ref()
const router = useRouter()
const vendorCode = ref()
const vendorName = ref()
const vendorAddress = ref()
const vendorCity = ref()
const vendorPhone = ref(0)

const isLoading = ref(true)
const saved = ref(false)

const isDialogVisible = ref(false)
const loading = ref(false)

// const savingProcess = ref(false)

const createVendor = async() => {
  loading.value = true
  try {
    const ret = await axiosIns.post('/vendors', {
      code: vendorCode.value,
      name: vendorName.value,
      address: vendorAddress.value,
      city: vendorCity.value,
      phone_number: vendorPhone.value,
    } )

    emit('saved')

    closeDialog()

    loading.value = false
    saved.value = true

    vendorCode.value = null
    vendorName.value = null
    vendorAddress.value = null
    vendorCity.value = null
    vendorPhone.value = 0
   
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: 'Create Vendor failed',
      icon: 'error',
    })
  } finally {loading.value = false}
}

const goBack = () => {
  router.back()
}


const closeDialog = () => {
  isDialogVisible.value = false
}


const onSubmit = () => {
  vendorForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createVendor()
    }
  })
}
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    max-width="800"
  >
    <template #activator="{ props }">
      <VBtn
        v-bind="props"
        :loading="loading"
        :disabled="loading"
      >
        Add New
      </VBtn>
    </template>
    <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />
    <VOverlay v-model="loading" />
    <VCard :loading="loading">
      <VCardTitle>Add Vendor</VCardTitle>
      <VCardText>
        <VForm
          ref="vendorForm"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="4">
              <VTextField 
                v-model="vendorCode"
                :rules="[requiredValidator]"
                label="Code"
              />
            </VCol>
            <VCol cols="4">
              <VTextField 
                v-model="vendorName"
                :rules="[requiredValidator]"
                label="Name"
              />
            </VCol>
            <VCol cols="4">
              <VTextField 
                v-model="vendorPhone"
                :rules="[requiredValidator]"
                label="Phone Number"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextField 
                v-model="vendorAddress"
                :rules="[requiredValidator]"
                label="Address"
              />
            </VCol>
            <VCol cols="6">
              <VTextField 
                v-model="vendorCity"
                :rules="[requiredValidator]"
                label="City"
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
                @click="closeDialog"
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
  </VDialog>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
