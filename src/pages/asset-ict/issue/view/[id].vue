<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import userImg from '@/assets/images/sjb.png'
import ItemDialog from '@/pages/item/itemDialog.vue'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from 'vue'

// import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue';

import { useRoute, useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)

const route = useRoute()
const issueId = route.params.id

const issueForm = ref()

const item = ref()
const items = ref()
const itemId = ref()
const itemIdSelect = ref()
const itemCategoryId = ref()

const uom = ref()
const uomId = ref()
const uomData = ref()
const description = ref()
const quantity = ref()
const price = ref()

const locationId = ref()
const buildingId = ref()
const floorId = ref()
const siteLocation = ref()
const buildingLocation = ref()
const floorLocation = ref()
const floorIdSent = ref()

const issueData = ref([])

const documentNumber = ref()
const documentDate = ref()


const fetchIssue = async issueId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/issues/${issueId}` )

    issueData.value = ret.data.data[0]

    documentNumber.value = issueData.value.document_number
    documentDate.value = issueData.value.document_date
    item.value = issueData.value.line[0].item.name
    itemId.value = issueData.value.line[0].item.id
    uom.value =issueData.value.line[0].uom.code
    uomId.value =issueData.value.line[0].uom.id
    price.value = issueData.value.line[0].price
    quantity.value = issueData.value.line[0].quantity
    description.value = issueData.value.description

    // locationId.value = issueData.value.location.ancestors[1].name
    // locationId.value = issueData.value.location.ancestors[2].name
    // locationId.value = issueData.value.location.name

    floorIdSent.value = issueData.value.location.id

    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}

watchEffect(() => {
  if (issueData.value && issueData.value.location) {
    locationId.value = issueData.value.location.ancestors[1] ? issueData.value.location.ancestors[1].name : '-'
    buildingId.value = issueData.value.location.ancestors[2] ? issueData.value.location.ancestors[2].name : '-'
    floorId.value = issueData.value.location.name
  }
})

watchEffect(() => {
  fetchIssue(issueId)
})


const goBack = () => {
  router.back()
}
</script>

<template>
  <VRow>
    <VCol
      cols="12"
    >
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <div style="background-color: #f5f5f5; margin: 15px; padding: 15px; border-radius: 15px;">
          <VCardText
            class="d-flex flex-wrap justify-space-between flex-column flex-sm-row"
          >
            <div class="ma-sm-1">
              <div class="d-flex align-center mb-6">
                <VNodeRenderer
                  class="me-3"
                />
                  
                <VAvatar
                  rounded
                  :size="40"
                  color="primary"
                  variant="none"
                >
                  <VImg 
                    max-width="100"
                    :src="userImg"
                  />
                </VAvatar>
                <h6 class="font-weight-bold text-xl ms-3">
                  DETAIL ISSUE
                </h6>
              </div>
            </div>

            <div class="mt-4 ma-sm-1">
              <p class="d-flex align-center justify-sm-end mb-2">
                <span class="me-2">Document Number</span>
                <span>
                  <VTextField 
                    v-model="documentNumber"
                    readonly
                    variant="filled"
                    style="width: 8.9rem;"
                  />
                </span>
              </p>
              <p class="d-flex align-center justify-sm-end mb-2">
                <span class="me-2">Document Date</span>
                <span>
                  <VTextField 
                    v-model="documentDate"
                    density="compact"
                    style="width: 8.9rem;"
                    readonly
                    variant="filled"
                  />
                </span>
              </p>
            </div>
          </VCardText>
        </div>

        <VDivider />
        <VCardText>
          <VRow>
            <VCol
              cols="6"
              class="d-flex justify-end gap-3 "
            >
              <VTextField
                v-model="item"
                label="Item Name"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol
              cols="3"
              class="d-flex justify-end gap-3 "
            >
              <VTextField
                v-model="uom"
                readonly
                variant="filled"
                label="Uom"
              />
            </VCol>
            <VCol
              cols="3"
              class="d-flex justify-end gap-3 "
            >
              <VTextField
                v-model="quantity"
                label="Quantity"
                readonly
                variant="filled"
              />
            </VCol>
          </VRow>

          <VRow class="mt-3">
            <VCol
              cols="4"
              class="d-flex justify-end gap-3 "
            >
              <VTextField
                v-model="price"
                label="price"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol
              cols="8"
              class="d-flex justify-end gap-3 "
            >
              <VTextField
                v-model="description"
                label="description"
                readonly
                variant="filled"
              />
            </VCol>
          </VRow>

          <VRow class="mt-3">
            <VCol cols="4">
              <VTextField
                v-model="locationId"
                readonly
                variant="filled"
                label="location Site"
              />
            </VCol>

            <VCol cols="4">
              <VTextField
                v-model="buildingId"
                readonly
                variant="filled"
                label="Building"
              />
            </VCol>

            <VCol cols="4">
              <VTextField
                v-model="floorId"
                readonly
                variant="filled"
                label="Floor"
              />
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
    subject: Ticket
    redirectIfLoggedIn: false
</route>
