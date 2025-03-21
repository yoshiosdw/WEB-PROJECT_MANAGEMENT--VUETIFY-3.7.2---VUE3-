<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import Location from '@/pages/lookup/locationDialog.vue'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { ref } from "vue"
import { useRouter } from 'vue-router'

const router = useRouter()
const refForm = ref()
const sinarjoUserData = ref(JSON.parse(localStorage.getItem('sinarjoUserData')))

const selectedFile = ref(null)
const employeeId = ref(null)
const employeeName = ref(null)
const ticketTypeValue = ref([])
const selectedTicketSubCategory = ref('')

const ticketCategoryValue = ref([])
const subCategoryValue = ref([])

const location = ref('')
const phone_extension = ref('')
const ip_number = ref('')
const description = ref('')
const ticketType = ref()
const ticketCategory = ref()
const subCategory = ref()
const attachment = ref()
const attachFile = ref()

// const document_number = ref('')
const loading = ref(false)

const createTicket = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    if(attachFile.value) {
      formData.append('attachment', attachFile.value)
    }

    formData.append('location', location.value)
    formData.append('phone_extension', phone_extension.value)
    formData.append('ip_number', ip_number.value)
    formData.append('description', description.value)
    formData.append('ticket_types_id', ticketType.value.id)
    formData.append('ticket_category_id', ticketCategory.value)
    formData.append('ticket_sub_category_id', subCategory.value)

    const ret = await axiosIns.post(`/tickets`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
        'Content-Type': 'multipart/form-data',
      },
    })

    Swal.fire({
      title: 'Ticket',
      text: 'Create ticket successfully',
      icon: 'success',
    })
    loading.value = false
    location.value = null
    phone_extension.value = null
    ip_number.value = null
    description.value =  null
    ticketType.value = null
    ticketCategory.value = null
    subCategory.value = null
    attachFile.value = null
    attachment.value = ''
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Create data failed',
      icon: 'error',
    })
  }
}

const handleFileChange = event => {
  attachFile.value = event.target.files[0]
}

const fetchEmployeeId = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/people/${sinarjoUserData.value.person.id}` )

    employeeId.value = ret.data.data.id
    employeeName.value = ret.data.data.name
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to get employee',
      icon: 'error',
    })
    loading.value = false
  }
}

const fetchTicketType = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/ticket/types' )

    ticketTypeValue.value = ret.data.data
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to get ticket types',
      icon: 'error',
    })
    loading.value = false
  }
}

const fetchTicketCategory = async() => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/ticket/categories' )

    ticketCategoryValue.value = ret.data.data
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Get data failed.',
      icon: 'error',
    })
  }
}

const fetchSubCategory = async categoryId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/ticket/sub/categories/by/${categoryId}` )

    subCategoryValue.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Get data failed',
      icon: 'error',
    })
  }
}

const fileUpload = event => {
  const file = event.target.files[0]

  attachment.value = file
}

const getValueFromLocationDialog = val => {
  location.value = val.name
}

watchEffect(() => {
  fetchTicketType()
  fetchEmployeeId()
  fetchTicketCategory()
})

// watch(ticketCategory, (newCategoryId) => {
//   fetchSubCategory(newCategoryId);
// });
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard :loading="loading">    
        <VCardTitle>General Affair Ticket System</VCardTitle>    
        <VSpacer />
        <VCardText>
          <VForm
            ref="refForm"
            enctype="multipart/form-data"
            @submit.prevent="createTicket"
          >
            <VRow>
              <VCol cols="6">
                <VRadioGroup
                  v-model="ticketType"
                  inline 
                  :rules="[requiredValidator]"
                >
                  <VRadio 
                    v-for="hal in ticketTypeValue" 
                    :key="hal.id" 
                    :label="hal.name" 
                    :value="hal" 
                  />
                </VRadioGroup>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VTextField
                  id="name"
                  v-model="sinarjoUserData.person.name"
                  readonly
                />
              </VCol>
              <VCol cols="6">
                <div class="d-flex gap-3">
                  <VTextField
                    id="location"
                    v-model="location"
                    :rules="[requiredValidator]"
                    :readonly="true"
                    label="Location"
                  />
                  <Location 
                    @location="getValueFromLocationDialog"
                  />
                </div>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VSelect 
                  v-model="ticketCategory"
                  :items="ticketCategoryValue"
                  item-title="name"
                  item-value="id"
                  label="Category"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  id="phone_extension"
                  v-model="phone_extension"
                  :rules="[requiredValidator]"
                  label="Extension Number"
                />
              </VCol>
              <VCol cols="3">
                <VFileInput 
                  v-model="attachment"
                  label="Attach File"
                  accept=".pdf"
                  clearable
                  @change="handleFileChange"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <label for="description">Deskripsi</label>
                <VTextarea
                  id="description"
                  v-model="description"
                  rows="2"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end"
              >
                <VBtn
                  type="submit"
                  variant="flat"
                  color="#F8AC59"
                  class="mt-5"
                  block
                  style="text-transform: capitalize; color: white;"
                  @click="() => { refForm?.validate(); }"
                >
                  Kirim
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
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
