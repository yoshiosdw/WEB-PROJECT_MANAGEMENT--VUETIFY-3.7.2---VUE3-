<script setup>
import { formatDateTimeMySql } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import ability from '@/plugins/casl/ability'


const props = defineProps({
  update: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(['update'])
const userId = ref(JSON.parse(localStorage.getItem('sinarjoUserData')).id)
const storedData = ref(JSON.parse(localStorage.getItem('sinarjoUserData')).roles)
const sinarjoUserData = ref(storedData.value ? storedData : [])
const tickets = ref()
const page = ref(1)
const perPage = ref(10)
const totalTicket = ref(0)
const last = ref(0)
const isLoading = ref(false)
const selectedStatus = ref()

const assign = ref(false)
const selectedTicket = ref([])
const dialogVisible = ref(false)
const targetEnd = ref()
const planStart = ref()

const dialogStartVisible = ref(false)
const startDate = ref(formatDateTimeMySql(new Date()))
const ticketStartValue = ref()
const refStartTicket = ref()

const dialogEndVisible = ref(false)
const endDate = ref(formatDateTimeMySql(new Date()))
const ticketEndValue = ref()
const refEndTicket = ref()
const correctiveAction = ref()

const person = ref()
const personId = ref()

const ticketId = ref()
const personIdVal = ref()
const roles = ref()

const getValueFromPerson = val => {
  person.value = val.person.name
  personId.value = val.id
}

const roleNames = computed(() => {
  return sinarjoUserData.value.map(role => role.name)
})


const openDialog = async id => {
  try {
    const ret = await axiosIns.get(`/tickets/page/assignTo/by/${id}` )

    selectedTicket.value = ret.data.data[0]
    ticketId.value = selectedTicket.value.id
    targetEnd.value = formatDateTimeMySql(selectedTicket.value.target_end)
    planStart.value = formatDateTimeMySql(selectedTicket.value.plan_start)
    person.value = selectedTicket.value.person_in_charge.person.name ? selectedTicket.value.person_in_charge.person.name : '-'
    personIdVal.value = selectedTicket.value.person_in_charge_id

    dialogVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

const updateTicket = async id => {
  isLoading.value = true
  try {

    let payload = {
      plan_start: planStart.value||null,
      target_end: targetEnd.value||null,
    }
    
    if (personId.value){
      payload.person_in_charge_id = personId.value
    }
    else{
      payload.person_in_charge_id = personIdVal.value
    }
    
    const ret = await axiosIns.post(`/tickets/page/update/assignTo/${id}`, payload )
    
    closeDialog()
    fetchAssign()
    isLoading.value = false
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
  } finally { isLoading.value = false}
}


const closeDialog = () => {
  dialogVisible.value = false
}

const fetchAssign = async (page, perPage, find, status) => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/tickets/page/assignTo`, {
     
      params:{
        page: page,
        perPage: perPage,
        find: find,
        status: selectedStatus.value,
      },
    })

    assign.value = ret.data.data
    totalTicket.value = ret.data.meta.total
    last.value = ret.data.meta.last
 
    isLoading.value = false
  } catch(error) {
    isLoading.value = false
    console.log(error)
  }
}

const resolveStatusVariant = status_name => {
  if (status_name === 'Created') 
    return {
      text: 'Created',
      color: 'secondary',
    }
  else if (status_name === 'Submitted')
    return {
      text: 'Submitted',
      color: 'info',
    }
  else if (status_name === 'Confirm')
    return {
      text: 'Confirm',
      color: 'warning',
    }
  else if (status_name === 'Started')
    return {
      text: 'Started',
      color: 'warning',
    }
  else if (status_name === 'Ended')
    return {
      text: 'Ended',
      color: 'error',
    }
  else if (status_name === 'First_level_approved')
    return {
      text: 'Approved',
      color: 'success',
    }
  else if (status_name === 'Rejected')
    return {
      text: 'Rejected',
      color: 'error',
    }
  else 
    return {
      text: 'Closed',
      color: 'error',
    }
}

watchEffect(() => {
  fetchAssign(page.value, perPage.value, find.value)
})

watch(() => props.update, newVal => {
  if (newVal) {
    isLoading.value = true
    fetchAssign(page.value, perPage.value, find.value)


  }
})


const openDialogStart = async id =>{
  try {
    const response = await axiosIns.get(`/tickets/page/assignTo/by/${id}` )

    ticketStartValue.value = response.data.data[0]
    startDate.value = dayjs(new Date()).format('YYYY-MM-DD HH:mm')
    dialogStartVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

const startTicket = async id => {
  // loading.value = true
  try {
    const payloads = {
      start_at:startDate.value,
    }

    const ret = await axiosIns.post(`/tickets/start/${id}`, payloads )

    dialogStartVisible.value = false
    fetchAssign(page.value, perPage.value, find.value)

    sendValueToParent('started')
   
  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    console.error(error)
  } 

  // finally {
  //   loading.value = false
  // }
}

const submitStart = () =>{
  startTicket(ticketStartValue.value.id)
}

// const btnStart= id => {
//   Swal.fire({
//     title: 'Ticket',
//     text: 'Sure Start Task Ticket?',
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonColor: 'warning',
//     cancelButtonColor: 'primary',
//     confirmButtonText: 'Yes',
//   }).then(ret => {
//     if(ret.isConfirmed) {
//       startTicket(id)
//     }
//   })
// }



const openDialogEnd = async id =>{
  try{
    const response = await axiosIns.get(`/tickets/page/assignTo/by/${id}`)

    ticketEndValue.value = response.data.data[0]

    // endDate.value = new Date()
    endDate.value = dayjs(new Date()).format('YYYY-MM-DD HH:mm')
    dialogEndVisible.value = true
  }catch(error){
    console.error(error)
  }
}

const endTicket = async id => {
  // loading.value = true
  try {
    const payload_end = {
      end_at:endDate.value,
      corrective_action: correctiveAction.value,
    }

    const ret = await axiosIns.post(`/tickets/end/${id}`, payload_end )

    dialogEndVisible.value = false
    fetchAssign(page.value, perPage.value, find.value)

    sendValueToParent('ended')
  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    console.error(error)
  } 

  // finally {
  //   loading.value = false
  // }
}

const submitEnd = () =>{
  endTicket(ticketEndValue.value.id)
}


// const btnEnd= id => {
//   Swal.fire({
//     title: 'Ticket',
//     text: 'Sure End Task Ticket?',
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonColor: 'warning',
//     cancelButtonColor: 'primary',
//     confirmButtonText: 'Yes',
//   }).then(ret => {
//     if(ret.isConfirmed) {
//       endTicket(id)
//     }
//   })
// }

const sendValueToParent = val => {
  emits('update', val)
}

const paginationData = computed(() => {
  const firstIndex = totalTicket.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalTicket.value ? totalTicket.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalTicket.value} entries`
})

const statusOptions = [
  { text:'Approved', value:5 },
  { text: 'Started', value:3 },
  { text: 'Ended', value:4 },
]
</script>

<template>
  <!-- <VRow v-if="assign.length > 0"> -->
  <VRow v-if="ability.can('Manage','ICT Ticket') || ability.can('Manage','GA Ticket')">
    <VCol cols="12">
      <VCard :loading="isLoading">
        <VCardText class="d-flex gap-4">
          <VRow>
            <VSpacer class="mt-3" />
            <VCol cols="6">
              <VCardTitle>Assign To Me</VCardTitle> 
            </VCol>
            <VCol cols="6">
              <div
                class="d-flex justify-end"
                style="max-width: 200px;margin-left: auto;"
              >
                <VSelect
                  v-model="selectedStatus"
                  label="Status"
                  :items="statusOptions"
                  item-title="text"
                  item-value="value"
                  clearable
                />
              </div>
            </VCol>
          </VRow>
        </VCardText>
        
          
        <VTable>
          <thead
            class="text-uppercase"
            style="background-color: #efefef;"
          >
            <tr>
              <th>
                Action
              </th>
              <th>
                Status
              </th>
              <th
                class="text-no-wrap"
              >
                Ticket Number
              </th>
              
              <th>
                Requestor
              </th>
              <th>
                Extention
              </th>
              <th>
                Description
              </th>
              <th scope="col">
                Submited Date
              </th>
              <th scope="col">
                Approved Date
              </th>

              <th scope="col">
                Plan Start
              </th>
              <th scope="col">
                Plan End
              </th>

              <th scope="col">
                Actual Start
              </th>
              <th scope="col">
                Actual End
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in assign"
              :key="data.id"
            >
              <td style="width: 8rem;">
                <div class="d-flex justify-start">
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="x-small"
                    title="View More"
                  >
                    <VIcon
                      :size="22"
                      icon="tabler-dots-vertical"
                    />
                      
                    <VMenu activator="parent">
                      <VList>
                        <VListItem
                          v-if="data.status_name === 'Created'"
                          @click="btnSubmit(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="warning"
                              size="24"
                              class="me-3"
                              icon="tabler-check"
                              label="Submit"
                            />
                          </template>
                          <VListItemTitle>Submit</VListItemTitle>
                        </VListItem>
                        <VListItem
                          v-if="data.status_name === 'Created'"
                          :to="{ name: 'ticket-edit', params: {edit: data.id}}"
                        >
                          <template #prepend>
                            <VIcon
                              color="warning"
                              size="24"
                              class="me-3"
                              icon="tabler-edit"
                              label="Edit"
                            />
                          </template>
                          <VListItemTitle>Edit</VListItemTitle>
                        </VListItem>

                        <VListItem
                          v-if="data.status_name === 'Created'"
                          @click="btnDeleteClickHandler(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="error"
                              size="24"
                              class="me-3"
                              icon="tabler-trash"
                              label="Delete"
                            />
                          </template>
                          <VListItemTitle>Delete</VListItemTitle>
                        </VListItem>

                        <VListItem
                          v-if="(!data.target_end || !data.plan_start) && (data.status_name == 'First_level_approved' && data.person_in_charge_id) && ability.can('Manage','ICT Ticket')"
                          :to="{name: 'ticket-assignto-id', params:{id:data.id}}"
                        >
                          <template #prepend>
                            <VIcon
                              variant="none"
                              density="compact"
                              class="custom-icon-color"
                              size="24"
                              icon="mdi-calendar-clock-outline"
                            />
                          </template>
                          <VListItemTitle>Plan/Target Date</VListItemTitle>
                        </VListItem>
                        
                        <!--
                          <VListItem
                          @click="openDialog(data.id)"
                          >
                          <template #prepend>
                          <VIcon
                          variant="none"
                          density="compact"
                          class="custom-icon-color"
                          size="24"
                          icon="mdi-eye-outline"
                          />
                          </template>
                          <VListItemTitle>View</VListItemTitle>
                          </VListItem> 
                        -->
                        <VListItem
                          v-if="ability.can('Manage', 'ICT Ticket')"
                          :to="{name: 'ticket-detail-id', params:{id:data.id}}"
                        >
                          <template #prepend>
                            <VIcon
                              variant="none"
                              density="compact"
                              class="custom-icon-color"
                              size="24"
                              icon="mdi-eye-outline"
                            />
                          </template>
                          <VListItemTitle>View</VListItemTitle>
                        </VListItem>
                        <VListItem
                          v-if="(!data.target_end || !data.plan_start) && (data.status_name == 'First_level_approved' && data.person_in_charge_id) && ability.can('Manage','GA Ticket')" 
                          :to="{name: 'ticket-ga-detail-id', params:{id:data.id}}"
                        >
                          <template #prepend>
                            <VIcon
                              variant="none"
                              density="compact"
                              class="custom-icon-color"
                              size="24"
                              icon="mdi-eye-outline"
                            />
                          </template>
                          <VListItemTitle>Plan/Target Date</VListItemTitle>
                        </VListItem>
                        <VListItem
                          v-if="ability.can('Manage','GA Ticket')"
                          :to="{name: 'ticket-ga-detail-id', params:{id:data.id}}"
                        >
                          <template #prepend>
                            <VIcon
                              variant="none"
                              density="compact"
                              class="custom-icon-color"
                              size="24"
                              icon="mdi-eye-outline"
                            />
                          </template>
                          <VListItemTitle>View</VListItemTitle>
                        </VListItem>      
                        
                        <VListItem
                          v-if="data.status_name === 'First_level_approved' && (data.plan_start && data.target_end)"
                          @click="openDialogStart(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              variant="none"
                              density="compact"
                              color="warning"
                              size="24"
                              icon="mdi-play-speed"
                            />
                          </template> 
                          <VListItemTitle>Started</VListItemTitle>
                        </VListItem>
                        <VListItem
                          v-if="data.status_name === 'Started'"
                          @click="openDialogEnd(data.id)"
                        >
                          <template #prepend> 
                            <VIcon
                              variant="none"
                              density="compact"
                              color="error"
                              size="24"
                              icon=" mdi-stop-circle-outline"
                            />
                          </template>    
                          <VListItemTitle>Ended</VListItemTitle>
                        </VListItem>
                      </VList>
                    </VMenu>
                  </VBtn>
                </div>
              </td>
              <td>
                <VChip
                  :color="resolveStatusVariant(data.status_name).color"
                  size="small"
                >
                  {{ resolveStatusVariant(data.status_name).text }}
                </VChip>
              </td>
              <td>
                <div
                  class="text-no-wrap"
                  style="margin-top: 15px;"
                >
                  <p :style="{ color: resolveStatusVariant(data.status_name).color }">
                    {{ data.document_number }}
                  </p>  
                </div>
              </td>

              
              <td style="min-width: 250px; word-wrap: break-word;">
                {{ data.user.person.name }}
              </td>
              <td>{{ data.extension_number }}</td>
              <td style="min-width: 250px; word-wrap: break-word;">
                {{ data.description }}
              </td>
              <td style="min-width: 150px;">
                {{ new Date(data.submitted_date).toISOString().split('T')[0].replace(/-/g, '/') }}
              </td> 
              <td style="min-width: 150px;">
                {{ data.approved_date ? new Date(data.approved_date).toISOString().split('T')[0].replace(/-/g, '/') : '' }}
              </td> 

              <td style="min-width: 230px;">
                {{ data.plan_start ? new Date(data.plan_start).toLocaleString('id-ID', { 
                  timeZone: 'Asia/Jakarta', 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                }).replace(',', '').replace(/\//g, '-') : '' }}
              </td>

              <td style="min-width: 230px;">
                {{ data.target_end ? new Date(data.target_end).toLocaleString('id-ID', { 
                  timeZone: 'Asia/Jakarta', 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                }).replace(',', '').replace(/\//g, '-') : '' }}
              </td>

              <td style="min-width: 230px;">
                {{ data.start_at ? new Date(data.start_at).toLocaleString('id-ID', { 
                  timeZone: 'Asia/Jakarta', 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                }).replace(',', '').replace(/\//g, '-') : '' }}
              </td>

              <td style="min-width: 230px;">
                {{ data.end_at ? new Date(data.end_at).toLocaleString('id-ID', { 
                  timeZone: 'Asia/Jakarta', 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                }).replace(',', '').replace(/\//g, '-') : '' }}
              </td>
            </tr>
          </tbody>
        </VTable>        
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">
            {{ paginationData }}
          </span>

          <VPagination
            v-model="page"
            size="small"
            :total-visible="5"
            :length="last"
          />
        </VCardText>

        
        <!-- DIALOG START TICKET -->
        <VDialog
          v-model="dialogStartVisible"
          width="400"
          transition="dialog-bottom-transition"
        >
          <VCard>
            <VCardTitle
              class="text-center font-weight-bold custom-title font-weight"
              style="font-size: 20px;"
            >
              START TICKET
            </VCardTitle>
            <VCardTitle class="text-center custom-title">
              Please enter the start date
            </VCardTitle>
            <VCardText>
              <VForm>
                <VRow>
                  <VCol cols="12">
                    <VDateInput
                      v-model="startDate"
                      label="Start Date Ticket"
                      class="calender-date-picker"
                      density="compact"
                      :config="{inline: true, enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true, maxDate: dayjs().toDate()}"
                    />
                  </VCol>
                </VRow>
              </VForm>    
              <VRow class="mt-3">
                <VCol
                  cols="12"
                  class="d-flex justify-end gap-3"
                >
                  <VBtn
                    color="warning"
                    @click="submitStart"
                  >
                    Start
                  </VBtn>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VDialog>

        <!-- DIALOG END TICKET -->
        <VDialog
          v-model="dialogEndVisible"
          width="600"
          transition="dialog-bottom-transition"
        >
          <VCard>
            <VCardTitle
              class="text-center font-weight-bold custom-title font-weight"
              style="font-size: 20px;"
            >
              END TICKET
            </VCardTitle>
            <VCardText>
              <VForm>
                <VCol cols="12">
                  <VTextarea  
                    v-model="correctiveAction"                      
                    label="Corrective Action"
                    rows="3"
                  />
                </VCol>
                <VCol
                  mt="4"
                  cols="12"
                >
                  <VDateInput
                    v-model="endDate"
                    label="End Date Ticket"
                    class="calender-date-picker"
                    density="compact"
                    :config="{inline: true, enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true, maxDate: dayjs(new Date()).endOf('day').toDate()}"
                  />
                </VCol>
                <!-- </VRow> -->
              </VForm>    
              <VRow class="mt-3">
                <VCol
                  cols="12"
                  class="d-flex justify-end gap-3"
                >
                  <VBtn
                    color="error"
                    @click="submitEnd"
                  >
                    Ended
                  </VBtn>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VDialog>
      </VCard>
    </VCol>
  </VRow>
</template>
