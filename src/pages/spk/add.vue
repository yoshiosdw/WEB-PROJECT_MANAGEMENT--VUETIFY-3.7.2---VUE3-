<script setup>
import { formatDateMySql } from "@/@core/utils/formatters"
import { requiredValidator } from "@/@core/utils/validators"
import Customer from "@/pages/lookup/customers.vue"
import Product from "@/pages/lookup/product.vue"
import axiosIns from "@/plugins/axios"
import router from "@/router"
import Swal from "sweetalert2"
import { watchEffect } from "vue"

const spkId = ref()
const spkNumber = ref('Created by System')
const spkDate = ref(new Date())
const noNota = ref()
const quantity = ref(0)
const qtyInKg = ref(0)
const billNumber = ref(null)
const shippingTolerance = ref(0)
const shippingDate = ref()
const uomData = ref()
const uom = ref()
const customer = ref()
const customerData = ref()
const customerName = ref()
const packingDetail = ref()
const repeatOrder = ref()

const productData = ref()
const productLoading = ref(true)
const itemCode = ref()
const itemName = ref()
const itemBrand = ref()
const itemDesc = ref()
const itemInstruction = ref()
const itemDescription = ref()
const itemSize = ref()

const productWipData = ref()
const productWipCode = ref()
const productWipName = ref()

const showLoading = ref(true)
const savingProcess = ref(true)
const saved = ref(false)
const waiting = ref(true)
const labelButton = ref('Next')

const spkData = [
  {
    id: 1,
    name: "Internal",
  }, {
    id: 2,
    name: "Eksternal",
  },
]

const spkType = ref(spkData[0])

const getProduct = val => {
  productData.value = val
  itemCode.value = val.ItemNumber
  itemName.value = val.ProductName
  itemSize.value = val.Size
  itemBrand.value = val.Brand 
  itemInstruction.value = val.Instruction
  itemDescription.value = val.Description
  packingDetail.value = val.Instruction
}

const getStatusProductLoading = val => {
  productLoading.value = val
}

const getProductWip = val => {
  productWipData.value = val
  productWipCode.value = val.BOMID
  productWipName.value = val.NAME
}

const getCustomer = val => {
  customerData.value = val
  customer.value = val.CustAccount
  customerName.value = val.CustName
}

const fetchUom = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/uoms', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
      },
    })
    
    showLoading.value = false
    uomData.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title:'LBG',
      text: 'Fail to load data UOM',
      icon: error,
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchUom()
})

watchEffect(()=>{
  if(spkType.value.id == 1){
    customer.value = 'SJB'
    customerName.value = 'SINAR JOYOBOYO'
  } else {
    customer.value = ''
    customerName.value = ''
  }
})

const createSpk = async () => {
  savingProcess.value = true
  showLoading.value = true
  try {
    const ret = await axiosIns.post('/production/workorders', {
      document_date: formatDateMySql(spkDate.value),
      item_code: itemCode.value,
      item_name: itemName.value,
      item_brand: itemBrand.value,
      item_instruction: itemInstruction.value,
      item_description: itemDescription.value,
      bill_number: billNumber.value,
      quantity: quantity.value,
      unit_of_measure: uom.value,
      item_size: itemSize.value,

      // item_wip_code: productWipCode.value,
      // item_wip_name: productWipName.value,
      customer_account: customer.value,
      customer_name: customerName.value,
      quantity_in_kg: qtyInKg.value,
      shipping_date: shippingDate.value,
      shipping_tolerance: shippingTolerance.value,
      packing_detail: packingDetail.value,
      is_repeat_order: repeatOrder.value,
      is_internal: spkType.value.id,
    } )

    savingProcess.value = false
    showLoading.value = false
    spkId.value = ret.data.data.id
    router.push({ name: 'spk-line', params: { line: spkId.value } })
  } catch (error) {
    savingProcess.value = false
    showLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Failed get data SPK',
      icon: 'error',
    })
  }
}

const refCreateSpkForm = ref()

const onSubmit = () => {
  refCreateSpkForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createSpk()
  })
}

const refCreateSpkLineForm = ref()
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard>
        <VCardTitle>Create SPK</VCardTitle>
        <!-- {{ spkData }} -->
        <VForm
          ref="refCreateSpkForm"
          @submit.prevent="onSubmit"
        >
          <VCardText>
            <VRow>
              <VCol class="d-flex">
                <div class="d-flex gap-4">
                  <VRadioGroup
                    v-model="spkType"
                    inline
                  >
                    <VRadio 
                      v-for="type in spkData"
                      :key="type.id"
                      :label="type.name"
                      :value="type"
                    />
                  </VRadioGroup>
                  <VCheckbox
                    v-model="repeatOrder"
                    label="Repeat Order"
                  />
                </div>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="spkNumber"
                  :rules="[requiredValidator]"
                  label="SPK Number"
                  placeholder="Created by System"
                  :readonly="true"
                />
              </VCol>
              <VCol
                cols="3"
                class="d-flex gap-4"
              >
                <VTextField 
                  v-model="customer"
                  label="Customer"
                  :readonly="true"
                  :rules="[requiredValidator]"
                />
                <Customer
                  v-if="spkType.id === 2" 
                  @customer="getCustomer"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="customerName"
                  label="Customer Name"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
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
                  @product-loading="getStatusProductLoading"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="itemName"
                  label="Nama"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="itemSize"
                  label="Size Details"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="packingDetail"
                  label="Packing Details"
                  rows="2"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField
                  v-model="quantity"
                  label="Quantity"
                  reverse
                  type="number"
                />
              </VCol>
              <VCol cols="5">
                <VSelect 
                  v-model="uom"
                  label="UOM"
                  :items="uomData"
                  item-title="name"
                  item-value="id"
                  placeholder="UOM"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="qtyInKg"
                  label="Quantity in Kg"
                  type="number"
                  reverse
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField
                  v-model="shippingTolerance"
                  label="Shipping Tolerance"
                  type="numeric"
                  reverse
                />
              </VCol>
              <VCol cols="5">
                <VDateInput 
                  v-model="shippingDate"
                  label="Shipping Date"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-if="spkType.id != 1"
                  v-model="billNumber"
                  label="Bill Number"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
          </VCardText>
          
          <VCardText>
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <VBtn
                    :to="{name: 'spk'}"
                    color="warning"
                  >
                    Cancel
                  </VBtn>
                  <!--
                    <VBtn
                    :to="{name: 'spk'}"
                    color="warning"
                    >
                    Close
                    </VBtn> 
                  -->
                  <VBtn
                    color="success"
                    type="submit"
                  >
                    {{ labelButton }}
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
    action: Manage
    subject: SPK
    redirectIfLoggedIn: false
</route>
