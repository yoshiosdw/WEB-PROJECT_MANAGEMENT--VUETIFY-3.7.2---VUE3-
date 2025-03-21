<script setup>
import axiosIns from '@/plugins/axios'
import router from '@/router'
import Swal from 'sweetalert2'
import task from './task.vue'
import { useReturStore } from './useReturStore'

const returStore = useReturStore()
const route = useRoute()
const routeId = route.params.tasks
const tasks = ref()
const returs = ref()
const isLoading = ref(true)

const fetchRetur = async returId => {
  try {
    const ret = await axiosIns.get(`/returns/${returId}` )

    returs.value = ret.data.data
    returStore.retur = ret.data.data
    isLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Fail to load Retur data',
      icon: 'error',
    })
    
    console.log(error)
    router.push({ name: 'retur' })
  }
}

const fetchTasks = async returId => {
  try {
    const ret = await axiosIns.get(`/task/returns/${returId}` )

    tasks.value = ret.data.data
    console.log(ret.data.data)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    console.log(error)
    router.push({ name: 'retur' })
  }
}

onMounted(() => {
  fetchRetur(routeId),
  fetchTasks(routeId)
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="isLoading" />
      <VCard v-if="!isLoading">
        <VCardText>
          <VRow>
            <VCol cols="3">
              <VTextField 
                v-model="returs.document_number"
                :readonly="true"
                label="Document Number"
              />
            </VCol>
            <VCol cols="3">
              <VDateInput 
                v-model="returs.document_date"
                :readonly="true"
                label="Document Date"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="returs.return_types.name"
                label="Type"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="returs.salesman_name"
                label="Salesman"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextField
                v-model="returs.return_categories.name"
                label="Category"
                :readonly="true"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="returs.return_sub_categories.name"
                label="Category"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="3">
              <VTextField
                v-model="returs.customer_account"
                label="Category"
                :readonly="true"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="returs.customer_name"
                label="Customer Name"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="returs.customer_theritory"
                label="Theritory"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="3">
              <VTextField
                v-model="returs.item_code"
                label="Item Code"
                :readonly="true"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="returs.item_name"
                label="Item Name"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="returs.item_family_product"
                label="Family Product"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="3">
              <VTextField
                v-model="returs.sales_order_number"
                label="Sales Order"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="returs.return_quantity"
                label="Retur Quantity"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="returs.return_uom.name"
                label="Unit of Measure"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="returs.return_qty_in_ball"
                label="Quantity In Ball"
                :readonly="true"
              />
            </VCol>
          </VRow>            
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12">
      <Task
        v-if="tasks"
        :data="routeId"
      />
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Person
  redirectIfLoggedIn: false
</route>
