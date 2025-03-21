<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import Person from '@/pages/ticket/person.vue'
import axiosIns from '@/plugins/axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()

const refConfirmTicket = ref()
const ticket = ref([])
const route = useRoute()
const ticketId = ref(route.params.id)
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
const plantStart = ref()
const EndTarget = ref()
const description = ref()
const startAt = ref()
const endAt = ref()
const location = ref()
const attachment = ref()
const person = ref()
const person_in_charge = ref()
const personId = ref()
const status = ref()
const business_benefit = ref()
const business_impact = ref()
const rejected_date = ref()
const reject_notes = ref()

const isTicketRejected= ref(false)

const ticketCategoryValue = ref([])
const ticketSubCategoryValue = ref([])

const ticketdepartment_id = ref()
const ticketCategoryId_Old = ref()
const ticketSubCategoryId_Old = ref()

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

const getValueFromPerson = val => {
  person.value = val.person.name
  personId.value = val.id
}

const validateForm = () => {
  if (!requiredValidator(priority.value) || !requiredValidator(person.value)) {
    console.log('Validation failed: Priority or Person is empty')
    
    return false
  }
  
  return true
}

const fetchTicket = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/tickets/${id}` )

    showLoading.value = false
    ticket.value = ret.data.data[0]

    status.value = ticket.value.status_name

    documentNumber.value = ticket.value.document_number
    extension_number.value = ticket.value.extension_number
    location.value = ticket.value.location.name
    ip_address.value = ticket.value.ip_address
    ticketType.value = ticket.value.ticket_types.name
    ticketCategory.value = ticket.value.ticket_categories.name
    ticketSubCategory.value = ticket.value.ticket_sub_categories.name
    description.value = ticket.value.description
    business_benefit.value = ticket.value.business_benefit
    business_impact.value = ticket.value.business_impact
    documentRequest.value = ticket.value.document_request
    attachment.value = ticket.value.attachment !== null ? ticket.value.attachment : '-'
    requestor.value = ticket.value.user.person.name

    ticketdepartment_id.value = ticket.value.ticket_departments.id
    ticketCategoryId_Old.value = ticket.value.ticket_categories.id
    ticketSubCategoryId_Old.value = ticket.value.ticket_sub_categories.id
    rejected_date.value = ticket.value.rejected_date
    reject_notes.value = ticket.value.reject_notes

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
  if (status.value === 'Rejected') {
    isTicketRejected.value = true
  } else {
    isTicketRejected.value = false
  }
})

watchEffect(() => {
  fetchTicket(ticketId.value)
})

const approveTicket = async id => {
  showLoading.value = true
  try {

    const payload = {
      person_in_charge_id: personId.value,
      priority: priority.value,
      plan_start: plantStart.value,
      target_end: EndTarget.value,

      ticket_category_id: ticketCategory.value !== ticket.value.ticket_categories.name ? ticketCategory.value : ticketCategoryId_Old.value,
      ticket_sub_category_id: ticketSubCategory.value !== ticket.value.ticket_sub_categories.name ? ticketSubCategory.value : ticketSubCategoryId_Old.value,
    }

    const ret = await axiosIns.post(`/tickets/approved/${id}`, payload )


    router.go(-1)

  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: 'Make sure priority, plant Start or assign to already filled',
      icon: 'error',
    })
    console.error(error)
  } finally {
    showLoading.value = false
  }
}


const btnApprove = id => {
  Swal.fire({
    title: 'Ticket',
    text: 'Sure Aprrove Ticket?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes',
  }).then(ret => {
    if(ret.isConfirmed) {
      approveTicket(id)
    }
  })
}

const RejectTicket = async (id, notes) => {
  showLoading.value = true
  try {
    
    const ret = await axiosIns.post(`/tickets/reject/${id}`, { reject_notes:notes } )

    Swal.fire({
      title: 'Ticket',
      text: 'Ticket Rejected successfully',
      icon: 'success',
      showConfirmButton: true,
    })

    router.go(-1)

  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    console.log(error)
    showLoading.value = false
  }
  finally{ showLoading.value = false}
}

const btnReject = id => {
  Swal.fire({
    title: 'Reject Ticket',
    icon: 'question',
    input:'textarea',
    inputPlaceholder: 'Notes...',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes',
    inputValidator: value => {
      if (!value){
        return 'need to write something'
      }
    },
  }).then(ret => {
    if(ret.isConfirmed) {
      const rejectNotes = ret.value

      RejectTicket(id, rejectNotes)
    }
  })
}

const validateAndApprove = () => {
  if (validateForm()) {
    btnApprove(ticketId.value)
  }
}

const fetchCategory = async departmentid=>{
  showLoading.value = true
  try{
    const ret = await axiosIns.get(`/ticket/categories/by/${departmentid}` )

    ticketCategoryValue.value = ret.data.data
    showLoading.value = false
  }catch(error){
    Swal.fire({
      title: 'Ticket',
      text: 'Failed to get data for ticket categories',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  if (ticketdepartment_id.value) {
    fetchCategory(ticketdepartment_id.value) // Memanggil fetchCategories ketika ticketdepartment_id berubah
  }
})

const fetchSubCategory = async categoryid => {
  showLoading.value = true
  try{
    const ret = await axiosIns.get(`/ticket/sub/categories/by/${categoryid}`)

    ticketSubCategoryValue.value = ret.data.data
    showLoading.value = false
  }catch(error){
    Swal.fire({
      title: 'Ticket',
      text: 'Failed to get data for ticket sub categories',
      icon: 'error',
    })
  }
}

watch(ticketCategory, idCategory => {
  showLoading.value=true
  fetchSubCategory(idCategory)
  showLoading.value=false
})

// watchEffect(() => {
//   if (!plantStart.value) {
//     plantStart.value = dayjs().format('YYYY-MM-DD HH:mm')
//   }
// })
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardTitle>Form Confirm Ticket</VCardTitle>
        <VCardText class="mt-3">
          <VForm
            ref="refConfirmTicket"
            enctype="multipart/form-data"
            @submit.prevent="validateAndApprove"
          >
            <VRow
              v-if="isTicketRejected"
              class="mt-3"
            >
              <VCol cols="3">
                <VTextField
                  v-model="rejected_date"
                  label="Rejected Date"
                  variant="filled"
                  readonly
                />
              </VCol>
              <VCol cols="9">
                <VTextField
                  v-model="reject_notes"
                  label="Notes"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
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
                <VSelect
                  v-model="ticketCategory"
                  :items="ticketCategoryValue"
                  item-title="name"
                  item-value="id"
                  label="Ticket Category"
                  :menu-props="{ maxHeight: '300px' }"
                />
              </VCol>
              <VCol cols="6">
                <VSelect
                  v-model="ticketSubCategory"
                  :items="ticketSubCategoryValue"
                  item-title="name"
                  item-value="id"
                  label="Ticket Sub Category"
                  :menu-props="{ maxHeight: '300px' }"
                />
              </VCol>
            </VRow>
            <VRow class="mt-3">
              <VCol cols="12">
                <VTextField 
                  v-model="attachment"
                  label="Attachment"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>

            <VRow
              v-if="ticket.status_name === 'Submitted'"
              class="mt-3"
            >
              <VCol cols="2">
                <VSelect 
                  v-model="priority"
                  label="Priority"
                  :items="priorityData"
                  item-title="name"
                  item-value="name"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="2">
                <VDateInput
                  v-model="plantStart"
                  label="Plan Start"
                  density="compact"
                  :config="{ enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true}"
                />
              </VCol>
              <VCol cols="2">
                <VDateInput
                  v-model="EndTarget"
                  label="Target End"
                  density="compact"
                  :config="{ enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true }"
                />
              </VCol>

              <VCol
                cols="6"
                class="d-flex gap-3"
              >
                <VTextField
                  id="person"
                  v-model="person"
                  readonly
                  label="Assign To"
                  :rules="[requiredValidator]"
                />
                <Person 
                  v-if="!isTicketRejected"
                  :disabled="isTicketRejected"
                  :ticket="ticketId"
                  @person="getValueFromPerson"
                />
              </VCol>
              <!-- {{ personId }} -->
            </VRow>

            <VRow
              v-if="ticket.status_name !== 'Submitted'"
              class="mt-3"
            >
              <VCol cols="2">
                <VSelect 
                  v-model="priority"
                  label="Priority"
                  :items="priorityData"
                  item-title="name"
                  readonly
                  item-value="name"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="2">
                <VDateInput
                  v-model="plantStart"
                  label="Plan Start"
                  density="compact"

                  readonly
                />
              </VCol>
              <VCol cols="2">
                <VDateInput
                  v-model="EndTarget"
                  label="Target End"
                  density="compact"

                  readonly
                />
              </VCol>

              <VCol
                cols="6"
                class="d-flex gap-3"
              >
                <VTextField
                  id="person"
                  v-model="person"
                  label="Assign To"
                  readonly
                  :rules="[requiredValidator]"
                />
                <Person 
                  :disabled="isTicketRejected"
                  @person="getValueFromPerson"
                />
              </VCol>
              <!-- {{ personId }} -->
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
                  :readonly="isTicketRejected"
                />
              </VCol>
              <VCol cols="6">
                <VTextarea
                  id="business_benefit"
                  v-model="business_benefit"
                  label="Business Benefit"
                  :readonly="isTicketRejected"
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
                  :to="{name: 'ticket-ga'}"
                  :disabled="showLoading"
                >
                  Cancel
                </VBtn>
                <VBtn
                  v-if="!isTicketRejected"
                  type="submit"
                  color="success"
                  :disabled="showLoading"
                  @click="() => { refConfirmTicket?.validate(); btnApprove(ticketId); }"
                >
                  Approve
                </VBtn>

                <VBtn
                  v-if="!isTicketRejected"
                  color="error"
                  :disabled="showLoading"
                  @click="btnReject(ticketId)"
                >
                  Reject
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
    action: Manage
    subject: GA Ticket
    redirectIfLoggedIn: false
  </route>
