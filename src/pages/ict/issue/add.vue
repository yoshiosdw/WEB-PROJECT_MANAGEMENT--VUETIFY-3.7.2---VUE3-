<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import IssueLine from '../issue/issueLine.vue'
import { useIssueStore } from './useIssueStore'

const issueForm = ref()
const issueStore = useIssueStore()

const documentNumber = ref()
const documentDate = ref(new Date())
const description = ref()
const itemBrand = ref()
const itemType = ref()
const typeFilter = ref()
const location = ref()
const locationData = ref()
const itemSerial = ref()

const isLoading = ref(true)
const saved = ref(false)

const fetchLocation = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/location/', {
      
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    locationData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
} 

onMounted(() => {
  fetchLocation()
})

const createIssue = async() => {
  try {
    const ret = await axiosIns.post('/ict/issue', {
      document_number: documentNumber.value,
      document_date: formatDateMySql(documentDate.value),
      location_id: location.value,
      description: description.value,
    } )
    
    Swal.fire({
      title: 'LBG',
      text: 'Create new Item success',
      icon: 'success',
    })
    saved.value = true
    issueStore.issue = ret.data.data
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: 'Create Vendor failed',
      icon: 'error',
    })
  }
}

const onSubmit = () => {
  issueForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createIssue()
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <!-- <VOverlay v-model="isLoading" /> -->
      <VCard>
        <VCardText>
          <VForm
            ref="issueForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="documentNumber"
                  :rules="[requireValidator]"
                  label="Document Number"
                />
              </VCol>
              <VCol cols="4">
                <VDateInput 
                  v-model="documentDate"
                  :rules="[requiredValidator]"
                  label="Document Date"
                />
              </VCol>
              <VCol cols="4">
                <VSelect 
                  v-model="location"
                  label="Location"
                  placeholder="Location"
                  :items="locationData"
                  item-title="name"
                  item-value="id"
                  single-line
                  :rules="[requireValidator]"
                />                
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  :rules="[requireValidator]"
                  label="Description"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  :to="{name: 'ict-issue'}"
                  color="warning"
                >
                  Close
                </VBtn>
                <VBtn
                  v-if="!saved"
                  color="success"
                  type="submit"
                >
                  Save
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard v-if="saved">
        <IssueLine />
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
