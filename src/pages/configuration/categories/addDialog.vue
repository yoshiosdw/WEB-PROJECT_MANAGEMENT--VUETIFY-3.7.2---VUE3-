<script setup>
import axiosIns from "@/plugins/axios"
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"
import { useRouter } from 'vue-router'

const emit = defineEmits(['saved'])

const isDialogVisible = ref(false)

const router = useRouter()
const categoryForm = ref()
const categoryName = ref()
const code = ref()
const categoryId = ref()
const specifications = ref()

const saved = ref(false)
const loading = ref(false)

const validateCapitalLetters = value => /^[A-Z]+$/.test(value) || 'Capital letters only'
const required = value => !!value || 'Required field'

const createCategory = async() => {
  loading.value = true
  try {
    const ret = await axiosIns.post('/item/categories', {
      name: categoryName.value,
      code: code.value,
    })

    // categoryName.value = null
    // router.go(-1)

    // Swal.fire({
    //   title: 'LBG',
    //   text: 'Create category success',
    //   icon: 'success',
    // })
    loading.value = false
    saved.value = true
    
    emit('saved')
    closeDialog()
    
    // categoryId.value = ret.data.data.id
    // fetchCategoryTemplate(categoryId.value)
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    loading.value = false
    saved.value = false
  }
}

const onSubmit = () => {
  categoryForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createCategory()
    }
  })
}

const closeDialog = () => {
  isDialogVisible.value = false
}


const refCategoryTemplate = ref()

const fetchCategoryTemplate = async categoryId => {
  loading.value = true 
  try {
    const ret = await axiosIns.get(`/item/specifications/${categoryId}` )

    specifications.value = ret.data.data
  } catch(error) {
    loading.value = false
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Get data failed',
      icon: 'error',
    })
  }
}

const createCategoryTemplate =  async () => {
  const body = {
    item_category_id: categoryId.value,
    name: categoryName.value,
  }

  loading.value = true
  try {
    const ret = await axiosIns.post(`/item/specification`, body )

    loading.value = false
    fetchCategoryTemplate(categoryId.value)
    categoryName.value = null
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Create data failed',
      icon: 'error',
    })
  }
}

const onSubmitTemplate = () => {
  refCategoryTemplate.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createCategoryTemplate()
  })
}


const goBack = () => {
  router.go(-1)
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
      <VCardTitle>Add Category</VCardTitle>
      <VCardText>
        <VForm
          ref="categoryForm"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="4">
              <VTextField 
                v-model="code"
                label="Code"
                :rules="[required, validateCapitalLetters]"
              />
            </VCol>
            <VCol cols="8">
              <VTextField 
                v-model="categoryName"
                label="Name"
                :rules="[required, validateCapitalLetters]"
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
