<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import router from "@/router"
import Swal from "sweetalert2"

const typeData = ref()
const organizations = ref()
const oCode = ref()
const oName = ref()
const oType = ref()
const refOrganizationForm = ref()
const dataOrgnanization = ref()
const organizationId = ref()
const dataOrganizationId = ref()
const showLoading = ref(false)
const savingProcess = ref(false)

const loading = ref(true)

const fetchTypes = async() => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/organization/types' )

    typeData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  }
}


const createOrganization = async() => {
  savingProcess.value = true
  showLoading.value = true
  try {
    const response = await axiosIns.post('/organizations', {
      code: oCode.value,
      name: oName.value,
      organization_type_id: oType.value,
      parent_id:organizationId.value,
    } )

    savingProcess.value = false
    showLoading.value = false
    oCode.value = null
    oName.value = null
    oType.value = null
    organizationId.value = null
    router.back()
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  }
}

const fetchOrganization = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/organizations` )

    dataOrgnanization.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchTypes()
  fetchOrganization()
})


// const fetchorganizationById = async typeDataId => {
//   loading.value = true
//   try {
//     const ret = await axiosIns.get(`/parentById/${typeDataId}`, {
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
//       },
//     })

//     dataOrgnanization.value = ret.data.data
//   } catch(error) {
//     Swal.fire({
//       title: 'SJB',
//       text: error,
//       icon: 'error',
//     })
//   }
// }

// watch(typeDataId, newtypeDataId => {
//   loading.value = true
//   dataOrgnanization.value = null

//   fetchorganizationById(newtypeDataId)
//   loading.value = false
// })



const onSubmit = () => {
  refOrganizationForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) createOrganization()
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle>Create Organization</VCardTitle>
        <VForm
          ref="refOrganizationForm"
          @submit.prevent="onSubmit"
        >
          <VCardText>
            <VRow>
              <VCol cols="2">
                <VTextField
                  v-model="oCode"
                  label="Code"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="5">
                <VTextField
                  v-model="oName"
                  label="Name"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="3">
                <VSelect 
                  v-model="oType"
                  label="Organization Type"
                  :items="typeData"
                  item-title="name"
                  item-value="id"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="2">
                <VSelect 
                  v-model="organizationId"
                  label="Data Organization"
                  :items="dataOrgnanization"
                  item-title="name"
                  item-value="id"
                  clearable
                  :menu-props="{ maxHeight: '300px' }"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <VBtn
                    :to="{name: 'organization'}"
                    color="warning"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    v-if="!saved"
                    color="primary"
                    type="submit"
                    :loading="savingProcess"
                  >
                    Save
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Organization
    redirectIfLoggedIn: false
  </route>
