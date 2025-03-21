<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { useRoute, useRouter } from 'vue-router'
import Product from '../../lookup/product.vue'
import { useSpkStore } from '../useSpkStore'

const spkStore = useSpkStore()
const route = useRoute()
const spkHeaderId = ref(route.params.id)
const spk = ref(null)
const lines = ref(null)
const lineId = ref(null)

const documentNumber = ref()
const lineDocNumber = ref('Created by system')
const position = ref(null)
const itemData = ref()
const itemCode = ref()
const itemName = ref()
const itemDescription = ref()
const itemInstruction = ref()
const itemSize = ref()
const materialType = ref(null)
const cutType = ref(null)
const outputTarget = ref(0)
const wasteTarget = ref(0)
const estimateFinish = ref(null)
const orderQty = ref(0)
const orderUom = ref()
const orderCw = ref()
const handle = ref()
const numberColor = ref(0)
const colorName = ref(null)
const circumCylinder = ref(0)
const standardWeight = ref(0)
const minWeight = ref(0)
const maxWeight = ref(0)

const uoms = ref()
const uomCircum = ref()
const rollStart = ref(0)
const rollFinish = ref(0)
const plantOrigin = ref(null)
const fold = ref()
const note = ref('')

const useTreat = ref()
const finishGood = ref()
const useRotary = ref()
const materialEstimate = ref(0)
const materialSpare = ref(0)
const totalMaterial = ref(0)

const saved = ref(false)
const savingProcess = ref(false)
const isLoading = ref(true)

const isItemWipVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const itemWips = ref()
const itemWipData = ref()
const itemWipCode = ref()
const itemWipName = ref()
const itemWipBrand = ref()
const itemWipSize = ref()
const itemWipInst = ref()
const itemWipDesc = ref()
const refItemWipForm = ref()

// const materialChangeHandler = () => {
//   totalMaterial.value = materialEstimate.value + materialSpare.value
// }

const materialChangeHandler = () => {
  const materialEstimateValue = parseFloat(materialEstimate.value) || 0
  const materialSpareValue = parseFloat(materialSpare.value) || 0

  const totalMaterialValue = materialEstimateValue + materialSpareValue

  totalMaterial.value = parseInt(totalMaterialValue)
}

const fetchProcess = async () => {
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

const processData = ref(null)
const process = ref(null)

const uomCircumData = [
  {
    id: 1,
    name: 'Cm',
  },
  {
    id: 2,
    name: 'Inch',
  },
]

const getProduct = val => {
  itemData.value = val
  itemCode.value = val.ItemNumber
  itemName.value = val.ProductName
  itemSize.value = val.Size
  itemInstruction.value = val.Instruction
  itemDescription.value = val.Description
}

const getProductWip = val => {
  itemWipData.value = val
  itemWipCode.value = val.ItemNumber
  itemWipName.value = val.ProductName
  itemWipSize.value = val.Size
  itemWipBrand.value = val.Brand
  itemWipInst.value = val.Instruction
  itemWipDesc.value = val.Description
}

const showItemWipDialog = item => {
  const itemWipObject = JSON.parse(JSON.stringify(item))

  lineId.value = itemWipObject.id
  fetchItemWip(lineId.value)
  isItemWipVisible.value = true
  isConfirmDialogVisible.value = true
}

const closeDialogHandler = () => {
  clearForm()
  isItemWipVisible.value = false
}

const fetchItemWip = async itemWipId => {
  try {
    const ret = await axiosIns.get(`production/workorder/line/items/${itemWipId}` )

    itemWips.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: "SPK",
      text: "Get data failed.",
      icon: "error",
    })
  }
}

const clearForm = () => {
  itemWipCode.value = null
  itemWipName.value = null
  itemWipSize.value = null
  itemWipBrand.value = null
  itemWipInst.value = null
  itemWipDesc.value = null
}

const onSubmitItem = () => {
  refItemWipForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)createItemWip()
  })
}

const createItemWip = async() => {
  try {
    const ret = await axiosIns.post("production/workorder/line/items", {
      work_order_line_id: lineId.value,
      item_wip_code: itemWipCode.value,
      item_wip_name: itemWipName.value,
      item_description: itemWipDesc.value,
      item_brand: itemWipBrand.value,
      item_size: itemWipSize.value,
      item_instruction: itemWipInst.value,
    } )

    itemWipCode.value = ''
    itemWipName.value = ''
    itemWipSize.value = ''
    itemWipBrand.value = ''
    itemWipInst.value = ''
    itemWipDesc.value = ''
    fetchItemWip(lineId.value)
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      icon: 'error',
      text: error,
    })
  }
}

const confirmDeleteItemWipHandler = itemWipId => {
  isItemWipVisible.value = false
  Swal.fire({
    title: "Are you sure?",
    text: "This will deleting data",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "warning",
    confirmButtonText: "Yes, delete it!",
  }).then(result => {
    if (result.isConfirmed) {
      deleteItemWip(itemWipId)
    } else{
      isItemWipVisible.value = true
    }
  })
}

const deleteItemWip = async itemWipId => {
  try {
    const ret = await axiosIns.delete(`/production/workorder/line/items/${itemWipId}` )

    fetchItemWip(lineId.value)
    Swal.fire({
      text: "Deletesuccessfully",
      icon: "success",
      title: 'SPK',
    })
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      icon: 'error',
      text: 'Delete data failed.',
    })
  }
}

const fetchLines = async spkId => {
  isLoading.value = true
  try{
    const ret = await axiosIns.get(`/production/workorder/lines/${spkId}` )

    isLoading.value = false
    lines.value = ret.data.data
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Get data failed.',
      icon: 'error',
    })
  }
}

const fetchSpk = async spkId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/production/workorders/${spkId}` )

    isLoading.value = false
    spk.value = ret.data.data
    materialEstimate.value = spk.value[0].quantity_in_kg

    // documentNumber.value = spk.value[0].document_number 
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Get data SPK failed',
      icon: 'error',
    })
  }
}

const lineNumber = () => {
  const spkNumber = spk.value[0].document_number
  const positionNumber = position.value

  const spkLineNumber = `${spkNumber}-${positionNumber}`

  documentNumber.value = spkLineNumber
}

const fetchUom = async () => {
  try {
    const ret = await axiosIns.get('/uoms' )
    
    uoms.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title:'SPK',
      text: 'Fail to load data UOM',
      icon: error,
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchUom(),
  fetchLines(spkHeaderId.value),
  fetchSpk(spkHeaderId.value)
})

const calculate = ref()

const createSpkLine = async() => {
  isLoading.value = true

  const body = {
    line_document_number: documentNumber.value,
    mfg_work_order_id: spkHeaderId.value,
    position: position.value,
    production_proccess_id: process.value.id,
    item_code: itemCode.value,
    item_name: itemName.value,
    item_instruction: itemInstruction.value,
    item_description: itemDescription.value,
    item_size: itemSize.value,
    material_type: materialType.value,
    cut_type: cutType.value,
    output_target: outputTarget.value,
    waste_target: wasteTarget.value,
    estimate_finish_date: estimateFinish.value,
    order_qty: orderQty.value,
    order_uom: orderUom.value,
    order_cw: orderCw.value,
    handle: handle.value,
    number_of_color: numberColor.value,
    color: colorName.value,
    fold: fold.value,

    material_spare: materialSpare.value,
    total_material: totalMaterial.value,

    // roll_diameter: circumCylinder.value,
    // roll_diameter_uom: uomCircum.value,
    roll_size_start: rollStart.value,
    roll_size_finish: rollFinish.value,
    plant_origin: plantOrigin.value,

    standard_weight: standardWeight.value,
    min_weight: minWeight.value,
    max_weight: maxWeight.value,

    is_finish_goods: finishGood.value,
    is_use_treatment: useTreat.value,
    is_use_rotary: useRotary.value,
    note: note.value,
  }

  try {
    const ret = await axiosIns.post('/production/workorder/lines', body )

    isLoading.value = false
    fetchLines(spkHeaderId.value)
    position.value = null
    process.value = null
    itemCode.value = null
    itemName.value = null
    rollStart.value = 0
    rollFinish.value = 0
    materialType.value = null
    cutType.value = null
    outputTarget.value = 0
    wasteTarget.value = 0
    estimateFinish.value = null
    orderQty.value = 0
    orderUom.value = ''
    orderCw.value = 0
    handle.value = null
    numberColor.value = 0
    colorName.value = null
    fold.value = 0

    // circumCylinder.value = 0
    uomCircum.value = null
    plantOrigin.value = null
    standardWeight.value = 0
    minWeight.value = 0
    maxWeight.value = 0
    finishGood.value = 1
    useRotary.value = 1
    useTreat.value = 1
    note.value = null
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Create data failed',
      icon: 'error',
    })
  }
}

const refCreateSpkLineForm = ref()

const onSubmit = () => {
  refCreateSpkLineForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createSpkLine(spkHeaderId.value)
  })
}

const deleteData = async id => {
  try {
    const ret = await axiosIns.delete(`/production/workorder/lines/${id}` )

    fetchLines(spkHeaderId.value)
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Deelete data failed.',
      icon: 'error',
    })
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

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <VRow>
    <VOverlay v-model="isLoading" />
    <VCol cols="12">
      <VCard>
        <VCardTitle>SPK Header</VCardTitle>
        <VSpacer />

        <VCardText class="d-flex flex-wrap justify-space-between flex-column flex-sm-row">
          <table v-if="spk && spk.length > 0">
            <tbody>
              <tr>
                <td class="pe-5">
                  Document Number
                </td>
                <td class="font-weight-semi-bold">
                  : {{ spk[0].document_number }}
                </td>
                <td style="width: 80px;" />
                <td class="pe-5">
                  Item Code
                </td>
                <td class="font-weight-semi-bold">
                  : {{ spk[0].item_code }}
                </td>
              </tr>
              <tr>
                <td class="pe-5">
                  Customer Name 
                </td>
                <td class="font-weight-semi-bold">
                  : {{ spk[0].customer_name }}
                </td>
                <td style="width: 50px;" />
                <td class="pe-5">
                  Item Name 
                </td>
                <td class="font-weight-semi-bold">
                  : {{ spk[0].item_name }}
                </td>
              </tr>
              <tr>
                <td class="pe-5">
                  Quantity
                </td>
                <td class="font-weight-semi-bold">
                  : {{ spk[0].quantity }} {{ spk[0].uom.code }}
                </td>
                <td style="width: 50px;" />
                <td class="pe-5">
                  Item Size
                </td>
                <td class="font-weight-semi-bold">
                  : {{ spk[0].item_size }}
                </td>
              </tr>
              <tr>
                <td class="pe-5">
                  Quantity in Kg
                </td>
                <td class="font-weight-semi-bold">
                  : {{ spk[0].quantity_in_kg }}
                </td>
              </tr>
            </tbody>
          </table>
        </VCardText>
      </VCard>

      <VSpacer class="mt-6" />
      <VCard>
        <VCardTitle>Create SPK Line</VCardTitle>
        <!-- {{ spkHeaderId }} -->
        <VSpacer />
        <VCardText>
          <VForm
            ref="refCreateSpkLineForm"
            @submit.prevent="onSubmit"
            @keydown.enter.prevent
          >
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="materialEstimate"
                  label="Estimasi Keluar Bahan (Kg)"
                  type="number"
                  reverse
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="materialSpare"
                  label="Set Spare (Kg)"
                  type="number"
                  reverse
                  @keyup="materialChangeHandler"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="totalMaterial"
                  label="Keluar Bahan (Kg)"
                  type="number"
                  reverse
                  :readonly="true"
                />
              </VCol>
              <!--
                <VCol cols="3">
                <VBtn variant="none" @click="calculateMaterial" :readonly="true">Set Spare</VBtn>
                </VCol> 
              -->
            </VRow>
            <VRow>
              <VCol cols="12">
                <VDivider />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="lineDocNumber"
                  label="SPK Line Number"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="position"
                  label="Posisi"
                  @keyup="lineNumber"
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  v-model="process"
                  label="Process"
                  :items="processData"
                  item-title="name"
                  item-value="id"
                  return-object
                  :menu-props="{ maxHeight: '200px' }"
                />
                <!-- {{ process }} -->
              </VCol>
              <VCol
                cols="3"
                class="d-flex gap-4"
              >
                <VTextField
                  v-model="itemCode"
                  label="Item"
                  :readonly="true"
                  :rules="[requiredValidator]"
                />
                <Product 
                  @product="getProduct"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'CUTTING' || process.name === 'HANDLE MANUAL' || process.name === 'SORTIR HANDLE')">
              <VCol cols="3">
                <VTextField 
                  v-model="itemName"
                  label="Item Name"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="materialType"
                  label="Jenis Bahan"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="cutType"
                  label="Jenis Potongan"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="outputTarget"
                  label="Output Target"
                  reverse
                  type="number"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name !== 'CUTTING' && process.name !== 'HANDLE MANUAL' && process.name !== 'SORTIR HANDLE')">
              <VCol cols="6">
                <VTextField 
                  v-model="itemName"
                  label="Item Name"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="materialType"
                  label="Jenis Bahan"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="outputTarget"
                  label="Output Target"
                  reverse
                  type="number"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'UKURAN PON')">
              <VCol cols="4">
                <VTextField 
                  v-model="wasteTarget"
                  label="Target Waste (%)"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol cols="4">
                <VDateInput 
                  v-model="estimateFinish"
                  label="Target Selesai"
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="plantOrigin"
                  label="Plant Asal"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'GUSSET')">
              <VCol cols="3">
                <VTextField 
                  v-model="fold"
                  label="Lipatan"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="rollStart"
                  label="Ukuran Roll Awal"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="rollFinish"
                  label="Ukuran Roll Akhir"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="plantOrigin"
                  label="Plant Asal"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'PRINTING' || process.name === 'ROLL' || process.name === 'SOFT HANDLE' || process.name === 'HEAT SEAL' || process.name === 'SLITTING')">
              <VCol cols="3">
                <VTextField 
                  v-model="wasteTarget"
                  label="Target Waste (%)"
                  reverse
                  type="number"
                />
              </VCol>
              <VCol cols="3">
                <VDateInput 
                  v-model="estimateFinish"
                  label="Target Selesai"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="orderQty"
                  label="Jumlah Order"
                  reverse
                  type="number"
                />
              </VCol>
              <VCol cols="3">
                <VSelect 
                  v-model="orderUom"
                  label="UOM"
                  :items="uoms"
                  item-title="name"
                  item-value="id"
                />
              </VCol>
            </VRow>            
            <VRow v-if="process && (process.name === 'SLITTING')">
              <VCol cols="3">
                <VTextField 
                  v-model="rollStart"
                  label="Ukuran Roll Awal"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="rollFinish"
                  label="Ukuran Roll Akhir"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="plantOrigin"
                  label="Plant Asal"
                />
              </VCol>
              <VCol cols="3">
                <VCheckbox 
                  v-model="finishGood"
                  label="Finish Good ?"
                  true-value="2"
                  false-value="1"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'HEAT SEAL')">
              <VCol cols="4">
                <VTextField 
                  v-model="rollStart"
                  label="Ukuran Roll Awal"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="rollFinish"
                  label="Ukuran Roll Akhir"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="plantOrigin"
                  label="Plant Asal"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'PRINTING')">
              <VCol cols="3">
                <VTextField 
                  v-model="numberColor"
                  label="Jumlah Warna"
                />
              </VCol>
              <VCol cols="9">
                <VTextField 
                  v-model="colorName"
                  label="Warna"
                />
              </VCol>
              <!--
                <VCol cols="3">
                <VSelect 
                label="UOM Circum Cylinder"
                v-model="uomCircum"
                :items="uomCircumData"
                item-title="name"
                item-value="name"
                />
                </VCol> 
              -->
            </VRow>
            <VRow v-if="process && (process.name === 'PRINTING')">
              <VCol cols="4">
                <VTextField 
                  v-model="rollStart"
                  label="Ukuran Roll Awal"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="rollFinish"
                  label="Ukuran Roll Akhir"
                  type="number"
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="plantOrigin"
                  label="Plant Asal"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'ROLL')">
              <VCol cols="3">
                <VTextField 
                  v-model="orderCw"
                  label="CW Order"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="plantOrigin"
                  label="Plant Asal"
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
              <VCol cols="2">
                <VCheckbox 
                  v-model="useTreat"
                  label="Treat / AC ?"
                  true-value="2"
                  false-value="1"
                />
              </VCol>
              <VCol cols="2">
                <VCheckbox 
                  v-model="useRotary"
                  label="Use Rotary ?"
                  true-value="2"
                  false-value="1"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'SOFT HANDLE')">
              <VCol cols="6">
                <VTextField 
                  v-model="handle"
                  label="Handle"
                />
              </VCol>
              <VCol cols="6">
                <VTextField 
                  v-model="plantOrigin"
                  label="Plant Asal"
                />
              </VCol>
            </VRow>
            <VRow v-if="process && (process.name === 'CUTTING' || process.name === 'HANDLE MANUAL' || process.name === 'SORTIR HANDLE')">
              <VCol cols="3">
                <VTextField 
                  v-model="handle"
                  label="Handle"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="standardWeight"
                  label="Berat Standar"
                  reverse
                  type="number"
                />
              </VCol>
              <VCol cols="2">
                <VTextField 
                  v-model="minWeight"
                  label="Berat Minimal"
                  reverse
                  type="number"
                />
              </VCol>
              <VCol cols="2">
                <VTextField 
                  v-model="maxWeight"
                  label="Berat Maksimal"
                  reverse
                  type="number"
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
            <VRow>
              <VCol cols="12">
                <VTextarea 
                  v-model="note"
                  label="Note"
                  rows="2"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <!-- <VBtn :to="{ name: 'spk-master' }" color="warning">Close</VBtn> -->
                  <VBtn
                    :to="{ name: 'spk' }"
                    color="warning"
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
          </VForm>
        </VCardText>
      </VCard>

      <VSpacer class="mt-6" />
      <VCard>
        <VCardText>
          <VTable>
            <thead class="text-uppercase">
              <tr>
                <th scope="col">
                  Position
                </th>
                <th scope="col">
                  Process
                </th>
                <th scope="col">
                  Item Code
                </th>
                <th scope="col">
                  Item Name
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Waste Target (%)
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Output Target (Kg)
                </th>
                <th
                  scope="col"
                  style="text-align: center;"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in lines"
                :key="data.id"
              >
                <td>
                  {{ data.position }}
                </td>
                <td>
                  {{ data.process.name }}
                </td>
                <td class="text-no-wrap">
                  {{ data.item_code }}
                </td>
                <td>
                  {{ data.item_name }}
                </td>
                <td style="text-align: right">
                  {{ data.waste_target }}
                </td>
                <td style="text-align: right">
                  {{ data.output_target }}
                </td>
                <td>
                  <div class="d-flex text-center">
                    <VBtn
                      icon="tabler:trash"
                      color="error"
                      size="34"
                      variant="none"
                      @click="btnDeleteClickHandler(data.id)"
                    />
                    <VBtn
                      icon="tabler:settings"
                      size="34"
                      color="warning"
                      variant="none"
                      @click="showItemWipDialog(data)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VDialog
    v-model="isItemWipVisible"
    width="1024"
  >
    <VCard>
      <VCardTitle>Item WIP</VCardTitle>
      <VCardText>
        <VForm
          ref="refItemWipForm"
          @submit.prevent="onSubmitItem"
        >
          <VRow>
            <VCol
              cols="4"
              class="d-flex gap-3"
            >
              <VTextField
                v-model="itemWipCode"
                label="Item WIP Code"
                :readonly="true"
              />
              <Product 
                @product="getProductWip"
              />
            </VCol>
            <VCol cols="8">
              <VTextField
                v-model="itemWipName"
                label="Item WIP Name"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea 
                v-model="itemWipDesc"
                label="Description"
                :readonly="true"
                rows="2"
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
                @click="closeDialogHandler"
              >
                Close
              </VBtn>
            </VCol>
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
                Item Code
              </th>
              <th scope="col">
                Item Name
              </th>
              <th scope="col">
                Item Size
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody v-if="itemWips">
            <tr
              v-for="item in itemWips"
              :key="item.id"
            >
              <td>
                <p>{{ item.item_wip_code }}</p>
              </td>
              <td>
                <p>{{ item.item_wip_name }}</p>
              </td>
              <td>
                <p>{{ item.item_size }}</p>
              </td>
              <td>
                <VBtn
                  icon=""
                  size="x-small"
                  color="default"
                  variant="text"
                  @click="confirmDeleteItemWipHandler(item.id)"
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
</template>

<route lang="yaml">
  meta: 
    action: Read
    subject: SPK
    redirectIfLoggedIn: false
</route>
