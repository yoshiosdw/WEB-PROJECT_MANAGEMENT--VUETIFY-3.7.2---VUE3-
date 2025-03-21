<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from 'vue'


// import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue';

import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const maintainById = route.params.id

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
const completeDate = ref(new Date())

const refMaintenanceForm = ref()
const descrip = ref()

const fetchMaintenance = async maintainById => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/maintenance/lines/byMaintain/${maintainById}` )

    loading.value = false

    const maintenanceData = ret.data.data[0] 

    maintenance.value = maintenanceData
    descrip.value = maintenance.value.maintenance.description

    maintenanceDueDate.value = maintenanceData.maintenance.due_date
    maintenanceDate.value = maintenanceData.maintenance.document_date
    maintenanceNumber.value = maintenanceData.maintenance.document_number
    maintainBy.value = maintenanceData.maintenance.people.name

    asset.value = maintenanceData.asset.asset_number
    item.value = maintenanceData.asset.item.name
    location.value = maintenanceData.asset.location.name
  } catch(error){
    loading.value = false
    console.log(error)
  }
}


watchEffect(() => {
  fetchMaintenance(maintainById)
})

const goBack = () => {
  router.push('/maintenance')
}

const formatDateTimeMySql = value => {
  if (!value) return ''

  const date = new Date(value)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  // Format yang diinginkan: YYYY/MM/DD HH:MM
  return `${year}-${month}-${day} ${hours}:${minutes}`
}


const editMaintenance = async maintainById => {
  loading.value = true
  try {

    const payload = {
      maintain_by: cost.value,
      document_date: formatDateTimeMySql(document_date.value),
      description:description.value,
      due_date: formatDateTimeMySql(due_date.value),
      note: note.value,
    }

    const ret = await axiosIns.post(`/maintenances/${maintainById}`, payload )

    router.push('/maintenance')
    
  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    console.error(error)
  } finally { loading.value = false }
}


const onSubmit = () => {
  refMaintenanceForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) editMaintenance(maintainById)
  })
}
</script>

<template>
  <VForm
    ref="refMaintenanceForm"
    @submit.prevent="onSubmit"
  >
    <VRow>
      <VCol
        cols="12"
        md="9"
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
                      style="width: 11rem;"
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
                      style="width: 11rem;"
                      variant="filled"
                    />
                  </span>
                </p>
                <p class="d-flex align-center justify-sm-end mb-2">
                  <span class="me-2">Due Date</span>
                  <span>
                    <VTextField 
                      v-model="maintenanceDueDate"
                      style="width: 11rem;"
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
                  label="Select Asset"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol
                cols="4"
              >
                <VTextField
                  v-model="item"
                  readonly
                  label="Item"
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
            <p class="font-weight-semibold mb-2">
              Note:
            </p>
            <VTextarea
              v-model="descrip"
              :rows="2"
            />
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        cols="12"
        md="3"
      >
        <VCard class="mb-8">
          <VCardText>
            <VBtn
              class="mb-2 mt-2"
              block
              prepend-icon="tabler-send"
              color="error"
              type="submit"
            >
              Save
            </VBtn>
            
            <VBtn
              class="mb-2"
              variant="tonal"
              block
              @click="goBack"
            >
              Cancel
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VForm>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Ticket
    redirectIfLoggedIn: false
</route>
