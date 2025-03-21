<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import { ref } from 'vue'

// import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue';

import { useRoute, useRouter } from 'vue-router'


const router = useRouter()
const route = useRoute()

const loading = ref(false)


const checkinId = route.params.id
const checkinData = ref([])
const documentNumber = ref()
const documentDate = ref()

const assetNumber = ref()
const serialNumber = ref()
const qty = ref()


const fetchCheckin = async checkinId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/checkins/${checkinId}` )

    checkinData.value = ret.data.data[0]
    documentNumber.value = checkinData.value.document_number
    documentDate.value = checkinData.value.document_date

    assetNumber.value = checkinData.value.line[0] && checkinData.value.line[0].asset[0] ? checkinData.value.line[0].asset[0].asset_number : '-'
    serialNumber.value = checkinData.value.line[0] && checkinData.value.line[0].asset[0] ? checkinData.value.line[0].asset[0].serial_number : '-'
    qty.value = checkinData.value.line[0] ? checkinData.value.line[0].quantity : '-'
    loading.value = false
  } catch(error) {
    loading.value = false
    console.log(error)
  }
}

const goBack = () => {
  router.back()
}

watchEffect(() => {
  fetchCheckin(checkinId)
})

const referenceName = computed(() => {
  const checkinFrom = checkinData.value.checkin_from
  if (checkinFrom === 'Employee') {
    return checkinData.value.employee ? checkinData.value.employee.person.name : ''
  } else if (checkinFrom === 'Item') {
    return checkinData.value.item ? checkinData.value.item.name : ''
  } else if (checkinFrom === 'Location') {
    return checkinData.value.location ? checkinData.value.location.name : ''
  }
  
  return ''
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VRow>
        <VCol cols="12">
          <VTabs>
            <VTab
              @click="goBack"
            >
              <VIcon
                :size="35"
                icon="tabler-corner-down-left-double"
                class="me-1"
              />
              <span> Back </span>
            </VTab>
          </VTabs>
        </VCol>
      </VRow>
      <VOverlay v-model="loading" />
      <VCard
        :loading="loading"
        class="mt-3"
      >
        <div style="background-color: #f5f5f5; margin: 15px; padding: 15px; border-radius: 15px;">
          <VCardText class="d-flex flex-wrap justify-space-between flex-column flex-sm-row">
            <div class="ma-sm-1">
              <div class="d-flex align-center mb-6">
                <VNodeRenderer
                  :nodes="themeConfig.app.logo"
                  class="me-3"
                />
                <h6 class="font-weight-bold text-xl">
                  FORM CHECKIN
                </h6>
              </div>
            </div>
            <div class="mt-4 ma-sm-1">
              <h3 class="d-flex align-center font-weight-medium justify-sm-end text-l mb-2">
                <span class="me-2">Document Number</span>
                <span>
                  <VTextField 
                    v-model="documentNumber"
                    readonly
                    style="width: 11rem;"
                    variant="filled"
                  />
                </span>
              </h3>
              <p class="d-flex align-center justify-sm-end mb-2">
                <span class="me-2">Document Date</span>
                <span>
                  <VTextField 
                    v-model="documentDate"
                    density="compact"
                    style="width: 11rem;"
                    readonly
                    variant="filled"
                  />
                </span>
              </p>
              <p class="d-flex align-center justify-sm-end mb-2">
                <span class="me-2">Checkin Date</span>
                <span>
                  <VTextField 
                    v-model="checkinData.checkin_date"
                    density="compact"
                    style="width: 11rem;"
                    readonly
                    variant="filled"
                  />
                </span>
              </p>
            </div>
          </VCardText>
        </div>
        <VDivider />
        <VCardText class="justify-space-between flex-column flex-sm-row gap-4">
          <VCardText class="mx-sm-4 mt-3">
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="checkinData.checkin_from"
                  readonly
                  label="Checkin From"
                  variant="filled"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="referenceName"
                  readonly
                  label="Reference"
                  variant="filled"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="4">
                <VTextField
                  v-model="assetNumber"
                  readonly
                  label="Asset Number"
                  variant="filled"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="serialNumber"
                  readonly
                  label="Serial Number"
                  variant="filled"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="qty"
                  readonly
                  label="Quantity"
                  variant="filled"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="checkinData.note"
                  readonly
                  label="Note"
                  variant="filled"
                />
              </VCol>
            </VRow>
          </VCardText>
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
