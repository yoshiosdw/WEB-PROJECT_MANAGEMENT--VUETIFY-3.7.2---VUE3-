<script setup>
import axiosIns from "@/plugins/axios"
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"
import { useRouter } from 'vue-router'

const router = useRouter()
const typeName = ref()
const refTypeForm = ref()
const saved = ref(false)
const isLoading = ref(false)

const createType = async() => {
  isLoading.value = true
  try {
    const params = {
      name: typeName.value,
    }

    const ret = await axiosIns.post(`/item/types`, params )

    typeName.value = null
    router.back()

    // Swal.fire({
    //   title: themeConfig.app.title,
    //   text: 'Create data successfully',
    //   icon: 'success',
    // })
    isLoading.value = false
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
    isLoading.value = false
  }
}

const onSubmit = () => {
  refTypeForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createType()
    }
  })
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VForm
          ref="refTypeForm"
          @submit.prevent="onSubmit"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="typeName"
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
                  color="warning"
                  @click="goBack"
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
