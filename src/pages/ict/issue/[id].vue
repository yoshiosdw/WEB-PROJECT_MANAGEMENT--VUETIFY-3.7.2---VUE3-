<script setup>
import { formatDateMySql } from "@/@core/utils/formatters"
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"
import IssueLine from './issueLine.vue'
import { useIssueStore } from "./useIssueStore"

const route = useRoute()
const issueId = route.params.id 
const issue = ref()
const issueStore = useIssueStore()

const location = ref()
const locationData = ref()

const isLoading = ref(false)
const saved = ref(false)

const fetchIssue = async issueId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/ict/issue/${issueId}` )

    issue.value = ret.data.data[0]
    issueStore.setIssue(ret.data.data[0])
    isLoading.value = false
  } catch(error) {
    Swal.fire({
      text: 'Failed to load Issue',
      title: 'LBG',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchIssue(issueId)
})

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

onBeforeUnmount(() => {
  issueStore.issue = null
})

const updateIssue = async issueId => {
  if (issueStore.issue !== null) {
    try {
      const ret = await axiosIns.patch(`/ict/issue/${issueId}`, {
        document_number: issue.value.document_number,
        document_date: formatDateMySql(issue.value.document_date),
        description: issue.value.description,
        location_id: issue.value.location_id,
      }, {
        
      })

      Swal.fire({
        title: 'LBG',
        text: 'Update Issue successfully',
        icon: 'success',
      })
      saved.value = true
    } catch(error) {
      Swal.fire({
        title: 'LBG',
        text: error,
        icon: 'error',
      })
    }
  }
}

const refUpdateIssueForm = ref()

const onSubmit = () => {
  refUpdateIssueForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateIssue(issueStore.issue.id)
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="isLoading" />
      <VCard>
        <VCardText v-if="issue">
          <VForm
            ref="refUpdateIssueForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="4">
                <VTextField 
                  v-model="issue.document_number"
                  :rules="[requireValidator]"
                  readonly="true"
                  label="Code"
                />
              </VCol>
              <VCol cols="4">
                <VDateInput 
                  v-model="issue.document_date"
                  :rules="[requireValidator]"
                  readonly="true"
                  label="Document Date"
                />
              </VCol>
              <VCol cols="4">
                <VSelect 
                  v-model="issue.location_id"
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
                  v-model="issue.description"
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
                  v-if="!saved"
                  color="success"
                  type="submit"
                >
                  Save
                </VBtn>
    
                <VBtn 
                  color="warning"
                  :to="{ name: 'ict-issue' }"
                >
                  Close
                </VBtn>
              </VCol>
            </VRow>        
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
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
