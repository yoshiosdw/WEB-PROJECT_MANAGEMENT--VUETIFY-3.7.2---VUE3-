<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const router = useRouter()
const itemForm = ref()

const itemCode = ref()
const itemName = ref()
const itemDescription = ref()
const itemType = ref()
const uom = ref()
const uomData = ref()
const typeFilter = ref()
const itemCategories = ref()
const categoryFilter = ref()

const loading = ref(true)
const saved = ref(false)

const fetchCategory = async(page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/item/categories', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    loading.value = false
    categoryFilter.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}

const fetchType = async(page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/item/types', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    typeFilter.value = ret.data.data
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}

const fetchUom = async(page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/uoms', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    uomData.value = ret.data.data
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}

watchEffect(() => {
  fetchCategory(),
  fetchType(),
  fetchUom()
})

const createItem = async() => {
  loading.value = true
  try {
    const ret = await axiosIns.post('/items', {
      code: itemCode.value,
      name: itemName.value,
      uom_id: uom.value,
      description: itemDescription.value,
      item_type_id: itemType.value,
      item_category_id: itemCategories.value,
    } )

    router.push('/item')

  } catch(error) {
    const errorMessage = error.response && error.response.data && error.response.data.message
    if (errorMessage && errorMessage.includes('Duplicate entry')) {
      Swal.fire({
        title: "LBG",
        text: 'Item Code Already (duplicate)',
        icon: 'error',
      })
    } else {
      Swal.fire({
        title: "LBG",
        text: 'Create Item failed',
        icon: 'error',
      })
    }
  } finally {
    loading.value = false
  }
}

const onSubmit = () => {
  itemForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createItem()
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" /> 
      <VCard :loading="loading">
        <VForm
          ref="itemForm"
          @submit.prevent="onSubmit"
        >
          <VCardTitle>Create New Item</VCardTitle>
          <VCardText class="mt-3">
            <VRow>
              <VCol cols="3">
                <VSelect 
                  v-model="itemType"
                  label="Item Type"
                  placeholder="Item Type"
                  :items="typeFilter"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requiredValidator]"
                  :menu-props="{ maxHeight: '320px' }"
                />                
              </VCol>
              <VCol cols="3">
                <VSelect 
                  v-model="itemCategories"
                  label="Item Category"
                  placeholder="Item Category"
                  :items="categoryFilter"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requiredValidator]"
                  :menu-props="{ maxHeight: '320px' }"
                />                
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="itemCode"
                  :rules="[requiredValidator]"
                  label="Code"
                />
              </VCol>
              <VCol cols="3">
                <VSelect 
                  v-model="uom"
                  :items="uomData"
                  item-title="code"
                  item-value="id"
                  :rules="[requiredValidator]"
                  label="Uom"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="itemName"
                  :rules="[requiredValidator]"
                  label="Item Name"
                />
              </VCol>
              <VCol cols="8">
                <VTextField 
                  v-model="itemDescription"
                  label="Description"
                />
              </VCol>
            </VRow>
  
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  :to="{name: 'item'}"
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
          </VCardText>
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
