<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { useReturStore } from './useReturStore'

const tasks = ref()
const items = ref()
const route = useRoute()
const returId = ref(route.params.id)

const itemCode = ref()
const itemName = ref()
const itemFamilyProduct = ref()
const quantity = ref()
const unitOfMeasure = ref()
const quantityInBall = ref(0)
const productData = ref()
const settlement = ref()

const returStore = useReturStore()
const returForm = ref()
const documentNumber = ref()
const documentDate = ref(new Date())
const returnTypeId = ref()
const returTypeData = ref()
const returCategoryData = ref()
const returSubCategoryData = ref()
const returnCategoryId = ref()
const returnSubCategoryId = ref()
const customerAccount = ref()
const customerName = ref()
const customerTheritory = ref()
const salesmanName = ref()
const salesOrderNumber = ref()
const note = ref('')

const plant = ref()
const status = ref(0)
const today = new Date()

const uomData = ref()
const uomLoading = ref(true)

const fetchReturTask = async taskId => {
  try{
    const ret = await axiosIns.get(`returns/${taskId}` )

    tasks.value = ret.data.data[0]
  } catch(error) {
    console.log(error)
  }
}

const fetchReturType = async () => {
  try {
    const ret = await axiosIns.get('/return/types' )

    returTypeData.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to fetch Retur Type Data',
      icon: 'error',
    })
    console.log(error)
  }
}

const fetchReturCategory = async () => {
  try {
    const ret = await axiosIns.get('/return/categories' )

    returCategoryData.value = ret.data.data
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

    // returSubCategoryLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text:'Fail to get Sub Category Data',
      icon: 'error',
    })
    console.log(error)
  }
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
  fetchReturTask(returId.value)
})

onMounted(() => {
  fetchUom()
})

const updateTask = async id => {
  try {
    const ret = await axiosIns.patch(`returns/${id}`, {
      document_date: formatDateMySql(tasks.value.document_date),
      plant: tasks.value.plant,
      salesman_name: tasks.value.salesman_name,

      sales_order_number: tasks.value.sales_order_number,
      customer_account: tasks.value.customer_account,
      customer_name: tasks.value.customer_name,
      customer_theritory: tasks.value.customer_theritory,
      
      retur_note: tasks.value.retur_note,
      settlement: tasks.value.settlement,
      return_type_id: tasks.value.return_type_id,
      return_category_id: tasks.value.return_category_id,
      return_sub_category_id: tasks.value.return_sub_category_id,
    } )

    Swal.fire({
      title: 'LBG',
      text: 'Update data successfully',
      icon: 'success',
    })
  } catch(error) {
    console.log(error)
  }
}

const refUpdateReturtForm = ref()

const onSubmit = () => {
  refUpdateReturtForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateTask(returId.value)
  })
}

const createReturItem = async () => {
  try {
    const ret = await axiosIns.post('return/items', {
      memo_retur_id: returId.value,
      item_code: itemCode.value,
      item_name: itemName.value,
      item_family_product: itemFamilyProduct.value,
      return_quantity: quantity.value,
      return_uom: unitOfMeasure.value,
      return_qty_in_ball: quantityInBall.value,
    }, {
      headers: {
        'Authorization': 'Bearer '+localStorage.getItem('sinarjoAccessToken'),
      },
    })

    fetchReturItem(returId.value)
    itemCode.value = null
    itemName.value = null
    itemFamilyProduct.value = null
    quantity.value = 0
    unitOfMeasure.value = null
    quantityInBall.value = 0
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Create line failed',
      icon: 'error',
    })
    console.log(error)
  }
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
    <VCol cols="12">
      <VCard>
        <VCardTitle>View Return</VCardTitle>
        <VSpacer />
        <VCardText v-if="tasks">
          <VForm
            ref="refUpdateReturtForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="3">
                <VTextField 
                  v-model="tasks.document_number"
                  :rules="[requiredValidator]"
                  label="Document Number"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VDateInput 
                  v-model="tasks.document_date"
                  :rules="[requiredValidator]"
                  label="Document Date"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  v-model="tasks.plant"
                  :items="['A', 'B', 'C/D', 'E', 'F', 'G', 'TKI', 'Other']"
                  label="Plant"
                  :readonly="true"
                />
                <!--
                  <VSelect
                  v-model="tasks.plant"
                  :items="['A', 'B', 'C/D']"
                  label="Plant"
                  multiple
                  /> 
                -->
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="tasks.salesman_name"
                  label="Salesman"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="tasks.return_types.name"
                  label="Type"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="tasks.return_categories.name"
                  label="Categories"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="tasks.return_sub_categories.name"
                  label="Sub Categories"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VTextField
                  v-model="tasks.customer_name"
                  label="Customer Name"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="tasks.customer_theritory"
                  label="Theritory"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <div class="d-flex gap-3">
                  <VTextField
                    v-model="tasks.sales_order_number"
                    label="Sales Order Number"
                    :readonly="true"
                  />
                </div>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea 
                  v-model="tasks.retur_note"
                  label="Complain"
                  rows="2"
                  :readonly="true"
                />
              </VCol>
            </VRow>
  
            <VRow>
              <VCol cols="12">
                <VTextarea 
                  v-model="tasks.settlement"
                  label="Requested Solution"
                  rows="2"
                  :readonly="true"
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
                  {{ item.return_quantity }}
                </td>
                <td>
                  {{ item.return_uom.code }}
                </td>
                <td>
                  {{ item.return_qty_in_ball }}
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
