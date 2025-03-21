<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import { useItemStore } from "@/pages/item/useItemStore"

// import { useItemStore } from "@/pages/ict/item/useItemStore"
import Product from "@/pages/lookup/product.vue"
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"

const itemStore = useItemStore()
const route = useRoute()
const itemId = ref(route.params.id)
const lastChildren = ref ()
const items = ref(null)
const itemWips = ref(null)
const isDialogVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const refItemForm = ref()
const selectedItem = ref(null)
const childrenData = ref([])

const itemData = ref()
const itemCode = ref()
const itemName = ref()
const itemDescription = ref()
const itemBrand = ref()
const itemInstruction = ref()
const itemSize = ref()
const itemSizeDetail = ref()

const position = ref()
const wasteTarget = ref(0)
const finishGood = ref(2)
const color = ref()
const colorQty = ref(0)
const processData = ref()
const process = ref()

const showLoading = ref(false)
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

const getProductItem = val => {
  getProduct(val)
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

const fetchItemId = async itemId => {
  try {
    const ret = await axiosIns.get(`/production/item/parent/${itemId}` )

    childrenData.value = ret.data.data[0].children

    items.value = ret.data.data[0]
    itemStore.item = ret.data.data[0]
    itemWips.value = ret.data.data[0].children.sort((a, b) => a.position - b.position)
    itemCode.value = items.value.item_code
    itemName.value = items.value.item_name
    itemDescription.value = items.value.item_description
    itemInstruction.value = items.value.item_instruction
    itemBrand.value = items.value.item_brand
    itemSize.value = items.value.item_size
    itemSizeDetail.value = items.value.item_size_detail
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Get data process failed.',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchProcess(),
  fetchItemId(itemId.value)
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
      production_proccess_id: process.value.id,
      parent_id: itemId.value,
      position: position.value,
      waste_target: wasteTarget.value,
      color_quantity: colorQty.value || 0,
      colors: color.value,
      is_finish_good: finishGood.value,
    } )

    savingProcess.value = false
    showLoading.value = false
    fetchItemId(itemId.value)
    Swal.fire({
      title: 'SPK',
      text: 'Create data successfully',
      icon: 'success',
    })

    // router.push({name: 'spk'})
    closeDialogHandler()

  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Create master item failed.',
      icon: 'error',
    })
  }finally {
    showLoading.value = false
  }
}

const createSubMaster = async() => {
  savingProcess.value = true

  // showLoading.value = true
  try {
    const ret = await axiosIns.post(`/production/item`, {
      item_code: itemCode.value,
      item_name: itemName.value,
      item_description: itemDescription.value,
      item_brand: itemBrand.value,
      item_instruction: itemInstruction.value,
      item_size: itemSize.value,
      item_size_detail: itemSizeDetail.value,
      production_proccess_id: selectedItem.value.process.id, 
      parent_id: selectedItem.value.id,
      position: position.value,
      waste_target: wasteTarget.value,
      color_quantity: colorQty.value || 0,
      colors: color.value,
      is_finish_good: finishGood.value,
    } )

    savingProcess.value = false
    showLoading.value = false
    fetchItemId(itemId.value)
 
    const newItem = ret.data.data 
    if (!selectedItem.value.children) {
      selectedItem.value.children = [] 
    }
    selectedItem.value.children.push(newItem) 

    // router.push({name: 'spk'})
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Create Sub-master item failed.',
      icon: 'error',
    })
  }finally {
    showLoading.value = false
  }
}

const deleteData = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/production/item/${id}` )

    // fetchItemId(items.value)

    itemWips.value = itemWips.value.filter(item => item.id !== id)

  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Delete data failed.',
      icon: 'error',
    })
  }finally {
    showLoading.value = false
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'SPK',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonText: 'cancel',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

const refCreateMasterForm = ref()

const onSubmit = () => {
  refCreateMasterForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createMaster().then(() => {
        clearForm()
      })
    }
  })
}

const clearForm = () => {
  itemCode.value = null
  itemName.value = null
  process.value = null
  position.value = null
  wasteTarget.value = 0
  finishGood.value = 2
  colorQty.value = ''
  color.value = ''
}

const openDialog = async item => {
  fetchItemId(itemId.value)

  selectedItem.value = item
  isDialogVisible.value = true
  isConfirmDialogVisible.value = true
  
}

const closeDialogHandler = () => {
  isDialogVisible.value = false

  selectedItem.value = null
  fetchItemId(itemId.value)
}

const onSubmitItem = () => {
  refItemForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createSubMaster().then(() => {
        clearForm()
      })
    }
  })
}

const getLastChildren = () => {
  if (selectedItem.value && selectedItem.value.children && selectedItem.value.children.length > 0) {
    return selectedItem.value.children || []
  } else {
    return [] 
  }
}

watch(() => selectedItem.value, () => {
  lastChildren.value = getLastChildren()
})

const closeDialog = () => {
  isDialogVisible.value = false
}

const deleteSubItem = async id => {
  // showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/production/item/${id}` )

    if (selectedItem.value && selectedItem.value.children) {
      selectedItem.value.children = selectedItem.value.children.filter(item => item.id !== id)
    }
    openDialog(selectedItem.value)
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Delete data failed.',
      icon: 'error',
    })
  }finally {
    showLoading.value = false
  }
}


const btnDeleteSubItem = id => {
  closeDialog()

  Swal.fire({
    title: 'SPK',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonText: 'cancel',
    confirmButtonText: 'Yes, delete it!',

  }).then(ret => {
    if(ret.isConfirmed) {
      deleteSubItem(id)
    }
  })
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <!-- {{ itemId }} -->
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
                    readonly
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
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="4">
                  <VSelect 
                    v-model="process"
                    label="Process"
                    :items="processData"
                    item-title="name"
                    item-value="id"
                    return-object
                    :menu-props="{ maxHeight: '200px' }"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="3">
                  <VTextField 
                    v-model="position"
                    label="Position"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="3">
                  <VTextField 
                    v-model="wasteTarget"
                    label="Waste Target (%)"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="2">
                  <VCheckbox 
                    v-model="finishGood"
                    label="Finish Good ?"
                    true-value="2"
                    false-value="1"
                  />
                </VCol>
              </VRow>
              <VRow v-if="process && (process.name === 'PRINTING')">
                <VCol cols="4">
                  <VTextField 
                    v-model="colorQty"
                    label="Color Qty"
                    type="number"
                  />
                </VCol>
                <VCol cols="8">
                  <VTextField 
                    v-model="color"
                    label="Warna"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12">
                  <div class="d-flex justify-end gap-4">
                    <VBtn
                      color="warning"
                      :to="{ name: 'spk-master' }"
                      :disabled="showLoading"
                    >
                      Close
                    </VBtn>
                    <VBtn
                      color="primary"
                      type="submit"
                    >
                      Save
                    </VBtn>
                  </div>
                </VCol>

                <VProgressLinear
                  v-if="showLoading"
                  indeterminate
                  color="primary"
                  style="margin-left: 8px;"
                />
              </VRow>
            </VCardText>
          </VForm>
        </VCard>
        <VSpacer class="mt-3" />
        <VCard>
          <VTable>
            <thead class="text-uppercase">
              <tr>
                <th scope="col">
                  Process
                </th>
                <th scope="col">
                  Item WIP Code
                </th>
                <th scope="col">
                  Item WIP Name
                </th>
                <th scope="col">
                  Item WIP Size
                </th>
                <th scope="col">
                  Waste Target
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in itemWips"
                :key="data.id"
              >
                <td>
                  {{ data.process.name }}
                </td>
                <td>
                  {{ data.item_code }}
                </td>
                <td>
                  {{ data.item_name }}
                </td>
                <td>
                  {{ data.item_size }}
                </td>
                <td>
                  {{ data.waste_target }}
                </td>
                <td>
                  <VBtn
                    icon=""
                    size="x-small"
                    color="default"
                    variant="text"
                    @click="btnDeleteClickHandler(data.id)"
                  >
                    <VIcon
                      size="22"
                      icon="tabler-trash"
                      color="error"
                    />
                  </VBtn>

                  <VBtn
                    icon=""
                    size="x-small"
                    color="default"
                    variant="text"
                    @click="openDialog(data)" 
                  >
                    <VIcon
                      size="22"
                      icon="tabler-library-plus"
                      color="error"
                    />
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </VCol>
    </VRow>

    <VDialog
      v-model="isDialogVisible"
      width="1024"
    >
      <VCard>
        <VCardTitle>Sub Item </VCardTitle>
        <VCardText>
          <VForm
            ref="refItemForm"
            @submit.prevent="onSubmitItem"
          >
            <VRow>
              <VCol
                cols="4"
                class="d-flex gap-4"
              >
                <VTextField 
                  v-model="itemCode"
                  label="Item Code"
                  readonly
                  :rules="[requiredValidator]"
                />
                <Product 
                  @product="getProductItem"
                />
              </VCol>
              <VCol cols="8">
                <VTextField 
                  v-model="itemName"
                  label="Item Name"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="wasteTarget"
                  label="Waste Target (%)"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="2">
                <VCheckbox 
                  v-model="finishGood"
                  label="Finish Good ?"
                  true-value="2"
                  false-value="1"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'PRINTING')">
              <VCol cols="4">
                <VTextField 
                  v-model="colorQty"
                  label="Color Qty"
                  type="number"
                />
              </VCol>
              <VCol cols="8">
                <VTextField 
                  v-model="color"
                  label="Warna"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <VBtn
                    color="warning"
                    :disabled="showLoading"
                    @click="closeDialogHandler"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    color="primary"
                    type="submit"
                    :disabled="showLoading"
                  >
                    Save
                  </VBtn>
                </div>
              </VCol>

              <VProgressLinear
                v-if="showLoading"
                indeterminate
                color="primary"
                style="margin-left: 8px;"
              />
            </VRow>
          </VForm>
        </VCardText>
        <VSpacer class="d-flex" />
        <VCardText>
          <VDivider />
          <VTable class="text-no-wrap">
            <thead class="text-uppercase">
              <tr>
                <th scope="col">
                  Item WIP Code
                </th>
                <th scope="col">
                  Item WIP Name
                </th>
                <th scope="col">
                  Item WIP Size
                </th>
                <th scope="col">
                  Waste Target
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in getLastChildren()"
                :key="data.id"
              >
                <td>{{ data.item_code }}</td>
                <td>{{ data.item_name }}</td>
                <td>{{ data.item_size }}</td>
                <td>{{ data.waste_target }}</td>
                <td>
                  <VBtn
                    icon=""
                    size="x-small"
                    color="default"
                    variant="text"
                    @click="btnDeleteSubItem(data.id)"
                  >
                    <VIcon
                      size="22"
                      icon="tabler-trash"
                      color="error"
                    />
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: SPK
    redirectIfLoggedIn: false
</route>
