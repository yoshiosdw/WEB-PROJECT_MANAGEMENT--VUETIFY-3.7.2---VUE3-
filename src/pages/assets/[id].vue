<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"

const route = useRoute()
const assetId = route.params.id 
const item = ref()
const asset = ref()
const selectedItem = ref()

const isLoading = ref(false)
const saved = ref(false)

const fetchAssets = async assetId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/ict/asset/${assetId}`)

    asset.value = ret.data.data[0]
    assetStore.setAssets(ret.data.data[0])
    isLoading.value = false
  } catch(error) {
    Swal.fire({
      text: 'Failed to load Asset',
      title: 'LBG',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchAssets(assetId)
})

const fetchItem = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/ict/items/', {
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    item.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

onMounted(() => {
  fetchItem()
})

onBeforeUnmount(() => {
  assetStore.item = null
})

const updateAsset = async assetId => {
  if (assetStore.asset !== null) {
    try {
      const ret = await axiosIns.patch(`/ict/asset/${assetId}`, {
        asset_number: asset.value.asset_number,
        serial_number: asset.value.serial_number,
        item_id: asset.value.item_id,
        condition: asset.value.condition,
        item_condition: asset.value.item_condition,
      })

      Swal.fire({
        title: 'LBG',
        text: 'Update Asset successfully',
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

const refUpdateAssetForm = ref()

const onSubmit = () => {
  refUpdateAssetForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateAsset(assetStore.asset.id)
  })
}
</script>

<template>
  <div>
    <VOverlay v-model="isLoading" />
    <VCard>
      <VCardText v-if="asset">
        <VForm
          ref="refUpdateAssetForm"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="6">
              <VTextField 
                v-model="asset.asset_number"
                :rules="[requireValidator]"
                readonly="true"
                label="Asset Number"
              />
            </VCol>
            <VCol cols="6">
              <VTextField 
                v-model="asset.serial_number"
                :rules="[requireValidator]"
                readonly="true"
                label="Serial Number"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VSelect 
                v-model="asset.item_id"
                label="Item"
                placeholder="Item"
                :items="item"
                item-title="name"
                item-value="id"
                single-line
                :rules="[requireValidator]"
              />                
            </VCol>
            <VCol cols="6">
              <VTextField 
                v-model="asset.item_condition"
                :rules="[requireValidator]"
                label="Condition"
              />               
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea
                v-model="asset.description"
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
                v-if="!saved"
                color="success"
                type="submit"
              >
                Save
              </VBtn>
  
              <VBtn 
                color="warning"
                :to="{ name: 'ict-assets' }"
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
