<script setup>
import { formatDateMySql, formatRibuan } from '@/@core/utils/formatters'
import { negativeValidator, requiredValidator } from '@/@core/utils/validators'
import Customer from '@/pages/lookup/customers.vue'
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import Product from '../lookup/product.vue'
import { useReturStore } from './useReturStore'

const returs = ref()
const items = ref()
const route = useRoute()
const returId = ref(route.params.edit)
const isLoading = ref(false)

const itemCode = ref()
const itemName = ref()
const itemFamilyProduct = ref()
const quantity = ref(0)
const unitOfMeasure = ref(null)
const quantityInBall = ref(0)
const productData = ref()
const settlement = ref()

const returStore = useReturStore()
const returForm = ref()
const documentNumber = ref()
const documentDate = ref(new Date())
const returnTypeId = ref()
const returTypeData = ref()
const returnCategoryId = ref()
const returCategoryData = ref()
const returnSubCategoryId = ref()
const returSubCategoryData = ref()
const customerAccount = ref()
const customerName = ref()
const customerTheritory = ref()
const salesmanName = ref()
const salesOrderNumber = ref('-')
const note = ref('')

const plant = ref([])
const plantData = ref([])
const status = ref(0)
const today = new Date()

const uomData = ref()
const uomLoading = ref(true)

const fetchRetur = async taskId => {
  isLoading.value = true
  try{
    const ret = await axiosIns.get(`returns/${taskId}` )

    returs.value = ret.data.data[0]
    documentNumber.value = returs.value.document_number
    documentDate.value = returs.value.document_date
    plant.value = returs.value.plant.split(',')
    returnTypeId.value = returs.value.return_type_id
    returnCategoryId.value = returs.value.return_category_id
    returnSubCategoryId.value = returs.value.return_sub_category_id
    salesmanName.value = returs.value.salesman_name
    salesOrderNumber.value = returs.value.sales_order_number
    customerName.value = returs.value.customer_name
    customerAccount.value = returs.value.customer_account
    customerTheritory.value = returs.value.customer_theritory
    note.value = returs.value.retur_note
    settlement.value = returs.value.settlement

    isLoading.value = false
  } catch(error) {
    console.log(error)
    isLoading.value = false
  }
}

const fetchReturType = async () => {
  try {
    const ret = await axiosIns.get('/return/types' )

    returTypeData.value = ret.data.data

    // returTypeLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to fetch Retur Type Data',
      icon: 'error',
    })
    console.log(error)

    // returTypeLoading.value = false
  }
}

const fetchReturCategory = async () => {
  try {
    const ret = await axiosIns.get('/return/categories' )

    returCategoryData.value = ret.data.data

    // returCategoryLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text:'Fail to get Category Data',
      icon: 'error',
    })
    console.log(error)
  }
}

const fetchReturSubCategory = async () => {
  try {
    const ret = await axiosIns.get('/return/sub/categories' )

    returSubCategoryData.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text:'Fail to get Sub Category Data',
      icon: 'error',
    })
    console.log(error)
  }
}

const getCustomer = val => {
  // alert(val.CustName)
  customerAccount.value = val.CustAccount
  customerName.value = val.CustName
  customerTheritory.value = val.Territory
}

onMounted(() => {
  fetchReturCategory(),
  fetchReturSubCategory(),
  fetchReturType()
})

const fetchUom = async () => {
  try {
    const ret = await axiosIns.get('/uoms' )
    
    uomData.value = ret.data.data
    uomLoading.value = false    
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
  fetchRetur(returId.value)
})

onMounted(() => {
  fetchUom()
})

const updateTask = async id => {
  isLoading.value = true
  try {
    const ret = await axiosIns.patch(`returns/${id}`, {
      document_number: returs.value.document_number,
      document_date: formatDateMySql(documentDate.value),
      plant: plant.value,
      return_type_id: returnTypeId.value, // Fix typo here
      return_category_id: returnCategoryId.value,
      return_sub_category_id: returnSubCategoryId.value,
      salesman_name: salesmanName.value,
      sales_order_number: salesOrderNumber.value,
      customer_account: customerAccount.value,
      customer_name: customerName.value,
      customer_theritory: customerTheritory.value,
      retur_note: note.value,
      settlement: settlement.value,
    } )

    isLoading.value = false
    Swal.fire({
      title: 'LBG',
      text: 'Update data successfully',
      icon: 'success',
    })
  } catch(error) {
    isLoading.value.valeu = false
    console.log(error)
  }
}

const refUpdateReturtForm = ref()

const onSubmit = () => {
  refUpdateReturtForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateTask(returId.value)
  })
}

const refReturItemForm = ref()

const onSubmitItem = () => {
  refReturItemForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createReturItem(returId.value)
  })
}

const isQuantityInBallReadonly = ref(false)

const changeQty = () => {
  if (unitOfMeasure.value.name === 'BALL') {
    quantityInBall.value = quantity.value
    isQuantityInBallReadonly.value = true
  } else {
    isQuantityInBallReadonly.value = false
  }
}

const createReturItem = async () => {
  isLoading.value = true
  var qtyBall = 0
  if(unitOfMeasure.value.name == 'BALL'){
    qtyBall = quantity.value
  } else {
    qtyBall = quantityInBall.value
  }

  const body = {
    memo_retur_id: returId.value,
    item_code: itemCode.value,
    item_name: itemName.value,
    item_family_product: itemFamilyProduct.value,
    return_quantity: quantity.value,
    return_uom: unitOfMeasure.value.id,
    return_qty_in_ball: qtyBall,
  }

  try {
    const ret = await axiosIns.post('return/items', body, {
      headers: {
        'Authorization': 'Bearer '+localStorage.getItem('sinarjoAccessToken'),
      },
    })

    isLoading.value = false
    fetchReturItem(returId.value)
    itemCode.value = null
    itemName.value = null
    itemFamilyProduct.value = null
    quantity.value = 0
    unitOfMeasure.value = null
    quantityInBall.value = 0
  } catch (error) {
    isLoading.value = false
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Create line failed',
      icon: 'error',
    })
    console.log(error)
  }
}

const getProduct = val => {
  productData.value = val
  itemCode.value = val.ItemNumber
  itemName.value = val.ProductName
  itemFamilyProduct.value = val.ProductFamilyCode
}

const getStatusProductLoading = val => {
  productLoading.value = val
}

const fetchReturItem = async returId  => {
  try {
    const ret = await axiosIns.get(`return/items/${returId}`, {
      headers: {
        'Authorization':'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
      },
    })

    items.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Get item data Failed',
      icon: 'error',
    })
    console.log(error)
  }
}

onMounted(() => {
  fetchReturItem(returId.value)
})

const deleteData = async itemId => {
  try{
    const ret = await axiosIns.delete(`return/items/${itemId}` )

    fetchReturItem(returId.value)
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Delete data failed.',
      icon: 'error',
    })
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonColor: 'primary',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}
</script>

<template>
  <VRow>
    <VCol
      v-if="returs"
      cols="12"
    >
      <VOverlay v-model="isLoading" />
      <VCard :loading="isLoading">
        <VCardTitle>Edit Return</VCardTitle>
        <VSpacer />
        <VCardText>
          <VForm
            ref="refUpdateReturtForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="documentNumber"
                  :rules="[requiredValidator]"
                  label="Document Number"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VDateInput 
                  v-model="documentDate"
                  :rules="[requiredValidator]"
                  label="Document Date"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  v-model="plant"
                  :items="['A', 'B', 'C/D', 'E', 'F', 'G', 'TKI', 'Other']"
                  label="Plant"
                  multiple
                />
                <!-- {{ plant }} -->
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="salesmanName"
                  label="Salesman"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VSelect
                  v-model="returnTypeId"
                  label="Type"
                  placeholder="Type"
                  :items="returTypeData"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="4">
                <VSelect
                  v-model="returnCategoryId"
                  label="Category"
                  placeholder="Category"
                  :items="returCategoryData"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="4">
                <VSelect
                  v-model="returnSubCategoryId"
                  label="Sub Category"
                  placeholder="Sub Category"
                  :items="returSubCategoryData"
                  item-title="name"
                  item-value="id"
                  :menu-props="{ maxHeight: '320px' }"
                  single-line
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <div class="d-flex gap-3">
                  <VTextField
                    v-model="customerName"
                    label="Customer Name"
                    :readonly="true"
                  />
                  <Customer @customer="getCustomer" />
                </div>
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="customerTheritory"
                  label="Theritory"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <div class="d-flex gap-3">
                  <VTextField
                    v-model="salesOrderNumber"
                    label="Sales Order Number"
                    :rules="[requiredValidator]"                    
                  />
                  <!-- <SalesOrder @salesOrder="getSalesOrder" /> -->
                </div>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea 
                  v-model="note"
                  label="Complain"
                  rows="2"
                />
              </VCol>
            </VRow>
  
            <VRow>
              <VCol cols="12">
                <VTextarea 
                  v-model="settlement"
                  label="Requested Solution"
                  rows="2"
                />
              </VCol>
            </VRow>
            
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <VBtn
                    :to="{name: 'retur'}"
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
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>

      <VSpacer class="mt-6" />
      <VCard>
        <VCardText>
          <VForm
            ref="refReturItemForm"
            @submit.prevent="onSubmitItem"
          >
            <VRow>
              <VCol cols="4">
                <div class="d-flex gap-3">
                  <VTextField 
                    v-model="itemCode"
                    label="Item Code"
                    :readonly="true"
                    :rules="[requiredValidator]"
                  />
                  <Product
                    @product="getProduct"
                    @product-loading="getStatusProductLoading"
                  />
                </div>
              </VCol>
              <VCol cols="5">
                <div class="d-flex gap-3">
                  <VTextField 
                    v-model="itemName"
                    label="Item Name"
                    :readonly="true"
                  />
                </div>
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="itemFamilyProduct"
                  :readonly="true"
                  label="Family Product"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <div class="d-flex gap-3">
                  <VSelect
                    v-model="unitOfMeasure"
                    label="Unit Of Measure"
                    placeholder="Unit Of Measure"
                    :items="uomData"
                    item-title="name"
                    item-value="id"
                    :rules="[requiredValidator]"
                    return-object
                  >
                    Unit Of Measure
                  </VSelect>
                  <!-- {{ unitOfMeasure.name }} -->
                </div>
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="quantity"
                  type="number"
                  label="Quantity"
                  inputmode="numeric"
                  :rules="[negativeValidator]"
                  reverse
                  @change="changeQty"
                />
              </VCol>
              <VCol
                v-if="unitOfMeasure !== null && unitOfMeasure.name !== 'BALL'"
                cols="3"
              >
                <VTextField
                  v-model="quantityInBall"
                  type="number"
                  inputmode="numeric"
                  label="Quantity In Ball"
                  :rules="[negativeValidator]"
                  reverse 
                />
              </VCol>
              <VCol cols="3">
                <VBtn
                  color="primary"
                  type="submit"
                >
                  Apply
                </VBtn>
              </VCol>
            </VRow>
          </VForm>

          <VSpacer class="mt-10" />
          <VTable>
            <thead class="text-uppercase">
              <tr>
                <th scope="col">
                  ITEM CODE
                </th>
                <th scope="col">
                  NAME
                </th>
                <th scope="col">
                  FAMILY PRODUCT
                </th>
                <th scope="col">
                  QUANTITY
                </th>
                <th scope="col">
                  UOM
                </th>
                <th scope="col">
                  QTY IN BALL
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in items"
                :key="item.id"
              >
                <td>
                  {{ item.item_code }}
                </td>
                <td>
                  {{ item.item_name }}
                </td>
                <td>
                  {{ item.item_family_product }}
                </td>
                <td style="text-align: right;">
                  {{ formatRibuan(item.return_quantity) }}
                </td>
                <td>
                  {{ item.return_uom.code }}
                </td>
                <td style="text-align: right;">
                  {{ formatRibuan(item.return_qty_in_ball) }}
                </td>
                <td>
                  <VBtn
                    icon="tabler-trash"
                    variant="none"
                    size="24"
                    @click="btnDeleteClickHandler(item.id)"
                  />
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
    subject: Return
    redirectIfLoggedIn: false
</route>
