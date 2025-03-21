<script setup>
import axiosIns from "@/plugins/axios";
import { themeConfig } from "@themeConfig";
import Swal from "sweetalert2";

const categoryForm = ref()
const categoryName = ref()
const categoryId = ref()
const specifications = ref()

const saved = ref(false)
const isLoading = ref(false)

const createCategory = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.post('/item/categories', {
      name: categoryName.value,
    })
    categoryName.value = null
    Swal.fire({
      title: 'LBG',
      text: 'Create category success',
      icon: 'success'
    })
    isLoading.value = false
    saved.value = true
    categoryId.value = ret.data.data.id
    fetchCategoryTemplate(categoryId.value)
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error'
    })
    isLoading.value = false
    saved.value = false
  }
}

const onSubmit = () => {
  categoryForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      if (!saved.value) {
        createCategory()
      } else{
        // updateCategory()
        createCategory()
      }
    }
  })
}

const refCategoryTemplate = ref()

const fetchCategoryTemplate = async categoryId => {
  isLoading.value = true 
  try {
    const ret = await axiosIns.get(`/item/specifications/${categoryId}`)
    specifications.value = ret.data.data
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Get data failed',
      icon: 'error'
    })
  }
}

const createCategoryTemplate =  async () => {
  const body = {
    item_category_id: categoryId.value,
    name: categoryName.value
  }
  isLoading.value = true
  try {
    const ret = await axiosIns.post(`/item/specification`, body)
    isLoading.value = false
    fetchCategoryTemplate(categoryId.value)
    categoryName.value = null
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Create data failed',
      icon: 'error'
    })
  }
}

const onSubmitTemplate = () => {
  refCategoryTemplate.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createCategoryTemplate(categoryId.value)
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText>
          <VForm ref="categoryForm" @submit.prevent="onSubmit">
          <VRow>
            <VCol cols="12">
              <VTextField 
                v-model="categoryName"
                label="Name"
              />
            </VCol>
          </VRow>
          <VRow>
              <VCol cols="12" class="d-flex justify-end gap-4">
                <VBtn
                    :to="{name: 'item-categories'}"
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
