<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const refForm = ref()
const router = useRouter()
const ticketCategoryId = ref()
const ticketCategoryValue = ref()
const name = ref('')

const createTicketType = async () => {
  try {
    const dataToPost = {
      name: name.value,
      ticket_categories_id: ticketCategoryId.value,
    }

    const ret = await axiosIns.post('/ticket/types', dataToPost )

    router.push({ name: 'ticket-type' })
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to insert data',
      icon: 'error',
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

watchEffect( () => {
  fetchTicketCategory()
})
</script>

<template>
  <VRow>
    <VCol>
      <VCard>
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="createTicketType"
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
                    class="mb-3"                    
                  />
                </VCol>
              </VRow>
            </div>
          </VForm>
          <div class="d-flex justify-end">
            <VBtn
              color="success"
              type="submit"
              variant="flat"
              class="mr-2"
              @click="() => { refForm?.validate(); createTicketType(); }"
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
