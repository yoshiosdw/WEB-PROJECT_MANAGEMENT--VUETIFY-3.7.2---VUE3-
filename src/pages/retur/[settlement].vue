<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'
import axiosIns from '@/plugins/axios'
import router from '@/router'
import Swal from 'sweetalert2'
import { useReturStore } from './useReturStore'

const returStore = useReturStore()
const route = useRoute()
const routeId = route.params.id
const returs = ref()
const isLoading = ref(true)

const fetchRetur = async returId => {
  try {
    const ret = await axiosIns.get(`/retur/${returId}` )

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

const createSettlement = async id => {
  try {
    const ret = await axiosIns.patch(`/return/memo/retur/settlement/${id}`, {
      so_retur_number: returStore.retur.so_retur_number,
      so_retur_date: returStore.retur.so_retur_date,
    } )
  } catch (error) {
    Swal.fire({
      text: 'Error while creating settlement',
      title: 'LBG',
      icon: 'error',
    })
    console.log(error)
  }
}

const applyBtnHandler = () => {
  createSettlement(routeId)
}

onMounted(() => {
  fetchRetur(routeId)
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
      <VCard v-if="returStore.retur">
        <VCardText>
          <VRow>
            <VCol cols="6">
              <VTextField
                v-model="returStore.retur.so_retur_number"
                label="No. SO Retur/ Pot. Nota/ NO. TJ"
              />
            </VCol>
            <VCol cols="6">
              <VDateInput
                v-model="returStore.retur.so_retur_date"
                label="Tanggal"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextField
                v-model="returStore.retur.invoice_number"
                label="No. Invoice"
              />
            </VCol>
            <VCol cols="6">
              <VDateInput
                v-model="returStore.retur.invoice_date"
                label="Tanggal"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextarea
                v-model="returStore.retur.corrective_action"
                label="Correnctive Action"
                :rows="2"
              />
            </VCol>
            <VCol cols="6">
              <VTextarea
                v-model="returStore.retur.preventive_action"
                label="Preventive Action"
                :rows="2"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VDateInput
                v-model="returStore.retur.replacement_date"
                label="Tanggal Kirim Replace"
              />
            </VCol>
            <VCol cols="6">
              <VDateInput
                v-model="returStore.retur.replacement_invoice_date"
                label="Tanggal Invoice RO"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol class="d-flex justify-end gap-4">
              <VBtn
                color="warning"
                :to="{ name: 'retur'}"
              >
                Cancel
              </VBtn>
              <VBtn @click="applyBtnHandler">
                Apply
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Person
  redirectIfLoggedIn: false
</route>
