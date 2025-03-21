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
const ticketType = ref(null)
const ticketCategoryId = ref()
const ticketCategoryValue = ref()
const name = ref('')

const updateTicketType = async id => {
  try {
    const ret = await axiosIns.patch(`/ticket/types/${id}`, {
      name: name.value,
      ticket_categories_id : ticketCategoryId.value,
    } )

    router.push({ name: 'ticket-type' })
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to update data',
      icon: 'error',
    })
  }
}

const fetchTicketTypeDetail = async id => {
  try {
    const ret = await axiosIns.get(`/ticket/types/${id}`)
    
    ticketType.value = ret.data.data 
    name.value = ret.data.data.name
    ticketCategoryId.value = ret.data.data.ticket_categories_id
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text : 'Failed to get ticket types',
      icon : 'error',
    })
  }
}

const fetchTicketCategory = async () => {
  try {
    const ret = await axiosIns.get('/ticket/categories' )

    ticketCategoryValue.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to get ticket categories',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchTicketCategory()
  fetchTicketTypeDetail(routeId)
})
</script>

<template>
  <VRow>
    <VCol>
      <VCard>
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="updateTicketType"
          >
            <div>
              <VRow>
                <VCol 
                  cols="12"
                  md="6"
                >
                  <VTextField
                    id="name"
                    v-model="name"
                    :rules="[requiredValidator]"
                    label="Type"
                  />
                </VCol>
                <VCol 
                  cols="12"
                  md="6"
                >
                  <VSelect
                    v-model="ticketCategoryId"
                    label="Category"
                    :items="ticketCategoryValue"
                    item-title="name"
                    item-value="id"
                    single-line
                    :rules="[requiredValidator]"
                    class="mb-6"                    
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
              @click="() => { refForm?.validate(); updateTicketType(routeId); }"
            >
              Save
            </VBtn>
            <VBtn 
              variant="flat"
              color="warning"
              :to="{ name: 'ticket-type' }"
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
