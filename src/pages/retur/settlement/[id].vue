<script setup>
import axiosIns from '@/plugins/axios'
import router from '@/router'
import Swal from 'sweetalert2'
import { useReturStore } from '../useReturStore'

const returStore = useReturStore()
const route = useRoute()
const routeId = route.params.id
const returs = ref()
const isLoading = ref(true)
const completions = ref([])
const total = ref(0)
const soReturNumber = ref()
const soReturDate = ref()
const soInvoiceNumber = ref()
const soInvoiceDate = ref()
const progress = ref(1)
const correctiveAction  = ref()
const preventiveAcion = ref()
const replacementDate = ref()
const returInvoiceDate = ref()
const status = ref(0)
const colsedDate = ref()

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

const fetchCompletion = async () => {
  try {
    const ret = await axiosIns.get(`/return/completions`, {
     
      params: {
        retur_id: routeId,
      },
    })

    completions.value = ret.data.data
    total.value = ret.data.meta.total
    soReturNumber.value = total.value == 0 ? '' : completions.value[0].so_retur_number
    soReturDate.value = total.value == 0 ? null : completions.value[0].so_retur_date
    soInvoiceNumber.value = total.value == 0 ? '' : completions.value[0].so_invoice_number
    soInvoiceDate.value = total.value == 0 ? null : completions.value[0].so_invoice_date
    correctiveAction.value = total.value == 0 ? '' : completions.value[0].correnctive_action
    preventiveAcion.value = total.value == 0 ? '' : completions.value[0].preventive_action
    replacementDate.value = total.value == 0 ? null : completions.value[0].replacement_date
    returInvoiceDate.value = total.value == 0 ? null : completions.value[0].return_invoice_date
    isLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Fail to load Completion data',
      icon: 'error',
    })
    
    console.log(error)
    router.push({ name: 'retur' })
  }
}

const createSettlement = async () => {
  try {
    const ret = await axiosIns.post('/return/completions', {
      memo_retur_id: routeId,

      // completion_id: completionId.value,
      so_retur_number: soReturNumber.value,
      so_retur_date: soReturDate.value,
      so_invoice_number: soInvoiceNumber.value,
      so_invoice_date: soInvoiceDate.value,
      progress: progress.value,
      correnctive_action: correctiveAction.value,
      preventive_action: preventiveAcion.value,
      replacement_date: replacementDate.value,
      return_invoice_date: returInvoiceDate.value,
      status: status.value,
    } )

    router.push({ name: 'retur' })
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

watchEffect(() => {
  fetchRetur(routeId),
  fetchCompletion()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="isLoading" />
      <VCard v-if="!isLoading">
        <VCardTitle>Form Resolution</VCardTitle>
        <VSpacer />
        <VCardText v-if="returs && returs.length > 0 && returs[0]">
          <VRow>
            <VCol cols="3">
              <VTextField 
                v-model="returs[0].document_number"
                :readonly="true"
                label="Document Number"
              />
            </VCol>
            <VCol cols="3">
              <VDateInput 
                v-model="returs[0].document_date"
                :readonly="true"
                label="Document Date"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="returs[0].return_types.name"
                label="Type"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="returs[0].salesman_name"
                label="Salesman"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="4">
              <VTextField
                v-model="returs[0].return_categories.name"
                label="Category"
                :readonly="true"
              />
            </VCol>
            <VCol cols="4">
              <VTextField
                v-model="returs[0].return_sub_categories.name"
                label="Sub Category"
                :readonly="true"
              />
            </VCol>
            <VCol cols="4">
              <VTextField
                v-model="returs[0].customer_account"
                label="Customer Account"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="4">
              <VTextField
                v-model="returs[0].customer_name"
                label="Customer Name"
                :readonly="true"
              />
            </VCol>
            <VCol cols="4">
              <VTextField
                v-model="returs[0].customer_theritory"
                label="Theritory"
                :readonly="true"
              />
            </VCol>
            <VCol cols="">
              <VTextField
                v-model="returs[0].sales_order_number"
                label="Sales Order"
                :readonly="true"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>      
    </VCol>

    <VCol cols="12">
      <VCard>
        <VCardText>
          <VRow>
            <!-- {{ completions }} -->
            <VCol cols="6">
              <VTextField 
                v-model="soReturNumber"
                label="No. SO Retur/ Pot. Nota/ NO. TJ"
              />
            </VCol>
            <VCol cols="6">
              <VDateInput
                v-model="soReturDate"
                label="Tanggal Retur"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextField
                v-model="soInvoiceNumber"
                label="No. Invoice"
              />
            </VCol>
            <VCol cols="6">
              <VDateInput
                v-model="soInvoiceDate"
                label="Tanggal "
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextarea
                v-model="correctiveAction"
                label="Correnctive Action"
                :rows="2"
              />
            </VCol>
            <VCol cols="6">
              <VTextarea
                v-model="preventiveAcion"
                label="Preventive Action"
                :rows="2"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VDateInput
                v-model="replacementDate"
                label="Tanggal Kirim Replace"
              />
            </VCol>
            <VCol cols="6">
              <VDateInput
                v-model="returInvoiceDate"
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
  action: Manage
  subject: Task Resoluition
  redirectIfLoggedIn: false
</route>
