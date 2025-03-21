<script setup>
import Product from "@/pages/lookup/product.vue"
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"

const itemData = ref()
const itemCode = ref()
const itemName = ref()
const itemDescription = ref()
const itemBrand = ref()
const itemInstruction = ref()
const itemSize = ref()
const itemSizeDetail = ref()
const prodId = ref()
const parentId = ref()

const position = ref()
const wasteTarget = ref(0)
const finishGood = ref()
const color = ref()
const colorQty = ref(0)
const processData = ref()
const process = ref()

const showLoading = ref(true)
const savingProcess = ref(true)
const saved = ref(false)
const waiting = ref(true)

const getProduct = val => {
  itemData.value = val
  itemCode.value = val.ItemNumber
  itemName.value = val.ProductName
  itemSize.value = val.Size
  itemBrand.value = val.Brand 
  itemInstruction.value = val.Instruction
  itemDescription.value = val.Description
}

const fetchProcess = async() => {
  try {
    const ret = await axiosIns.get('/production/processes' )

    processData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Get data process failed.',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchProcess()
})

const createMaster = async() => {
  savingProcess.value = true
  showLoading.value = true
  try {
    const ret = await axiosIns.post(`/production/item`, {
      item_code: itemCode.value,
      item_name: itemName.value,
      item_description: itemDescription.value,
      item_brand: itemBrand.value,
      item_instruction: itemInstruction.value,
      item_size: itemSize.value,
      item_size_detail: itemSizeDetail.value,

      // production_proccess_id: process.value.id,
      // parent_id: parentId.value,
      // position: position.value,
      // waste_target: wasteTarget.value,
      // color_quantity: colorQty.value,
      // colors: color.value,
      // is_finish_good: finishGood.value,
    } )

    savingProcess.value = false
    showLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Create data successfully',
      icon: 'success',
    })
    itemCode.value = ''
    itemName.value = ''

    // router.push({name: 'spk'})
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: error,
      icon: 'error',
    })
  }
}

const refCreateMasterForm = ref()

const onSubmit = () => {
  refCreateMasterForm.value?.validate().then(({  valid: isValid }) => {
    if(isValid) createMaster()
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VForm
          ref="refCreateMasterForm"
          @submit.prevent="onSubmit"
        >
          <VCardText>
            <VRow>
              <VCol
                cols="4"
                class="d-flex gap-4"
              >
                <VTextField 
                  v-model="itemCode"
                  label="Item Code"
                  :readonly="true"
                  :rules="[requiredValidator]"
                />
                <Product 
                  @product="getProduct"
                />
              </VCol>
              <VCol cols="8">
                <VTextField 
                  v-model="itemName"
                  label="Item Name"
                />
              </VCol>
            </VRow>
            <!--
              <VRow>
              <VCol cols="4">
              <VSelect 
              label="Process"
              v-model="process"
              :items="processData"
              item-title="name"
              item-value="id"
              return-object
              :menu-props="{ maxHeight: '200px' }"
              />
              </VCol>
              <VCol cols="3">
              <VTextField 
              label="Position"
              v-model="position"
              />
              </VCol>
              <VCol cols="3">
              <VTextField 
              label="Waste Target (%)"
              v-model="wasteTarget"
              />
              </VCol>
              <VCol cols="2">
              <VCheckbox 
              label="Finish Good ?"
              true-value="2"
              false-value="1"
              />
              </VCol>
              </VRow>
              <VRow v-if="process && (process.name === 'PRINTING')">
              <VCol cols="4">
              <VTextField 
              label="Color Qty"
              v-model="colorQty"
              type="number"
              />
              </VCol>
              <VCol cols="8">
              <VTextField 
              label="Warna"
              v-model="color"
              />
              </VCol>
              </VRow> 
            -->
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <VBtn
                    color="warning"
                    :to="{ name: 'spk-master' }"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    color="primary"
                    type="submit"
                  >
                    Apply
                  </VBtn>
                </div>
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
    subject: SPK
    redirectIfLoggedIn: false
</route>
