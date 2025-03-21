<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const router = useRouter()
const refForm = ref()
const name = ref('')

const createTicketCategory = async () => {
  try {
    const dataToPost = {
      name: name.value,
    }

    const ret = await axiosIns.post('/ticket/categories', dataToPost )

    router.push({ name: 'ticket-category' })
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to insert data',
      icon: 'error',
    })
  }
}
</script>

<template>
  <VRow>
    <VCol>
      <VCard>
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="createTicketCategory"
          >
            <div>
              <VRow style="height: 52px;">
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
              @click="() => { refForm?.validate(); createTicketCategory(); }"
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
