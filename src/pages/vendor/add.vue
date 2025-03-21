<script setup>
import axiosIns from '@/plugins/axios';
import Swal from 'sweetalert2';

const vendorForm = ref()

const vendorCode = ref()
const vendorName = ref()
const vendorAddress = ref()
const vendorCity = ref()
const vendorPhone = ref(0)

const isLoading = ref(true)
const saved = ref(false)
// const savingProcess = ref(false)

const createVendor = async() => {
  try {
    const ret = await axiosIns.post('/vendors', {
      code: vendorCode.value,
      name: vendorName.value,
      address: vendorAddress.value,
      city: vendorCity.value,
      phone_number: vendorPhone.value,
    })
    vendorCode.value = null;
    vendorName.value = null
    vendorAddress.value = null
    vendorCity.value = null
    vendorPhone.value = 0
    // saved.value = true
    // savingProcess.value = false
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: 'Create Vendor failed',
      icon: 'error'
    })
  }
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
  <VRow>
    <VCol cols="12">
      <!-- <VOverlay v-model="isLoading" /> -->
      <VCard>
        <VCardText>
          <VForm ref="vendorForm" @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="vendorCode"
                  :rules="[requireValidator]"
                  label="Code"
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="vendorName"
                  :rules="[requireValidator]"
                  label="Name"
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="vendorPhone"
                  :rules="[requireValidator]"
                  label="Phone Number"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VTextField 
                  v-model="vendorAddress"
                  :rules="[requireValidator]"
                  label="Address"
                />
              </VCol>
              <VCol cols="6">
                <VTextField 
                  v-model="vendorCity"
                  :rules="[requireValidator]"
                  label="City"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12" class="d-flex justify-end gap-4">
                <VBtn
                    :to="{name: 'vendor'}"
                    color="warning"
                  >
                    Close
                  </VBtn>
                <VBtn color="success" type="submit">Save and Create New</VBtn>
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
