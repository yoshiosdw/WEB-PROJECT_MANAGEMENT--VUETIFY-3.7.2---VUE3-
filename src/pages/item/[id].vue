<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute, useRouter } from "vue-router"
import { useItemStore } from "./useItemStore"

const route = useRoute()
const router = useRouter()
const itemId = route.params.id 
const item = ref()
const itemStore = useItemStore()

const itemType = ref()
const typeFilter = ref()
const itemCategory = ref()
const categoryFilter = ref()

const loading = ref(false)
const saved = ref(false)

const fetchItem = async itemId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/items/${itemId}` )

    item.value = ret.data.data[0]
    itemStore.setItem(ret.data.data[0])
    loading.value = false
  } catch(error) {
    Swal.fire({
      text: 'Failed to load Item',
      title: 'LBG',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchItem(itemId)
})

const goBack = () => {
  router.back()
}

const fetchCategory = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/item/categories', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    categoryFilter.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

const fetchType = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/item/types', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    typeFilter.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

onMounted(() => {
  fetchCategory(),
  fetchType()
})

onBeforeUnmount(() => {
  itemStore.item = null
})

const updateItem = async itemId => {
  loading.value = true
  if (itemStore.item !== null) {
    try {
      const ret = await axiosIns.patch(`/items/${itemId}`, {
        code: item.value.code,
        name: item.value.name,
        description: item.value.description,
        brand: item.value.brand,
        item_type_id: item.value.item_type_id,
        item_category_id: item.value.item_category_id,
        serial_number: item.value.serial_number,
      }, {
        
      })

      router.back()
      saved.value = true
    } catch(error) {
      Swal.fire({
        title: 'LBG',
        text: error,
        icon: 'error',
      })
    } loading.value = false
  }
}

const refUpdateItemForm = ref()

const onSubmit = () => {
  refUpdateItemForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateItem(itemStore.item.id)
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" /> 
      <VCard :loading="loading">
        <VCardTitle>Modify Item</VCardTitle>

        <VCardText
          v-if="item"
          class="mt-3"
        >
          <VForm
            ref="refUpdateItemForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="3">
                <VSelect 
                  v-model="item.item_type_id"
                  label="Item Type"
                  placeholder="Item Type"
                  :items="typeFilter"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requireValidator]"
                />                
              </VCol>
              <VCol cols="3">
                <VSelect 
                  v-model="item.item_category_id"
                  label="Item Category"
                  placeholder="Item Category"
                  :items="categoryFilter"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requireValidator]"
                />                
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="item.code"
                  :rules="[requireValidator]"
                  label="Code"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="item.uom.code"
                  :rules="[requireValidator]"
                  label="Uom"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="item.name"
                  :rules="[requireValidator]"
                  label="Name"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="item.description"
                  :rules="[requireValidator]"
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
