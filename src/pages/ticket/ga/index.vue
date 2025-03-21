<script setup>
import { formatDateMySql, formatDateTimeMySql } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import Resume from './detail/resume.vue'
import { useTicket } from './useTicketGaStore'
import dayjs from 'dayjs'
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const router = useRouter()
const ticketStore = useTicket()
const tickets = ref()
const exportedData = ref()
const ticketType = ref([])
const department = ref([])
const totalTickets = ref(0)
const lastTickets = ref(0)
const find = ref()
const page = ref(1)
const perPage = ref(10)
const loading = ref(false)
const category = ref()
const selectedTicket = ref([])
const dialogVisible = ref(false)
const targetEnd = ref()
const planstart = ref()
const fromdate = ref()
const todate = ref()
const correctiveAction = ref()

const dialogVisibleRate= ref(false)
const selectedTicketDialog = ref([])
const refForm = ref()

const selectedDepartment = ref()


const openDialog = async id => {
  try {
    const ret = await axiosIns.get(`/tickets/page/assignTo/by/${id}` )

    selectedTicket.value = ret.data.data[0]
    targetEnd.value = formatDateMySql(selectedTicket.value.target_end)
    planstart.value = formatDateMySql(selectedTicket.value.plan_start)

    // dialogTypesTickes.value = selectedTicket.value.ticket_types.name
    dialogVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}

const fetchTicket = async (page, perPage, find, selectedDepartment, status, fromdate, todate) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/tickets/GA', {
      headers: {
        'Authorization': 'Bearer ' +localStorage.getItem('sinarjoAccessToken'),
      },
      params:{
        page: page,
        perPage: perPage,
        find: find,
        name: selectedDepartment,
        status_name: status || null,
        fromdate: fromdate,
        todate: todate,
      },
    })

    loading.value = false
    tickets.value = ret.data.data
    totalTickets.value = ret.data.meta.total
    lastTickets.value = ret.data.meta.last

    exportedData.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: 'ICT',
      text: error,
      icon: 'error',
    })
  }finally{
    loading.value = false
  }
}


const selectedStatus = ref(null)

const handleStatusClicked = status => {
  selectedStatus.value = status
  sessionStorage.setItem('selectedStatus', status)

  fetchTicket(page.value, perPage.value, find.value, selectedDepartment.value, selectedStatus.value, fromdate.value, todate.value)
}

watchEffect(() => {
  if (selectedStatus.value) {
    fetchTicket(page.value, perPage.value, find.value, selectedDepartment.value, selectedStatus.value, fromdate.value, todate.value)
  }
})


const fetchTicketType = async (page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/ticket/types', {
      headers: {
        'Authorization': 'Bearer ' +localStorage.getItem('sinarjoAccessToken'),
      },
      params:{
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    ticketType.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: 'ICT',
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}

const fetchTicketCategory = async (page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/ticket/categories', {
      headers: {
        'Authorization': 'Bearer ' +localStorage.getItem('sinarjoAccessToken'),
      },
      params:{
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    department.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: 'ICT',
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}

const departmentOptions = [
  { text: 'Building', name: 'Building' },
  { text: 'Electrical', name: 'Electrical' },
  { text: 'Operational', name: 'Operational' },
  { text: 'Legal', name: 'Legal' },
]

watchEffect(() => {
  if (!selectedStatus.value) {
    fetchTicket(page.value, perPage.value, find.value, selectedDepartment.value, status, fromdate.value, todate.value)
    fetchTicketType(page.value, perPage.value, null)
    fetchTicketCategory(page.value, perPage.value, null)
  }
})


// watchEffect(() => {
//   fetchTicket(page.value, perPage.value, find.value, selectedType.value, selectedDepartment.value, status)
//   fetchTicketType(page.value, perPage.value, null)
//   fetchTicketCategory(page.value, perPage.value, null)
// })

const submitData = async id => {
  loading.value = true
  try {
    
    const ret = await axiosIns.post(`/tickets/submit/${id}`, null )

    fetchTicket(page.value, perPage.value, find.value, selectedDepartment.value, status)
  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    console.log(error)
    loading.value = false
  }
  finally{ loading.value = false}
}

const btnSubmit = id => {
  Swal.fire({
    title: 'Ticket',
    text: 'Sure Submit data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, Submit it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      submitData(id)
    }
  })
}

const startDate = ref()
const ticketStartValue = ref()
const refStartTicket = ref()
const dialogStartVisible = ref(false)

const endDate = ref()
const ticketEndValue = ref()
const refEndTicket = ref()
const dialogEndVisible = ref(false)


const openDialogStart = async id => {
  try{
    const response = await axiosIns.get(`/tickets/page/assignTo/by/${id}` )

    ticketStartValue.value = response.data.data[0]
    startDate.value = dayjs(new Date()).format('YYYY-MM-DD HH:mm')
    dialogStartVisible.value=true
  }catch(error){
    console.log(error)
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
    fetchTicket(page.value, perPage.value, find.value, selectedDepartment.value, status)
   
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




const openDialogEnd = async id => {
  try{
    const response = await axiosIns.get(`/tickets/page/assignTo/by/${id}` )

    ticketEndValue.value = response.data.data[0]
    endDate.value = dayjs(new Date()).format('YYYY-MM-DD HH:mm')
    dialogEndVisible.value=true
  }catch(error){
    console.log(error)
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
    fetchTicket(page.value, perPage.value, find.value, selectedDepartment.value, status)
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

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/tickets/${id}` )

    fetchTicket(page.value, perPage.value, find.value, selectedDepartment.value, status)

    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'Ticket',
      icon: 'error',
      text: error,
    })
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'Ticket',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

const reloadTicketData = () => {
  fetchTicket(page.value, perPage.value, find.value)
}

const reloadIfUpdated = isUpdated => {
  if (isUpdated) {
    reloadTicketData()
  }
}

const handleConfirmUpdated = isUpdated => {
  reloadIfUpdated(isUpdated)
}

const handleStartUpdated = isUpdated => {
  reloadIfUpdated(isUpdated)
}

const paginationData = computed(() => {
  const firstIndex = totalTickets.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalTickets.value ? totalTickets.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalTickets.value} entries`
})

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

const findText = ref()

const search = () => {
  find.value = findText.value
}

const getAllTickets = async () => {
  return await axiosIns.get('/tickets/GA', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
    },
    params: {
      page: 1, 
      perPage: totalTickets.value, 
      find: find.value,
      status_name: selectedStatus.value,
    },
  })
}

const generateHeaderData = () => {
  return [[
    'Ticket Number',
    'Date',
    'Description',
    'Category',
    'Sub Category',
    'Priority',
    'Person In Charge',
    'Plant Start',
    'Target End',
    'Response Time',
    'Start at',
    'End at',
    'Process Time',
    'Corrective Action',
    'Status',
  ]]
}

const formatTicketData = data => {
  return [
    data.document_number,
    data.document_date.split(' ')[0],
    data.description,
    data.ticket_categories.name,
    data.ticket_sub_categories.name,
    data.priority,
    data.person_in_charge && data.person_in_charge.person ? data.person_in_charge.person.name : '',
    data.plan_start ? formatDateTimeMySql(data.plan_start) : '',
    data.target_end ? formatDateTimeMySql(data.target_end) : '',
    data.response_time ? data.response_time : '',
    data.start_at ? formatDateTimeMySql(data.start_at) : '',
    data.end_at ? formatDateTimeMySql(data.end_at) : '',
    data.process_time ? data.process_time : '',
    data.corrective_action ? data.corrective_action : '',
    data.status_name === 'First_level_approved' ? 'Approved' : data.status_name,
  ]
}

const createWorksheet = (headerData, data) => {
  const worksheetData = [...headerData, ...data]
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  const columnWidth = [
    { wch: 8 },
    { wch: 5 },
    { wch: 15 },
    { wch: 5 },
    { wch: 6 },
    { wch: 7 },
    { wch: 7 },
    { wch: 7 },
    { wch: 7 },
    { wch: 7 },
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 6 },
    { wch: 7 },
  ]

  worksheet['!cols'] = columnWidth

  return worksheet
}

const exportClickHandler = async () => {
  try {
    const allTickets = await getAllTickets()
    const headerData = generateHeaderData()
    const data = allTickets.data.data.map(formatTicketData)

    const workbook = XLSX.utils.book_new()
    const worksheet = createWorksheet(headerData, data)

    XLSX.utils.book_append_sheet(workbook, worksheet, `Resume_Ticket_GA`)
    XLSX.writeFile(workbook, `Resume_Ticket_GA.xlsx`)
  } catch (error) {
    Swal.fire({
      title: 'TICKET',
      text: error.message, // Mengambil pesan kesalahan dari objek error
      icon: 'error',
    })
  }
}

const validateAddNewTicket = () => {
  const hasInvalidTicket = tickets.value.some(ticket => ticket.status === 4 && ticket.score === null)
  if (hasInvalidTicket) {
    Swal.fire({
      title: 'Warning',
      text: 'Please Rate Ticket after Ended, Before Create Ticket',
      icon: 'warning',
    })
    
    return false
  }
  
  return true
}

const handleAddNewClick = () => {
  if (validateAddNewTicket()) {
    router.push({ name: 'ticket-ga-add' })
  }
}

const openDialogRate = async id => {
  try {
    const ret = await axiosIns.get(`/tickets/${id}` )

    selectedTicketDialog.value = ret.data.data[0]

    dialogVisibleRate.value = true
  } catch (error) {
    console.error(error)
  }
}

const closeDialogRate = () => {
  dialogVisibleRate.value = false
}

const submitRating = async () => {
  loading.value = true
  try {
    const id = selectedTicketDialog.value.id
    
    const payload = {
      score: selectedTicketDialog.value.rating,
    }

    const ret = await axiosIns.post(`/tickets/feedback/${id}`, payload, {
      headers: {
        'Authorization': 'Bearer ' +localStorage.getItem('sinarjoAccessToken'),
      },
    })

    closeDialogRate()

    fetchTicket(page.value, perPage.value, find.value, selectedDepartment.value, selectedStatus.value)
    
   
  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}

const getRatingLabel = rating => {
  switch (rating) {
  case 1:
    return { label: 'Sangat Buruk', icon: 'mdi-emoticon-cry-outline' }
  case 2:
    return { label: 'Buruk', icon: 'mdi-emoticon-sad-outline' }
  case 3:
    return { label: 'Baik', icon: 'mdi-emoticon-happy-outline' }
  case 4:
    return { label: 'Sangat Baik', icon: 'mdi-emoticon-wink-outline' }
  case 5:
    return { label: 'Sangat Baik Sekali', icon: 'mdi-emoticon-excited-outline' }
  default:
    return { label: '', icon: '' }
  }
}

const getRatingIcon = rating => {
  switch (rating) {
  case 1:
    return 'mdi-emoticon-cry-outline'
  case 2:
    return 'mdi-emoticon-sad-outline'
  case 3:
    return 'mdi-emoticon-happy-outline'
  case 4:
    return 'mdi-emoticon-wink-outline'
  case 5:
    return 'mdi-emoticon-excited-outline'
  default:
    return ''
  }
}

const truncateText = text => {
  return `${text.substring(0, 6)}...`
}

const resolveAttachVariant = attachment => {
  if (attachment !== null)
    return {
      text: attachment,
      color: 'success',
    }
}

const downloadFile = async filename => {
  loading.value = true
  try{
    const params ={
      filename:filename,
    }

    const response = await axiosIns.get(`/tickets/attachment/file`, {
      params,
      headers:{
        'Authorization': 'Bearer ' + localStorage.getItem("sinarjoAccessToken"),
      },
      responseType: 'blob',
    })

    // Create a blob URL
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const href = URL.createObjectURL(blob)

    window.open(href, '_blank')

  }catch (error){
  // console.error('Error preview :', error)
    Swal.fire({
      title: 'Ticket',
      text: 'File No Found !',
      icon: 'error',
    })
  }finally {
    loading.value = false
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <Resume @status-clicked="handleStatusClicked" />
      <VSpacer class="mt-5" />
      <VCard :loading="loading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10,20,30,50]"
            />
          </div>
          <VTextField 
            v-model="findText"
            label="Search Ticket"
            clearable
            @keydown.enter="search"
          />

          <VBtn
            prepend-icon="tabler:plus"
            @click="handleAddNewClick"
          >
            Add Ticket
          </VBtn>

          <VBtn
            prepend-icon="ri:file-excel-2-line"
            @click="exportClickHandler"
          >
            Export
          </VBtn>
        </VCardText>
        <VCardText class="d-flex gap-4">
          <div
            class="d-flex gap-2"
            style="width: 12rem;"
          >
            <VSelect 
              v-model="selectedDepartment"
              label="Category"
              :items="departmentOptions" 
              item-text="text" 
              item-title="name"
              clearable
              style="height: 40px;"
            />
          </div>
          <div
            class="d-flex gap-2"
            style="width: 12rem; margin-right: 10px"
          >
            <VDateInput
              v-model="fromdate"
              label="From Date"
              class="calender-date-picker"
              density="compact"
              prepend-icon
              clearable
              :config="{dateFormat: 'Y-m-d'}"
            />    
          </div>
          <div
            class="d-flex gap-2"
            style="width: 12rem;"
          >
            <VDateInput
              v-model="todate"
              label="To Date"
              class="calender-date-picker"
              density="compact"
              clearable
              prepend-icon
              :config="{dateFormat:'Y-m-d'}"
            />       
          </div>
        </VCardText>
        <VCardText>
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef;"
            >
              <tr>
                <th scope="col">
                  Action
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Ticket Number
                </th>
                <th scope="col">
                  Requestor
                </th>
                <th scope="col">
                  Description
                </th>
                <th scope="col">
                  Category
                </th>
                <th scope="col">
                  Assign To
                </th>
                <th scope="col">
                  Attachment
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in tickets"
                :key="data.id"
              >
                <td style="width: 5rem;">
                  <div class="d-flex justify-start">
                    <VBtn
                      icon
                      variant="text"
                      color="default"
                      size="x-small"
                      aria-label="View More"
                    >
                      <VIcon
                        :size="22"
                        icon="tabler-dots-vertical"
                      />
                      
                      <VMenu activator="parent">
                        <VList>
                          <VListItem
                            v-if="data.status_name === 'Submitted'"
                            :to="{ name: 'ticket-ga-id-id', params: {id: data.id}}"
                          >
                            <template #prepend>
                              <VIcon
                                variant="none"
                                density="compact"
                                color="info"
                                size="24"
                                icon="mdi-file-document-check-outline"
                                label="view"
                              />
                            </template>
                            <VListItemTitle>Approved</VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="(!data.target_end || !data.plan_start) && (data.status_name == 'First_level_approved' && data.person_in_charge_id)"
                            :to="{name: 'ticket-ga-detail-id', params:{id:data.id}}"
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

                          <VListItem
                            v-if="data.status_name !== 'Rejected' && data.status_name !== 'Ended' && data.status_name !== 'Submitted' && data.status_name !== 'First_level_approved'"
                            :to="{name: 'ticket-ga-detail-id', params:{id:data.id}}"
                          >
                            <template #prepend>
                              <VIcon
                                variant="none"
                                density="compact"
                                class="custom-icon-color"
                                size="24"
                                icon="mdi-eye-outline"
                                label="view"
                              />
                            </template>
                            <VListItemTitle>view</VListItemTitle>
                          </VListItem>
                          
                          <VListItem
                            v-if="data.status_name === 'Rejected'"
                            :to="{ name: 'ticket-ga-id-id', params: {id: data.id}}"
                          >
                            <template #prepend>
                              <VIcon
                                variant="none"
                                density="compact"
                                color="red"
                                size="24"
                                icon="mdi-eye-outline"
                                label="view"
                              />
                            </template>
                            <VListTitle>View</VListTitle>
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
                            <VListTitle>Started</VListTitle>
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
                            <VListTitle>Ended</VListTitle>
                          </VListItem>

                          <VListItem
                            v-if="data.status_name === 'Ended' && data.score === null && data.status === 4"
                            @click="openDialogRate(data.id)"
                          >
                            <template #prepend>
                              <VIcon
                                icon="mdi-star-outline" 
                                size="28px"
                                color="warning"
                              />
                            </template>
                            <VListItemTitle>Rate</VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="data.status_name === 'Ended'"
                            :to="{ name: 'ticket-ga-approve', params: {approve: data.id}}"
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
                        </VList>
                      </VMenu>
                    </VBtn>
                  </div>
                </td>
                <td>
                  <div
                    class="text-no-wrap"
                    style="margin-top: 15px;"
                  >
                    <p :style="{ color: resolveStatusVariant(data.status_name).color }">
                      {{ data.document_number }}
                    </p>  
                    
                    <VChip
                      :color="resolveStatusVariant(data.status_name).color"
                      size="small"
                      variant="none"
                      style="margin-top: -5px;"
                    >
                      <p 
                        style="text-align: left;"
                      >
                        {{ resolveStatusVariant(data.status_name).text }}
                      </p>
                    </VChip>
                  </div>
                </td>              
                <td style="min-width: 250px; word-wrap: break-word;">
                  {{ data.user.person.name }}
                  <br>
                  Ext No:{{ data.extension_number }}
                </td>
                <td style="min-width: 300px; word-wrap: break-word;">
                  {{ data.description }}
                </td>
               
                <td class="text-no-wrap">
                  {{ data.ticket_categories.name }}
                </td>
                <td class="text-no-wrap">
                  {{ data.person_in_charge ? data.person_in_charge.person.name : '-' }}
                </td>
                <td
                  style="word-wrap: break-word;"
                  class="text-wrap"
                >
                  <div
                    class="d-flex flex-column text-wrap"
                  >
                    <VChip 
                      v-if="data.attachment !== null"
                      :color="resolveAttachVariant(data.attachment).color"
                      size="small"
                      @click="downloadFile(data.attachment)"
                    >
                      {{ truncateText(data.attachment) }}
                    </VChip>
                    <template v-else>
                      {{ data.attachment }}
                    </template>
                  </div>
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
              :length="lastTickets"
            />
          </VCardText>
        </VCardText>
        <VDialog
          v-model="dialogVisible"
          width="768"
          transition="dialog-bottom-transition"
          persistent
        >
          <DialogCloseBtn @click="closeDialog" />
          <VCard>
            <VCardTitle>Ticket Detail</VCardTitle>
            <VCardText class="mt-3">
              <VRow>
                <VCol cols="3">
                  <VTextField  
                    v-model="selectedTicket.ticket_types.name"
                    label="Ticket Type"
                    readonly
                    variant="filled"
                  />
                </VCol>
                <VCol cols="4">
                  <VTextField 
                    v-model="selectedTicket.document_number"
                    label="Document Number"
                    readonly
                    variant="filled"
                  />
                </VCol>
                <VCol cols="5">
                  <VTextField 
                    v-model="selectedTicket.user.person.name"
                    label="Requestor"
                    readonly
                    variant="filled"
                  />
                </VCol>
              </VRow>

              <VRow class="mt-3">
                <VCol cols="3">
                  <VTextField
                    v-model="selectedTicket.extension_number"
                    label="Extension Number"
                    readonly
                    variant="filled"
                  />
                </VCol>
                <VCol cols="3">
                  <VTextField
                    v-model="selectedTicket.ip_address"
                    label="IP Address"
                    readonly
                    variant="filled"
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField  
                    v-model="selectedTicket.location.name"
                    label="Location"
                    readonly
                    variant="filled"
                  />
                </VCol>
              </VRow>
              <VRow class="mt-3">
                <VCol cols="6">
                  <VTextField 
                    v-model="selectedTicket.ticket_categories.name"
                    label="Ticket Category"
                    readonly
                    variant="filled"
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField 
                    v-model="selectedTicket.ticket_sub_categories.name"
                    label="Ticket Sub Category"
                    readonly
                    variant="filled"
                  />
                </VCol>
              </VRow>
              <VRow
                v-if="selectedTicket.status_name === 'Submitted'"
                class="mt-3"
              >
                <VCol cols="8">
                  <VTextField 
                    v-model="selectedTicket.attachment"
                    label="Attachment"
                    readonly
                    variant="filled"
                  />
                </VCol>

                <VCol
           
                  cols="4"
                >
                  <VTextField
                    v-model="selectedTicket.submitted_date"
                    label="Submitted Date"
                    variant="filled"
                  />
                </VCol>
              </VRow>

              <VRow
                v-if="selectedTicket.status_name !== 'Submitted'"
                class="mt-3"
              >
                <VCol cols="12">
                  <VTextField 
                    v-model="selectedTicket.attachment"
                    label="Attachment"
                    readonly
                    variant="filled"
                  />
                </VCol>
              </VRow>

              <VRow
                v-if="selectedTicket.status_name !== 'Submitted' && selectedTicket.status_name !== 'Rejected'"
                class="mt-3"
              >
                <VCol cols="2">
                  <VTextField 
                    v-model="selectedTicket.priority"

                    variant="filled"
                    label="Priority"
                    readonly
                  />
                </VCol>
                <VCol cols="3">
                  <VTextField
                    v-model="planstart"
                    label="Plan Start"
                    variant="filled"

                    readonly
                  />
                </VCol>
                <VCol cols="3">
                  <VTextField
                    v-model="targetEnd"
                    label="Target End"
                    readonly
                    variant="filled"
                  />
                </VCol>

                <VCol
                  cols="4"
                  class="d-flex gap-3"
                >
                  <VTextField
                    v-if="selectedTicket.person_in_charge && selectedTicket.person_in_charge.person"
                    v-model="selectedTicket.person_in_charge.person.name"
                    label="Assign To"
                    readonly
                    variant="filled"
                  />
                  <VTextField
                    v-else
                    value="-"
                    label="Assign To"
                    readonly
                    variant="filled"
                  />
                </VCol>
                <!-- {{ personId }} -->
              </VRow>
              <VRow class="mt-3">
                <VCol cols="12">
                  <VTextarea
                    v-model="selectedTicket.description"
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
                    v-model="selectedTicket.business_impact"
                    label="Business Impact"
                    rows="2"
                    variant="filled"
                    readonly
                  />
                </VCol>
                <VCol cols="6">
                  <VTextarea
                    v-model="selectedTicket.business_benefit"
                    label="Business Benefit"
                    readonly
                    rows="2"
                    variant="filled"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VDialog>
      </VCard>

      <VDialog
       
        v-model="dialogVisibleRate"
        width="768"
        transition="dialog-bottom-transition"
        persistent
      >
        <DialogCloseBtn @click="closeDialogRate" />
   
        <VCard>
          <VCardTitle>
            Rate This Ticket
          </VCardTitle>
          <VCardText
            class="mt-3"
          >
            <VForm
              ref="refForm"
              @submit.prevent="submitRating"
            >
              <VRow>
                <VCol cols="3">
                  <VTextField 
                    v-model="selectedTicketDialog.document_number"
                    label="Ticket Number"
                    readonly
                    variant="filled"
                  />
                </VCol>

                <VCol cols="3">
                  <VTextField
                    v-model="selectedTicketDialog.submitted_date"
                    label="Ticket Created"
                    variant="filled"
                  />
                </VCol>

                <VCol cols="3">
                  <VTextField
                    v-model="selectedTicketDialog.start_at"
                    label="Ticket Started"
                    variant="filled"
                    readonly
                  />
                </VCol>

                <VCol cols="3">
                  <VTextField
                    v-model="selectedTicketDialog.end_at"
                    label="Ticket Ended"
                    variant="filled"
                    readonly
                  />
                </VCol>
              </VRow>

              <VRow class="mt-3">
                <VCol
                  cols="12"
                  class="d-flex align-center"
                >
                  <VRating
                    v-model="selectedTicketDialog.rating"
                    max="5"
                    clearable
                    hover
                    clear-icons="mdi-star-outline"
                    size="65px"
                    style="margin-right: 10px;" 
                  />
                  <span
                    v-if="selectedTicketDialog.rating !== null"
                    class="ms-2"
                    style="
                      font-size: 25px;
                      vertical-align: middle;
                      color: orange;
                      background-color: rgba(255, 165, 0, 0.1);
                      padding: 2px 8px; /* Sesuaikan padding untuk latar belakang */
                      border-radius: 8px; /* Sudut lengkung border */
                      display: inline-block; /* Memastikan background hanya mengelilingi teks */
                    "
                  >
                    <VIcon
                      v-if="getRatingIcon(selectedTicketDialog.rating)"
                      :icon="getRatingIcon(selectedTicketDialog.rating)"
                    />
                    {{ getRatingLabel(selectedTicketDialog.rating).label }}
                  </span>
                </VCol>
              </VRow>

              <VRow class="mt-3">
                <VCol
                  class="d-flex justify-end gap-3"
                  cols="12"
                >
                  <VBtn
                    color="error"
                    @click="goBackRate"
                  >
                    Cancel
                  </VBtn>
                  <VBtn
                    type="submit"
                    color="success"
                  >
                    Save
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VDialog>

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
        width="400"
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
              <VRow>
                <VCol cols="12">
                  <VTextarea  
                    v-model="correctiveAction"                     
                    label="Corrective Action"
                    rows="3"
                  />
                </VCol>
                <VCol cols="12">
                  <VDateInput
                    v-model="endDate"
                    label="End Date Ticket"
                    class="calender-date-picker"
                    density="compact"
                    :config="{inline: true, enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true, maxDate: dayjs(new Date()).endOf('day').toDate()}"
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
                  @click="submitEnd"
                >
                  Ended
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VDialog>
    </VCol>
  </VRow>
</template>

<style scoped>
.custom-icon-color {
  color: #050C9C;
}
</style>


<route lang="yaml">
  meta:
    action: Manage
    subject: GA Ticket
    redirectIfLoggedIn: false
  </route>
