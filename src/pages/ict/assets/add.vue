<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

const assetForm = ref()

const assetNumber = ref()
const serialNumber = ref()
const item = ref()
const itemFilter = ref()
const description = ref()
const condition = ref()

const isLoading = ref(true)
const saved = ref(false)

const fetchItem = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/ict/items', {
      
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    itemFilter.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

onMounted(() => {
  fetchItem()
})

const createAsset = async() => {
  try {
    const ret = await axiosIns.post('/ict/asset/', {
      asset_number: assetNumber.value,
      serial_number: serialNumber.value,
      item_id: item.value,
      description: description.value,
      item_condition: condition.value,
    } )

    assetNumber.value = null
    serialNumber.value = null
    item.value = null
    description.value = null
    condition.value = null
    
    Swal.fire({
      title: 'LBG',
      text: 'Create new Asset success',
      icon: 'success',
    })
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: 'Create Asset failed',
      icon: 'error',
    })
  }
}

const onSubmit = () => {
  assetForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createAsset()
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
          <VForm
            ref="assetForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="6">
                <VTextField 
                  v-model="assetNumber"
                  :rules="[requireValidator]"
                  label="Asset Number"
                />
              </VCol>
              <VCol cols="6">
                <VTextField 
                  v-model="serialNumber"
                  :rules="[requireValidator]"
                  label="Serial Number"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VSelect 
                  v-model="item"
                  label="Item"
                  placeholder="Item"
                  :items="itemFilter"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requireValidator]"
                />                
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="condition"
                  label="Item Condition"
                />            
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="description"
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
                  :to="{name: 'ict-assets'}"
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
      <VSpacer class="mt-6" />
      <VCard>
        <VCardText>
          <VTable>
            <thead class="text-uppercase">
              <tr>
                <td>Asset Number</td>
                <td>Serial Number</td>
                <td>Item Name</td>
                <td>Item Condition</td>
                <td>Description</td>
              </tr>
            </thead>
          </VTable>
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
