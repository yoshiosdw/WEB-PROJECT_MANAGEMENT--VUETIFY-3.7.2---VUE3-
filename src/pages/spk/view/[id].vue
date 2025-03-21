<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'

const route = useRoute()
const spkId = ref(route.params.id)
const spk = ref()
const spkNumber = ref()
const spkDate = ref()
const noNota = ref()
const quantity = ref(0)
const qtyInKg = ref(0)
const billNumber = ref(null)
const shippingTolerance = ref(0)
const shippingDate = ref()
const uom = ref()
const customer = ref('')
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

const isLoading = ref(true)

const fetchSpk = async id => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/production/workorders/${id}` )

    isLoading.value = false
    spk.value = ret.data.data[0]
    spkNumber.value = spk.value.document_number
    customer.value = spk.value.customer_account
    customerName.value = spk.value.customer_name
    itemCode.value = spk.value.item_code
    itemName.value = spk.value.item_name
    itemSize.value = spk.value.item_size
    packingDetail.value = spk.value.packing_detail
    productWipCode.value = spk.value.item_wip_code
    productWipName.value = spk.value.item_wip_name
    billNumber.value = spk.value.bill_number
    quantity.value = spk.value.quantity
    uom.value = spk.value.uom.name 
    qtyInKg.value = spk.value.quantity_in_kg
    shippingDate.value = spk.value.shipping_date
    shippingTolerance.value = spk.value.shipping_tolerance
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Get data failed',
      icon: 'error',
    })
  }
}

const fetchSpkLines = async spkId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/production/workorder/lines/${spkId}` )

    isLoading.value = false
    lines.value = ret.data.data
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: 'SPK',
      text: 'Get data line failed.',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchSpk(spkId.value),
  fetchSpkLines(spkId.value)
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VOverlay v-model="isloading" />
        <VSpacer />
        <VCardTitle>View SPK Header</VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="3">
              <VTextField 
                v-model="spkNumber"
                label="Document Number"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="customer"
                label="Customer"
                :readonly="true"
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
            <VCol cols="3">
              <VTextField 
                v-model="itemCode"
                label="Item"
                :readonly="true"
              />
            </VCol>
            <VCol cols="6">
              <VTextField 
                v-model="itemName"
                label="Item Name"
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
                v-model="productWipCode"
                label="Item WIP"
                :readonly="true"
              />
            </VCol>
            <VCol cols="6">
              <VTextField 
                v-model="productWipName"
                label="Item WIP Name"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="billNumber"
                label="Bill Number"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="2">
              <VTextField 
                v-model="quantity"
                label="Quantity"
                reverse
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="uom"
                label="UOM"
                :readonly="true"
              />
            </VCol>
            <VCol cols="2">
              <VTextField 
                v-model="qtyInKg"
                label="Quantity in Kg"
                reverse
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="shippingDate"
                label="Shipping Date"
                :readonly="true"
              />
            </VCol>
            <VCol cols="2">
              <VTextField 
                v-model="shippingTolerance"
                label="Shipping Tolerance"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <div class="d-flex justify-end gap-4">
                <VBtn
                  :to="{ name: 'spk' }"
                  color="warning"
                >
                  Close
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
      <VSpacer class="mt-6" />
      <VCard>
        <VOverlay v-model="isloading" />
        <VCardTitle>View SPK Lines</VCardTitle>
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
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in lines"
                :key="data.id"
              >
                <td>{{ data.position }}</td>
                <td>{{ data.process.name }}</td>
                <td>{{ data.item_code }}</td>
                <td>{{ data.item_name }}</td>
                <td style="text-align: right">
                  {{ data.waste_target }}
                </td>
                <td style="text-align: right">
                  {{ data.output_target }}
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
