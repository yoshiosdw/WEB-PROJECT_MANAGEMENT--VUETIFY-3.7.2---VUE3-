<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import Customer from "@/pages/lookup/customers.vue"
import Product from '@/pages/lookup/product.vue'
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"
import { useSpkStore } from "./useSpkStore"

const spkStore = useSpkStore()
const route = useRoute()
const spkId = ref(route.params.id)
const spk = ref(null)
const showLoading = ref(false)

const spkNumber = ref()
const spkDate = ref()
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
const itemInstruction = ref()
const itemDescription = ref()
const itemSize = ref()

const productWipData = ref()
const productWipCode = ref()
const productWipName = ref()

const lines = ref()

const spkType = ref()

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

const fetchSpk = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/production/workorders/${id}` )

    showLoading.value = false
    spk.value = ret.data.data[0]
    spkStore.spk = ret.data.data[0]
    spkNumber.value = spk.value.document_number
    spkDate.value = spk.value.document_date
    itemCode.value = spk.value.item_code
    itemName.value = spk.value.item_name
    billNumber.value = spk.value.bill_number
    quantity.value = spk.value.quantity
    uom.value = spk.value.uom.name
    qtyInKg.value = spk.value.quantity_in_kg
    itemSize.value = spk.value.item_size
    productWipCode.value = spk.value.item_wip_code
    productWipName.value = spk.value.item_wip_name
    customer.value = spk.value.customer_account
    customerName.value = spk.value.customer_name
    shippingDate.value = spk.value.shipping_date
    shippingTolerance.value = spk.value.shipping_tolerance
    packingDetail.value = spk.value.packing_detail
    repeatOrder.value = spk.value.is_repeat_order,
    spkType.value = spk.value.is_internal
  } catch(error) {
    showLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Get data SPK failed',
      icon: 'error',
    })
  }
}

const fetchUom = async () => {
  try {
    const ret = await axiosIns.get('/uoms' )
    
    uomData.value = ret.data.data
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
  fetchSpk(spkId.value),
  fetchUom()
})

const updateSpkHeader = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.patch(`/production/workorders/${id}`, {
      document_number: spkNumber.value,
      document_date: spkDate.value,
      item_code: itemCode.value,
      item_name: itemName.value,
      item_instruction: itemInstruction.value,
      item_description: itemDescription.value,
      bill_number: billNumber.value,
      quantity: quantity.value,
      unit_of_measure: uom.value,
      item_size: itemSize.value,
      item_wip_code: productWipCode.value,
      item_wip_name: productWipName.value,
      customer_account: customer.value,
      customer_name: customerName.value,
      quantity_in_kg: qtyInKg.value,
      shipping_date: shippingDate.value,
      shipping_tolerance: shippingTolerance.value,
      packing_detail: packingDetail.value,
      is_repeat_order: repeatOrder.value,
    } )

    showLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Update data successfully.',
      icon: 'success',
    })
  } catch(error) {
    showLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Update data SPK failed',
      icon: 'error',
    })
  }
}

const refUpdateSpkForm = ref()

const onSubmit = () => {
  refUpdateSpkForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateSpkHeader(spkId.value)
  })
}

const fetchLines = async id => {
  try {
    const ret = await axiosIns.get(`/production/workorder/lines/${id}` )

    lines.value = ret.data.data
  } catch(error) {
    console.log(error)
  }
}

watchEffect(() => {
  fetchLines(spkId.value)
})

const deleteData = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/production/workorder/lines/${id}` )

    showLoading.value = false
    fetchLines(spkId.value)
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Delete data failed.',
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
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard>
        <VCardTitle>Edit SPK</VCardTitle>
        <VCardText>
          <VForm ref="refUpdateSpkForm">
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="spkNumber"
                  :rules="[requiredValidator]"
                  label="Document Number"
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
                />
                <Customer @customer="getCustomer" />
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
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="packingDetail"
                  label="Packing Details"
                  rows="2"
                />
              </VCol>
            </VRow> 
            <!--
              <VRow>
              <VCol cols="3" class="d-flex gap-4">
              <VTextField 
              label="Item WIP"
              v-model="productWipCode"
              :readonly="true"
              :rules="[requiredValidator]"
              />
              <ProductWip :itemWip="itemCode" @itemWip="getProductWip" />
              </VCol>
              <VCol cols="6">
              <VTextField label="Nama" v-model="productWipName" :readonly="true" />
              </VCol>
              <VCol cols="3" v-if="spkType !== null " >
              <VTextField label="Bill Number" v-model="billNumber"/>
              </VCol>
              </VRow> 
            -->
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
                <VDateInput 
                  v-model="shippingDate"
                  label="Shipping Date"
                />
              </VCol>
              <VCol cols="5">
                <VTextField
                  v-model="shippingTolerance"
                  label="Shipping Tolerance"
                  type="number"
                  reverse
                />
              </VCol>
              <VCol
                v-if="spkType !== null "
                cols="4"
              >
                <VTextField
                  v-model="billNumber"
                  label="Bill Number"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <div class="d-flex justify-end gap-4">
                <VBtn
                  :to="{ name: 'spk' }"
                  color="warning"
                >
                  Close
                </VBtn>
                <VBtn
                  color="success"
                  type="submit"
                  @click="onSubmit"
                >
                  Save
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <VSpacer class="mt-6" />
      <VCard>
        <VCardTitle>
          <VCol cols="12">
            <VRow>
              <VCol cols="6">
                SPK Line
              </VCol>
              <VCol
                cols="6"
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  :to="{name: 'spk-line', params: {line: spkId}}"
                  prepend-icon="tabler-plus"
                >
                  Add New
                </VBtn>
              </VCol>
            </VRow>
          </VCol>
        </VCardTitle>

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
                  style="text-align:right"
                >
                  Waste Target (%)
                </th>
                <th
                  scope="col"
                  style="text-align:right"
                >
                  Output Target (Kg)
                </th>
                <th scope="col">
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
                <td>
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
                <td style="width: 8rem;">
                  <div class="d-flex justify-start">
                    <!-- <VBtn icon="tabler-edit" color="warning" variant="none" /> -->
                    <VBtn
                      icon="tabler-trash"
                      color="error"
                      variant="none"
                      @click="btnDeleteClickHandler(data.id)"
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
</template>

<route lang="yaml">
  meta: 
    action: Read
    subject: SPK
    redirectIfLoggedIn: false
</route>
