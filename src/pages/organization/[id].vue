<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import router from "@/router"
import Swal from "sweetalert2"
import { useRoute } from 'vue-router'

const route = useRoute()

const IdOrganization = ref(route.params.id)
const dataIdOrganization = ref ()
const typeData = ref()
const organizations = ref()
const oCode = ref()
const oName = ref()
const oType = ref()
const refUpdateForm = ref()
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


const updateOrganization = async() => {
  savingProcess.value = true
  showLoading.value = true
  try {
    const response = await axiosIns.patch(`/organizations/${IdOrganization.value}`, {
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

const fetchOrganizationId = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/organizations/parent/${IdOrganization.value}` )

    organizations.value = ret.data.data[0]
    if (organizations.value) {
      oCode.value = organizations.value.code
      oName.value = organizations.value.name
      oType.value = organizations.value.organization_type_id
    }

  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',      
    })
  }
}


watchEffect(() => {
  fetchTypes()
  fetchOrganization()
  fetchOrganizationId()
})

const onSubmit = () => {
  refUpdateForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) updateOrganization()
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle>Update Organization</VCardTitle>
        <VForm
          ref="refUpdateForm"
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
                    Cancel
                  </VBtn>
                  <VBtn
                    v-if="!saved"
                    color="primary"
                    type="submit"
                    :loading="savingProcess"
                  >
                    Update
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
