<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

const uomForm = ref()

const uomCode = ref()
const uomName = ref()

const isLoading = ref(true)
const saved = ref(false)

const createUom = async() => {
  try {
    const ret = await axiosIns.post('/uoms', {
      code: uomCode.value,
      name: uomName.value,
    } )

    uomCode.value = null
    uomName.value = null
    
    Swal.fire({
      title: 'LBG',
      text: 'Create new UOM success',
      icon: 'success',
    })
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: 'Create UOM failed',
      icon: 'error',
    })
  }
}

const onSubmit = () => {
  uomForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createUom()
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText>
          <VForm
            ref="uomForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="6">
                <VTextField 
                  v-model="uomCode"
                  :rules="[requireValidator]"
                  label="Code"
                />
              </VCol>
              <VCol cols="6">
                <VTextField 
                  v-model="uomName"
                  :rules="[requireValidator]"
                  label="Name"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  :to="{name: 'ict-uom'}"
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
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
