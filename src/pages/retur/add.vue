<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'
import { formatDateMySql, formatRibuan } from '@/@core/utils/formatters'
import { negativeValidator, requiredValidator } from '@/@core/utils/validators'
import Customer from '@/pages/lookup/customers.vue'
import Product from '@/pages/lookup/product.vue'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import { useReturStore } from './useReturStore'

const route = useRoute()
const returStore = useReturStore()
const returForm = ref()
const returId = ref(null)
const documentNumber = ref('Created by System')
const documentDate = ref(new Date())
const returnTypeId = ref()
const returnCategoryId = ref()
const returnSubCategoryId = ref()
const customerAccount = ref()
const customerName = ref()
const customerTheritory = ref()
const salesmanName = ref()
const salesOrderNumber = ref('-')
const memoDocumentNumber = ref()
const note = ref('')
const itemCode = ref()
const itemName = ref()
const itemFamilyProduct = ref()
const quantity = ref(0)
const unitOfMeasure = ref()
const quantityInBall = ref(0)
const plant = ref()
const settlement = ref()
const status = ref(0)
const today = new Date()
const dueDate = ref(today.setDate(today.getDate()+8))

const isLoading = ref(true)

const uomData = ref()
const returTypeData = ref()
const returCategoryData = ref()
const returSubCategoryData = ref()
const customerData = ref(null)
const productData = ref(null)

// const sequenceNumberLoading = ref(true)
const uomLoading = ref(true)
const returTypeLoading = ref(true)
const returCategoryLoading = ref(true)
const returSubCategoryLoading = ref(true)
const customerLoading = ref(true)
const productLoading = ref(true)
const labelButton = ref('Next')

const returs = ref()
const items = ref()

const errors = ref({
  name: undefined,
})

const savingProcess = ref(false)
const saved = ref(false)

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

const createReturn = async () => {
  savingProcess.value = true
  try {
    const response = await axiosIns.post('/returns',{
      // document_number: documentNumber.value,
      document_date: formatDateMySql(documentDate.value),
      plant: plant.value,
      salesman_name: salesmanName.value,

      return_type_id: returnTypeId.value,
      return_category_id: returnCategoryId.value,
      return_sub_category_id: returnSubCategoryId.value,

      sales_order_number: salesOrderNumber.value,
      memo_document_number: memoDocumentNumber.value,
      customer_account: customerAccount.value,
      customer_name: customerName.value,
      customer_theritory: customerTheritory.value,
      
      retur_note: note.value,
      settlement: settlement.value,
  
      status: status.value,
    } )

    savingProcess.value = false
    saved.value = true
    returId.value = response.data.data.id
    returStore.retur = response.data.data
    labelButton.value = 'Save'
    fetchReturItem(returId.value)

    // router.push({name: 'retur'})
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Create Retur failed',
      icon: 'error',
    })
    savingProcess.value = false
    saved.value = false
    console.log(error)
  }
}

const updateReturn = async returId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.patch(`returns/${returId}`, {
      document_date: formatDateMySql(documentDate.value),
      plant: plant.value,
      return_type_id: returnTypeId.value, 
      return_category_id: returnCategoryId.value,
      return_sub_category_id: returnSubCategoryId.value,
      salesman_name: salesmanName.value,
      sales_order_number: salesOrderNumber.value,
      memo_document_number: memoDocumentNumber.value,
      customer_account: customerAccount.value,
      customer_name: customerName.value,
      customer_theritory: customerTheritory.value,
      retur_note: note.value,
      settlement: settlement.value,
    } )

    isLoading.value = false
  } catch(error) {
    isLoading.value = false
    console.log(error)
  }
}

const fetchReturType = async () => {
  try {
    const ret = await axiosIns.get('/return/types' )

    returTypeData.value = ret.data.data
    returTypeLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to fetch Retur Type Data',
      icon: 'error',
    })
    console.log(error)
    returTypeLoading.value = false
  }
}

const fetchReturCategory = async () => {
  try {
    const ret = await axiosIns.get('/return/categories' )

    returCategoryData.value = ret.data.data
    returCategoryLoading.value = false
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
  returSubCategoryLoading.value = true
  try {
    const ret = await axiosIns.get('/return/sub/categories' )

    returSubCategoryData.value = ret.data.data
    returSubCategoryLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text:'Fail to get Sub Category Data',
      icon: 'error',
    })
    console.log(error)
    returSubCategoryLoading.value = false
  }
}

const onSubmit = () => {
  returForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
    {
      if(!saved.value){
        createReturn()
      } else {
        // jalankan update header
        updateReturn(returId.value)
      }
    }
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

const getCustomer = val => {
  // alert(val.CustName)
  customerAccount.value = val.CustAccount
  customerName.value = val.CustName
  customerTheritory.value = val.Territory
}

const getProduct = val => {
  productData.value = val
  itemCode.value = val.ItemNumber
  itemName.value = val.ProductName
  itemFamilyProduct.value = val.ProductCategory
}

const getStatusProductLoading = val => {
  productLoading.value = val
}

const setIsLoading = (seq, uom, returType, returCategory, returSubCategory) =>{
  isLoading.value = seq ? true : uom ? true : returType ? true : returCategory ? true : returSubCategory ? true  : false
  
}

watchEffect(()=>{
  setIsLoading(uomLoading.value, returTypeLoading.value, returCategoryLoading.value, returSubCategoryLoading.value)
})

watchEffect(() => {
  fetchUom()
})

watchEffect(() => {
  fetchReturType()
})

watchEffect(() => {
  fetchReturCategory()
})

watchEffect(() => {
  fetchReturSubCategory()
})

// onMounted(() => {
//   generateSequeceNumber()
// })

const handleKeyDown = event => {
  if(event.key === 'F2' ){
    alert('HI Stranger! 🤣')
  }
}

const createReturItem = async () => {
  var qtyBall = 0
  if(unitOfMeasure.value.name == 'BALL') {
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

  isLoading.value = true
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

const fetchReturItem = async returId  => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`return/items/${returId}`, {
      headers: {
        'Authorization':'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
      },
    })

    isLoading.value = false
    items.value = ret.data.data
  } catch (error) {
    isLoading.value = false
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Get item data Failed',
      icon: 'error',
    })
    console.log(error)
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown)
})

const deleteData = async itemId => {
  isLoading.value = true
  try{
    const ret = await axiosIns.delete(`return/items/${itemId}` )

    isLoading.value =false
    fetchReturItem(returId.value)
  } catch(error) {
    isLoading.value = false
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
    <VCol cols="12">
      <VOverlay v-model="isLoading" />
      <VCard>
        <VCardTitle>Create Return</VCardTitle>
        <VSpacer />
        <VCardText>
          <VForm
            ref="returForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="documentNumber"
                  :rules="[requiredValidator]"
                  label="Document Number"
                  placeholder="Created by System"
                  readonly
                />
              </VCol>
              <VCol cols="3">
                <VDateInput 
                  v-model="documentDate"
                  :rules="[requiredValidator]"
                  label="Document Date"
                  readonly
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  v-model="plant"
                  :items="['A', 'B', 'C/D', 'E', 'F', 'G', 'TKI', 'Other']"
                  label="Plant"
                  :rules="[requiredValidator]"
                  multiple
                />
                <!-- {{ plant }} -->
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="salesmanName"
                  :rules="[requiredValidator]"
                  label="Salesman"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField
                  v-model="memoDocumentNumber"
                  label="Memo Doc. Number"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="3">
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
              <VCol cols="3">
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
              <VCol cols="3">
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
                    readonly
                  />
                  <Customer @customer="getCustomer" />
                </div>
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="customerTheritory"
                  label="Theritory"
                  readonly
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="salesOrderNumber"
                  label="Sales Order Number"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea 
                  v-model="note"
                  label="Complain"
                  rows="2"
                  :rules="[requiredValidator]"
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
                    v-if="!saved"
                    :to="{name: 'retur'}"
                    color="warning"
                  >
                    Cancel
                  </VBtn>
                  <VBtn
                    v-if="saved"
                    :to="{name: 'retur'}"
                    color="warning"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    color="success"
                    type="submit"
                  >
                    {{ labelButton }}
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
      <VSpacer class="mt-6" />
      <VCard v-if="saved">
        <!-- <VCard> -->
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
                    readonly
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
                    readonly
                  />
                </div>
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="itemFamilyProduct"
                  readonly
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
                v-if="unitOfMeasure && unitOfMeasure.name !== 'BALL'"
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
                <td>
                  {{ formatRibuan(item.return_quantity) }}
                </td>
                <td>
                  {{ item.return_uom.code }}
                </td>
                <td>
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
    action: Manage
    subject: Return
    redirectIfLoggedIn: false
</route>
