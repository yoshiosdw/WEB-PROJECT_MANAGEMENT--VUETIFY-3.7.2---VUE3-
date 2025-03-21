<script setup>
import Location from '@/pages/lookup/locationDialog.vue'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const refConfirmTicket = ref()
const ticket = ref()

const route = useRoute()
const ticketId = ref(route.params.edit)

const loading = ref(false)

const documentNumber = ref()
const documentRequest = ref()
const requestor = ref()
const ticketType = ref()
const ticketCategory = ref()
const ticketSubCategory = ref()
const confirmAt = ref()
const targetMinute = ref(0)
const extension_number = ref()
const ip_address = ref()
const priority = ref()
const description = ref()
const startAt = ref()
const endAt = ref()
const location = ref()

const reAttachment = ref()
const attachment = ref()
const attachFile = ref()

const business_benefit = ref()
const business_impact = ref()

const dataTicketCategory = ref()
const dataTicketSubCategory = ref()
const locationId = ref()

// const priorityData = [
//   {
//     id: 1,
//     name: 'Lowest',
//   }, {
//     id: 2,
//     name: 'Low',
//   }, {
//     id: 3,
//     name: 'Medium',
//   }, {
//     id: 4,
//     name: 'High',
//   }, {
//     id: 5,
//     name: 'Highest',
//   },
// ]

const getValueFromLocationDialog = val => {
  location.value = val.name
  locationId.value = val.id
}

const fetchTicket = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/tickets/${id}` )

    loading.value = false
    ticket.value = ret.data.data
    documentNumber.value = ret.data.data.document_number
    extension_number.value = ret.data.data.extension_number
    location.value = ret.data.data.location ? ret.data.data.location.name : ''
    ip_address.value = ret.data.data.ip_address
    ticketType.value = ret.data.data.ticket_types.name
    ticketCategory.value = ret.data.data.ticket_categories.name
    ticketSubCategory.value = ret.data.data.ticket_sub_categories.name
    description.value = ret.data.data.description
    business_benefit.value = ret.data.data.business_benefit
    business_impact.value = ret.data.data.business_impact
    documentRequest.value = ret.data.data.document_request
    reAttachment.value = ret.data.data.attachment
    requestor.value = ret.data.data.user.username

    await fetchTicketCategory()
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}

const handleFileChange = event => {
  attachment.value = event.target.files[0] 
  attachFile.value = event.target.files[0]
  reAttachment.value = event.target.files[0] ? event.target.files[0].name : null

}


const updateTicket = async id => {
  loading.value = true
  try {
    const allowedMimeTypes = ['application/pdf, application/xls, image/jpeg']

    const formData = new FormData()

    if (location.value !== ticket.value.location.name) {
      formData.append('location_id', locationId.value)
    } else {
      formData.append('location_id', ticket.value.location.id)
    }
    formData.append('extension_number',extension_number.value)
    formData.append('ip_address', ip_address.value)
    formData.append('description', description.value)
    formData.append('business_benefit', business_benefit.value)
    formData.append('business_impact', business_impact.value)
    if (ticketCategory.value !== ticket.value.ticket_categories.name) {
      formData.append('ticket_category_id', ticketCategory.value)
    } else {
      formData.append('ticket_category_id', ticket.value.ticket_categories.id)
    }
    if (ticketSubCategory.value !== ticket.value.ticket_sub_categories.name) {
      formData.append('ticket_sub_category_id', ticketSubCategory.value)
    } else {
      formData.append('ticket_sub_category_id', ticket.value.ticket_sub_categories.id)
    }
    
    
    if (attachment.value) {
      formData.append('attachment', attachFile.value)
    }

    const ret = await axiosIns.post(`tickets/${id}`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem("sinarjoAccessToken"),
        'Content-Type': 'multipart/form-data',
        'Accept': allowedMimeTypes.join(','),
      },
    })

    Swal.fire({
      title: 'Ticket',
      text: 'Create ticket successfully',
      icon: 'success',
      showConfirmButton: false,
    })

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
  } finally { loading.value = false}
}

const fetchTicketCategory = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/ticket/categories/` )

    dataTicketCategory.value = ret.data.data
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Failed to get data for ticket categories.',
      icon: 'error',
    })
  }finally{ loading.value = false }
}


const fetchSubCategory = async categoryId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/ticket/sub/categories/by/${categoryId}` )

    dataTicketSubCategory.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Get data failed',
      icon: 'error',
    })
  }finally{ loading.value = false }
}



const refUpdateTicket = ref()

const onSubmit = () => {
  refUpdateTicket.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateTicket(ticketId.value)
  })
}

watchEffect(() => {
  fetchTicket(ticketId.value)
})

watch(ticketCategory, newCategoryId => {
  loading.value = true
  fetchSubCategory(newCategoryId)
  loading.value = false
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard :loading="loading">
        <VCardTitle>Form Ticket</VCardTitle>
        <VCardText class="mt-3">
          <VForm
            ref="refUpdateTicket"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="3">
                <VTextField  
                  v-model="ticketType"
                  label="Ticket Type"
                  readonly
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="documentNumber"
                  label="Ticket Number"
                  readonly
                />
              </VCol>
              <VCol cols="5">
                <VTextField 
                  v-model="requestor"
                  label="Requestor"
                  readonly
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="3">
                <VTextField
                  v-model="extension_number"
                  label="Extension Number"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="ip_address"
                  label="IP Address"
                />
              </VCol>
              <VCol cols="6 d-flex gap-3">
                <VTextField  
                  v-model="location"
                  label="Location"
                />
                <Location 
                  v-if="!saved"
                  @location="getValueFromLocationDialog"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="6">
                <VSelect 
                  v-model="ticketCategory"
                  label="Ticket Category"
                  :items="dataTicketCategory"
                  item-title="name"
                  item-value="id"
                />
              </VCol>
              <VCol cols="6">
                <VSelect 
                  v-model="ticketSubCategory"
                  label="Ticket Sub Category"
                  :items="dataTicketSubCategory"
                  item-title="name"
                  item-value="id"
                />
              </VCol>
            </VRow>

            <!--

              <VRow>
              <VCol cols="3">
              <VSelect 
              v-model="priority"
              label="Priority"
              :items="priorityData"
              item-title="name"
              item-value="name"
              :rules="[requiredValidator]"
              />
              </VCol>
              <VCol cols="3">
              <VTextField 
              v-model="targetMinute"
              label="Target(Menit)"
              type="number"
              />
              </VCol>
              <VCol cols="3">
              <VDateInput label="Start Date" />
              </VCol>
              <VCol cols="3">
              <VDateInput label="End Date" />
              </VCol>
              </VRow>
            -->
            
            <VRow class="mt-3">
              <VCol cols="6">
                <VTextField 
                  v-model="reAttachment"
                  label="Existing Attched File"
                  readonly
                />
              </VCol>
              <VCol cols="6">
                <VFileInput 
                  v-model="attachment"
                  label="Reupload"
                  clearable
                  accept=".pdf, .xls, .jpg, .jpeg"
                  @change="handleFileChange"
                />
              </VCol>
            </VRow>
            
            <VRow class="mt-3">
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  label="Description"
                  rows="2"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="6">
                <VTextarea
                  id="business_impact"
                  v-model="business_impact"
                  label="Business Impact"
                  rows="2"
                />
              </VCol>
              <VCol cols="6">
                <VTextarea
                  id="business_benefit"
                  v-model="business_benefit"
                  label="Business Benefit"
                  rows="2"
                />
              </VCol>
            </VRow>
           
            <VRow class="mt-3">
              <VCol
                cols="12"
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  color="warning"
                  :to="{name: 'ticket'}"
                  :disabled="loading"
                >
                  Cancel
                </VBtn>
                <VBtn
                  type="submit"
                  color="success"
                  :disabled="loading"
                >
                  Save
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
      <VSpacer style="padding-top: 15px;" />
      <DeviceId v-if="documentRequest" />
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Ticket
    redirectIfLoggedIn: false
  </route>
