<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const routeId = route.params.id

const refForm = ref()
const ticketCategory = ref(null)
const name = ref('')

const updateTicketCategory = async id => {
  try {
    const ret = await axiosIns.patch(`/ticket/categories/${id}`, {
      name: name.value,
    } )

    router.push({ name: 'ticket-category' })
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to update data',
      icon: 'error',
    })
  }
}

const fetchTicketCategoryDetail = async id => {
  try {
    const ret = await axiosIns.get(`/ticket/categories/${id}`)

    ticketCategory.value = ret.data.data 
    name.value = ret.data.data.name
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text : 'Failed to get ticket categories',
      icon : 'error',
    })
  }
}

watchEffect(() => {
  fetchTicketCategoryDetail(routeId)
})
</script>

<template>
  <VRow>
    <VCol>
      <VCard>
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="updateTicketCategory"
          >
            <div>
              <VRow>
                <VCol 
                  cols="12"
                >
                  <VTextField
                    id="name"
                    v-model="name"
                    :rules="[requiredValidator]"
                    label="Name"
                  />
                </VCol>
              </VRow>
            </div>
          </VForm>
          <br>
          <div class="d-flex justify-end">
            <VBtn
              color="success"
              type="submit"
              variant="flat"
              class="mr-2"
              @click="() => { refForm?.validate(); updateTicketCategory(routeId); }"
            >
              Save
            </VBtn>
            <VBtn 
              variant="flat"
              color="warning"
              :to="{ name: 'ticket-category' }"
            >
              Close
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
