<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import { formatDateMySql } from '@/@core/utils/formatters'
import Person from '@/pages/ticket/person.vue'
import axiosIns from '@/plugins/axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VDateInput } from 'vuetify/lib/labs/components.mjs'
import { formatDateTimeMySql, getCurrentDateTimeWIB } from '@/@core/utils/formatters'

const router = useRouter()
const route = useRoute()
const showLoading = ref(false)

const ticketId = ref(route.params.id)
const dataTicket = ref([])
const idTicket = ref()
const ticketType = ref()
const documentNumber = ref()
const requestor = ref()
const extension_number = ref()
const ip_address = ref()
const location = ref()
const ticketCategory = ref()
const ticketSubCategory = ref()
const attachment = ref()
const priority = ref()
const planStart = ref(getCurrentDateTimeWIB())
const endTarget = ref()
const person = ref()
const description = ref()
const personId = ref()
const business_impact = ref()
const business_benefit = ref()
const submitted_at = ref()

const refTicket = ref()
const assign = ref()
const personIdVal = ref()


const fetchTicket = async id => {
  showLoading.value = true
  try{
    const ret = await axiosIns.get(`/tickets/${id}` )

    showLoading.value = false
    dataTicket.value = ret.data.data[0]
    
    ticketType.value     = dataTicket.value.ticket_types.name
  
    documentNumber.value = dataTicket.value.document_number
    requestor.value      = dataTicket.value.user.person.name
    extension_number.value = dataTicket.value.extension_number
    ip_address.value     = dataTicket.value.ip_address
    location.value  = dataTicket.value.location.name
    ticketCategory.value = dataTicket.value.ticket_categories.name
    ticketSubCategory.value = dataTicket.value.ticket_sub_categories.name
    attachment.value = dataTicket.value.attachment
    priority.value = dataTicket.value.priority
    planStart.value = getCurrentDateTimeWIB(dataTicket.value.plan_start)
    endTarget.value = formatDateTimeMySql(dataTicket.value.target_end)
    person.value = dataTicket.value.person_in_charge.person.name ? dataTicket.value.person_in_charge.person.name : '-'
    description.value = dataTicket.value.description
    business_impact.value = dataTicket.value.business_impact
    business_benefit.value = dataTicket.value.business_benefit
    submitted_at.value = formatDateTimeMySql(dataTicket.value.submitted_date)

    personIdVal.value = dataTicket.value.person_in_charge_id
    
  
    
  }catch(error){
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    showLoading.value = false
  }
}

const getValueFromPerson = val=>{
  person.value = val.person.name
  personId.value = val.id
}

watchEffect(() => {
  fetchTicket(ticketId.value)
})

const update = async id => {
  showLoading.value = true
  try{
    let payload = {
      plan_start: formatDateTimeMySql(planStart.value),
      target_end: formatDateTimeMySql(endTarget.value)||null,
    }

    if (personId.value){
      payload.person_in_charge_id = personId.value
    }
    else{
      payload.person_in_charge_id = personIdVal.value
    }

    const ret = await axiosIns.post(`tickets/page/update/assignTo/${id}`, payload, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem("sinarjoAccessToken"),
        'Content-Type': 'multipart/form-data',
      },
    })


    // fetchAssign()
    router.back()

    // showLoading.value = false
  } catch(error){
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
  } finally { showLoading.value = false}
}



const fetchAssign = async () =>{
  showLoading.value = true
  try{
    const ret = await axiosIns.get(`/ticket/page/assignTo` )

    assign.value = ret.data.data
    showLoading.value = false

  } catch(error){
    showLoading.value = false
    console.log(error)
  }
}

const openDatePicker = event => {
  event.target.showPicker() 
}

const goBack = () =>{
  // router.push('/home')
  router.back()
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle>Ticket Detail</VCardTitle>
        <VCardText class="mt-3" />
        <VForm>
          <VRow
            enctype="multipart/form-data"
            class="mx-3"
          >
            <VCol cols="3">
              <VTextField  
                v-model="submitted_at"
                label="Ticket Created"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol cols="3">
              <VTextField  
                v-model="ticketType"
                label="Ticket Type"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="documentNumber"
                label="Document Number"
                readonly
                variant="filled"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="requestor"
                label="Requestor"
                readonly
                variant="filled"
              />
            </VCol>
          </VRow>
          <VRow class="mt-3 mx-3">
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
          <VRow class="mt-3 mx-3">
            <VCol cols="6">
              <VSelect
                v-model="ticketCategory"
                :items="ticketCategoryValue"
                item-title="name"
                item-value="id"
                readonly
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
                readonly
                label="Ticket Sub Category"
                :menu-props="{ maxHeight: '300px' }"
              />
            </VCol>
          </VRow>
          <VRow class="mt-3 mx-3">
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
            class="mt-3 mx-3"
          >
            <VCol cols="2">
              <VSelect 
                v-model="priority"
                label="Priority"
                :items="priorityData"
                item-title="name"
                readonly
                :disabled="status == 9"
                item-value="name"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="planStart"
                label="Plan Start"
                type="datetime-local"
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
                style="height: 40px;"
              />
              <Person 
                style="height: 40px;"
                :ticket="ticketId"
                @person="getValueFromPerson"
              />
            </VCol>
            <!-- {{ personId }} -->
          </VRow>
          <VRow class="mt-0 mx-3">
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
          <VRow class="mt-3 mx-3">
            <VCol cols="6">
              <VTextarea
                id="business_impact"
                v-model="business_impact"
                label="Business Impact"
                rows="2"
                readonly
              />
            </VCol>
            <VCol cols="6">
              <VTextarea
                id="business_benefit"
                v-model="business_benefit"
                label="Business Benefit"
                readonly
                rows="2"
              />
            </VCol>
          </VRow>
          <VRow class="mt-3 mx-3 mb-4">
            <VCol
              cols="12"
              class="d-flex justify-end gap-3"
            >
              <VBtn
                color="warning"
                :disabled="showLoading"
                @click="goBack"
              >
                Cancel
              </VBtn>
              <VBtn
                v-if="status !== 9"
                type="submit"
                color="success"
                :disabled="showLoading"
                @click="update(ticketId)"
              >
                Set
              </VBtn>

              <!--
                <VBtn
                v-if="status !== 9"
                color="error"
                :disabled="showLoading"
                @click="btnReject(ticketId)"
                >
                Reject
                </VBtn> 
              -->
            </VCol>
          </VRow>
        </VForm>
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
