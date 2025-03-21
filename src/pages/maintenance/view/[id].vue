<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from 'vue'


// import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue';

import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const viewId = route.params.id

const loading = ref(false)


const maintenance = ref()
const maintenanceNumber = ref()
const maintenanceDate = ref()
const maintenanceDueDate= ref()

const maintainBy = ref()

const asset = ref()
const item = ref()
const location = ref()
const description = ref()

const cost = ref()
const completeDate = ref()
const serial = ref()

const refMaintenanceForm = ref()
const descrip = ref()

const fetchMaintenance = async viewId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/maintenance/lines/byMaintain/${viewId}` )

    loading.value = false

    const maintenanceData = ret.data.data[0] 

    maintenance.value = maintenanceData
    descrip.value = maintenance.value.maintenance.description
    serial.value = maintenanceData.asset.serial_number

    cost.value =  maintenance.value.maintenance.cost
    completeDate.value =  maintenance.value.maintenance.complete_date

    maintenanceDueDate.value = maintenanceData.maintenance.due_date
    maintenanceDate.value = maintenanceData.maintenance.document_date
    maintenanceNumber.value = maintenanceData.maintenance.document_number
    maintainBy.value = maintenanceData.maintenance.people.name

    asset.value = maintenanceData.asset.asset_number
    item.value = maintenanceData.asset.item.name
    location.value = maintenanceData.asset.location.name ?  maintenanceData.asset.location.name : '-'

   
  } catch(error){
    loading.value = false
    console.log(error)
  }
}


watchEffect(() => {
  fetchMaintenance(viewId)
})

const goBack = () => {
  router.push('/maintenance')
}
</script>

<template>
  <VRow>
    <VCol
      cols="12"
    >
      <!-- <EditableCheckout /> -->
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <div style="background-color: #f5f5f5; margin: 15px; padding: 15px; border-radius: 15px;">
          <VCardText
            class="d-flex flex-wrap justify-space-between flex-column flex-sm-row"
          >
            <div class="ma-sm-1">
              <div class="d-flex align-center mb-6">
                <VNodeRenderer
                  :nodes="themeConfig.app.logo"
                  class="me-3"
                />
                <h6 class="font-weight-bold text-xl">
                  FORM MAINTENANCE
                </h6>
              </div>
            </div>
            <div class="mt-4 ma-sm-1">
              <p class="d-flex align-center justify-sm-end mb-2">
                <span class="me-2">Document Number</span>
                <span>
                  <VTextField 
                    v-model="maintenanceNumber"
                    readonly
                    style="width: 12rem;"
                    variant="filled"
                  />
                </span>
              </p>
              <p class="d-flex align-center justify-sm-end mb-2">
                <span class="me-2">Maintenance Date</span>
                <span>
                  <VTextField 
                    v-model="maintenanceDate"
                    readonly
                    style="width: 12rem;"
                    variant="filled"
                  />
                </span>
              </p>
            </div>
          </VCardText>
        </div>

        <VDivider />
        <VCardText class="mx-sm-4 mt-3">
          <VRow>
            <VCol
              cols="6"
              class="d-flex align-center gap-3"
            >
              <h5 class="text-sm font-weight-medium mb-2 text-center">
                Maintain By:
              </h5>
              <VTextField
                v-model="maintainBy"
                readonly
                variant="filled"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="mx-sm-4">
          <VRow>
            <VCol
              cols="4"
              class="d-flex justify-end gap-3 "
            >
              <VTextField
                v-model="asset"
                label="Asset Number"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol
              cols="4"
            >
              <VTextField
                v-model="serial"
                readonly
                label="Serial Number"
                variant="filled"
              />
            </VCol>
            <VCol
              cols="4"
            >
              <VTextField
                v-model="location"
                readonly
                variant="filled"
                label="Location"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="mx-sm-4">
          <VRow>
            <VCol cols="4">
              <VTextField  
                v-model="cost"
                label="Total Cost"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol cols="4">
              <VTextField  
                v-model="maintenanceDueDate"
                label="Due Date"
                density="compact"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol cols="4">
              <VTextField  
                v-model="completeDate"
                label="Complete Date"
                density="compact"
                readonly
                variant="filled"
              />
            </VCol>
          </VRow>
        </VCardText>
          
        <VCardText class="mx-sm-4">
          <VTextarea
            v-model="descrip"
            :rows="2"
            readonly
            variant="filled"
            label="Note"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Ticket
    redirectIfLoggedIn: false
</route>
