<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute, useRouter } from "vue-router"
import { useCategoryStore } from './useCategoryStore'

const route = useRoute()
const router = useRouter()
const categoryId = route.params.id 
const category = ref()
const code = ref()
const name = ref()
const categoryStore = useCategoryStore()

const loading = ref(false)
const saved = ref(false)
const refUpdateCategoryForm = ref()

const fetchCategory = async categoryId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/item/categories/${categoryId}` )

    category.value = ret.data.data[0]
    code.value = category.value.code
    name.value = category.value.name

    // categoryStore.setCategory(ret.data.data[0])
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchCategory(categoryId)
})

onBeforeUnmount(() => {
  categoryStore.category = null
})

const updateCategory = async categoryId => {
  loading.value = true

  try {
    const ret = await axiosIns.patch(`/item/categories/${categoryId}`, {
      code: code.value,
      name: name.value,
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
  refUpdateCategoryForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateCategory(categoryId)
  })
}
</script>

<template>
  <div>
    <VOverlay v-model="loading" />
    <VCard>
      <VCardText v-if="category">
        <VForm
          ref="refUpdateCategoryForm"
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
