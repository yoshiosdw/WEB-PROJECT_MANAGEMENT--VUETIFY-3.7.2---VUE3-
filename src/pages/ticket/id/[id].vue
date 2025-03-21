<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import Person from '@/pages/ticket/person.vue'
import axiosIns from '@/plugins/axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDateTimeMySql, getCurrentDateTimeWIB } from '@/@core/utils/formatters'

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
const plantStart = ref(getCurrentDateTimeWIB())
const endTarget = ref()
const description = ref()
const startAt = ref()
const endAt = ref()
const location = ref()
const attachment = ref()
const person = ref()
const person_in_charge = ref()
const personId = ref()
const status = ref()
const ticketdepartment_id = ref()
const ticketCategoryValue = ref([])
const ticketSubCategoryValue = ref([])
const rejected_date = ref()
const reject_notes = ref()

const ticketCategoryId_Old = ref()
const ticketSubCategoryId_Old = ref()



const business_benefit = ref()
const business_impact = ref()

// const isTicketRejected= ref(false)


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
  if (!requiredValidator(person.value)) {
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

    status.value = ticket.value.status

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

// watchEffect(() => {
//   if (ticketdepartment_id.value) {
//     fetchCategory(ticketdepartment_id.value) // Memanggil fetchCategories ketika ticketdepartment_id berubah
//   }
// })

watch(ticketdepartment_id, departId => {
  showLoading.value=true
  if (departId){
    fetchCategory(departId)
  }
  showLoading.value=false
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
  if (idCategory){
    fetchSubCategory(idCategory)
  }
  showLoading.value=false
})

const openDatePicker = event => {
  event.target.showPicker() 
}

// watchEffect(() => {
//   if (ticket.value && ticket.value.status_name === 'Rejected') {
//     isTicketRejected.value = true
//   } else {
//     isTicketRejected.value = false
//   }
// })

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
      target_end: endTarget.value,

      // ticketCategory: ticketCategory.value.id,
      // ticketSubCategory: ticketSubCategory.value.id,

      ticket_category_id: ticketCategory.value !== ticket.value.ticket_categories.name ? ticketCategory.value : ticketCategoryId_Old.value,
      ticket_sub_category_id: ticketSubCategory.value !== ticket.value.ticket_sub_categories.name ? ticketSubCategory.value : ticketSubCategoryId_Old.value,

    }

    const ret = await axiosIns.post(`/tickets/approved/${id}`, payload )

    router.go(-1)

  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text:  'failed to create Ticket',
      icon: 'error',
    })

  } finally {
    showLoading.value = false
  }
}



const RejectTicket = async (id, rejectNotes) => {
  showLoading.value = true
  try {
    
    const ret = await axiosIns.post(`/tickets/reject/${id}`, 
      { reject_notes: rejectNotes },
    )

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

    // text: 'Reject',
    icon: 'question',
    input:'textarea',

    // inputLabel: 'Notes',
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
  refConfirmTicket.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      approveTicket(ticketId.value)
    }
  })
}
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
              v-if="status == 9"
              class="mt-3"
            >
              <VCol cols="3">
                <VTextField
                  v-model="rejected_date"
                  label="Rejected Date"
                  variant="filled"
                  readonly
                  class="red-text"
                />
              </VCol>
              <VCol cols="9">
                <VTextField
                  v-model="reject_notes"
                  label="Notes"
                  readonly
                  variant="filled"
                  class="red-text"
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
              v-if="status !== 9"
              class="mt-3"
            >
              <VCol cols="2">
                <VSelect 
                  v-model="priority"
                  label="Priority"
                  :items="priorityData"
                  item-title="name"
                  :disabled="status == 9"
                  :rules="[requiredValidator]"
                  item-value="name"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="plantStart"
                  label="Plan Start"
                  type="datetime-local"
                  :rules="[requiredValidator]"
                  density="comfortable"
                  variant="outlined"
                  class="custom-date-field"
                  @click="openDatePicker"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="endTarget"
                  label="Plan End"
                  type="datetime-local"
                  :rules="[requiredValidator]"
                  density="comfortable"
                  variant="outlined"
                  class="custom-date-field"
                  @click="openDatePicker"
                />
              </VCol>

              <VCol
                cols="4"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="person"
                  item-title="name"
                  item-value="id"
                  label="Assign To"
                  readonly
                  :disabled="status == 9"
                  :rules="[requiredValidator]"
                />
                <Person 
                  v-if="status !== 9 "
                  :disabled="status == 9"
                  :ticket="ticketId"
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
                  readonly="isTicketRejected"
                />
              </VCol>
              <VCol cols="6">
                <VTextarea
                  id="business_benefit"
                  v-model="business_benefit"
                  label="Business Benefit"
                  readonly="isTicketRejected"
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
                  :disabled="showLoading"
                >
                  Cancel
                </VBtn>
                <VBtn
                  v-if="status !== 9"
                  type="submit"
                  color="success"
                  :disabled="showLoading"
                  @click="() => { refConfirmTicket?.validate()}"
                >
                  Approve
                </VBtn>

                <VBtn
                  v-if="status !== 9"
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
    </VCol>
  </VRow>
</template>



<route lang="yaml">
  meta:
    action: Manage
    subject: ICT Ticket
    redirectIfLoggedIn: false
  </route>
