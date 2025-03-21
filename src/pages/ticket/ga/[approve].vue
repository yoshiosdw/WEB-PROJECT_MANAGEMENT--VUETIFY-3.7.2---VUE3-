<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const refConfirmTicket = ref()
const ticket = ref([])
const route = useRoute()
const router = useRouter()
const ticketId = ref(route.params.approve)
const showLoading = ref(false)

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
const started = ref()
const ended = ref()
const description = ref()
const isTicketEnded = ref(false)
const isTicketStarted = ref(false)

const endAt = ref()
const location = ref()
const attachment = ref()
const person = ref()
const approver = ref()
const person_in_charge = ref()

const business_benefit = ref()
const business_impact = ref()

const priorityData = [
  {
    id: 1,
    name: 'Lowest',
  }, {
    id: 2,
    name: 'Low',
  }, {
    id: 3,
    name: 'Medium',
  }, {
    id: 4,
    name: 'High',
  }, {
    id: 5,
    name: 'Highest',
  },
]

const formatDate = date => {
  return new Date(date).toISOString().split('T')[0]
}


const fetchTicket = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/tickets/${id}` )

    showLoading.value = false
    ticket.value = ret.data.data[0]

    documentNumber.value = ticket.value.document_number
    extension_number.value = ticket.value.extension_number
    location.value =ticket.value.location.name
    ip_address.value = ticket.value.ip_address
    ticketType.value = ticket.value.ticket_types.name
    ticketCategory.value = ticket.value.ticket_categories.name
    ticketSubCategory.value = ticket.value.ticket_sub_categories.name
    description.value =ticket.value.description
    started.value = formatDate(ticket.value.start_at)
    ended.value = formatDate(ticket.value.end_at)
    business_benefit.value = ticket.value.business_benefit
    business_impact.value = ticket.value.business_impact
    documentRequest.value = ticket.value.document_request
    attachment.value = ticket.value.attachment !== null ? ticket.value.attachment : '-'
    requestor.value =ticket.value.user ? ticket.value.user.username : ''

    priority.value =ticket.value.priority
    approver.value = ticket.value.approval ? ticket.value.approval.username : ''
    person_in_charge.value = ticket.value.person_in_charge ? ticket.value.person_in_charge.username : ''

    // status.value = ret.data.data.status_name

    isTicketStarted.value =ticket.value.status_name === "Started"

  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    showLoading.value = false
  }
}

watchEffect(() => {
  fetchTicket(ticketId.value)
})

watchEffect(() => {
  if (ticket.value && ticket.value.status_name === 'Ended') {
    isTicketEnded.value = true
  } else {
    isTicketEnded.value = false
  }
})

const startTicket = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.post(`/tickets/start/${id}`, null )

    setTimeout(() => {
      router.go(-1)
    }, 1500)

  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error.message || 'An error occurred',
      icon: 'error',
    })
    console.error(error)
  } finally {
    showLoading.value = false
  }
}


const btnStart= id => {
  Swal.fire({
    title: 'Ticket',
    text: 'Sure Start Task Ticket?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes',
  }).then(ret => {
    if(ret.isConfirmed) {
      startTicket(id)
    }
  })
}

const endTicket = async id => {
  showLoading.value = true
  try {

    const ret = await axiosIns.post(`/tickets/end/${id}`, null )

    setTimeout(() => {
      router.go(-1)
    }, 1500)

  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error.message || 'An error occurred',
      icon: 'error',
    })
    console.error(error)
  } finally {
    showLoading.value = false
  }
}


const btnEnd= id => {
  Swal.fire({
    title: 'Ticket',
    text: 'Sure End Task Ticket?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes',
  }).then(ret => {
    if(ret.isConfirmed) {
      endTicket(id)
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardTitle>Form Detail Ticket</VCardTitle>
        <VCardText class="mt-3">
          <VForm ref="refConfirmTicket">
            <VRow>
              <VCol cols="3">
                <VTextField  
                  v-model="ticketType"
                  label="Ticket Type"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol cols="4">
                <VTextField 
                  v-model="documentNumber"
                  label="Document Number"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol cols="5">
                <VTextField 
                  v-model="requestor"
                  label="Requestor"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="3">
                <VTextField
                  v-model="extension_number"
                  label="Extension Number"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="ip_address"
                  label="IP Address"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol cols="6">
                <VTextField  
                  v-model="location"
                  label="Location"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="6">
                <VTextField 
                  v-model="ticketCategory"
                  label="Ticket Category"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol cols="6">
                <VTextField 
                  v-model="ticketSubCategory"
                  label="Ticket Sub Category"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="6">
                <VTextField 
                  v-model="attachment"
                  label="Attachment"
                  readonly
                  variant="filled"
                />
              </VCol>

              <VCol cols="2">
                <VTextField 
                  v-model="priority"
                  label="Priority"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol cols="2">
                <VTextField 
                  v-model="started"
                  label="Started"
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol cols="2">
                <VTextField 
                  v-model="ended"
                  label="Ended"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="6">
                <VTextField 
                  v-model="approver"
                  label="approver"
                  readonly
                  variant="filled"
                />
              </VCol>

              <VCol
                cols="6"
                class="d-flex gap-3"
              >
                <VTextField
                  id="person"
                  v-model="person_in_charge"
                  label="Assign To"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  label="Description"
                  rows="2"
                  readonly
                  variant="filled"
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
                  readonly
                  variant="filled"
                />
              </VCol>
              <VCol cols="6">
                <VTextarea
                  id="business_benefit"
                  v-model="business_benefit"
                  label="Business Benefit"
                  rows="2"
                  readonly
                  variant="filled"
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
                  :to="{name: 'ticket-ga'}"
                  :disabled="showLoading"
                >
                  Back
                </VBtn>
                <!--
                  <VBtn
                  color="success"
                  :disabled="showLoading || isTicketStarted || isTicketEnded"
                  @click="btnStart(ticketId)"
                  >
                  Start
                  </VBtn>
                -->

                <!--
                  <VBtn
                  color="success"
                  :disabled="showLoading || isTicketEnded"
                  @click="btnEnd(ticketId)"
                  >
                  End
                  </VBtn>
                -->
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
    action: Manage
    subject: GA Ticket
    redirectIfLoggedIn: false
  </route>
