<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"
import { useUomStore } from "./useUomStore"

const route = useRoute()
const uomId = route.params.id 
const uom = ref()
const uomStore = useUomStore()

const isLoading = ref(false)
const saved = ref(false)

const fetchUom = async uomId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/uoms/${uomId}` )

    uom.value = ret.data.data[0]
    uomStore.setUom(ret.data.data[0])
    isLoading.value = false
  } catch(error) {
    Swal.fire({
      text: 'Failed to load uom',
      title: 'LBG',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchUom(uomId)
})

onBeforeUnmount(() => {
  uomStore.uom = null
})

const updateUom = async uomId => {
  if (uomStore.uom !== null) {
    try {
      const ret = await axiosIns.patch(`/uoms/${uomId}`, {
        code: uom.value.code,
        name: uom.value.name,
      }, {
        
      })

      Swal.fire({
        title: 'LBG',
        text: 'Update uom successfully',
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

const refUpdateUomForm = ref()

const onSubmit = () => {
  refUpdateUomForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateUom(uomStore.uom.id)
  })
}
</script>

<template>
  <div>
    <VOverlay v-model="isLoading" />
    <VCard>
      <VCardText v-if="uom">
        <VForm
          ref="refUpdateUomForm"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="6">
              <VTextField 
                v-model="uom.code"
                :rules="[requireValidator]"
                label="Code"
              />
            </VCol>
            <VCol cols="6">
              <VTextField 
                v-model="uom.name"
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
                v-if="!saved"
                color="success"
                type="submit"
              >
                Save
              </VBtn>
  
              <VBtn 
                color="warning"
                :to="{ name: 'ict-uom' }"
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
