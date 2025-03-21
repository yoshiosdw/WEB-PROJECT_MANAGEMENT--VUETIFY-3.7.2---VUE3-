<script setup>
import { formatDateMySql, formatDateTimeMySql } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePDF } from "vue3-pdfmake"
import * as XLSX from 'xlsx'
import Resume from './detail/resume.vue'
import { useTicket } from './useTicketStore'
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const router = useRouter()
const ticketStore = useTicket()
const tickets = ref()
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
const dialogTypesTickes = ref()
const targetEnd = ref()
const planstart = ref()
const correctiveAction = ref()
const fromdate = ref()
const todate = ref()
const reject_notes= ref()
const rejected_date = ref()

const startDate = ref(formatDateTimeMySql(new Date()))
const ticketStartValue = ref()
const refStartTicket = ref()
const dialogStartVisible = ref(false)
const endDate = ref(formatDateTimeMySql(new Date()))
const ticketEndValue = ref()
const refEndTicket = ref()
const dialogEndVisible = ref(false)

const score = ref()
const dialogVisibleRate= ref(false)
const selectedTicketDialog = ref([])
const refForm = ref()

const selectedType = ref() 
const selectedDepartment = ref()
const documentNumber = ref('')

const ticketsData = ref([])

const highlightedDocumentNumber = ref([])



const fetchTicket = async (page, perPage, find, selectedType, selectedDepartment, status, fromdate,todate) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/tickets', {
      headers: {
        'Authorization': 'Bearer ' +localStorage.getItem('sinarjoAccessToken'),
      },
      params:{
        page: page,
        perPage: perPage,
        find: find,
        type: selectedType,
        department_in_charge: selectedDepartment,
        status_name: status || null,
        fromdate: fromdate ? new Date(fromdate).toISOString().split("T")[0] : null ,
        todate: todate ? new Date(todate).toISOString().split("T")[0] : null,
      },
    })

    loading.value = false
    tickets.value = ret.data.data
    totalTickets.value = ret.data.meta.total
    lastTickets.value = ret.data.meta.last
    
    // if (ret.data && ret.data.data && ret.data.data.length > 0) {
    //   const attachmentUrl = ret.data.data[0].attachment // Adjust this based on your API response structure
    //   const blob = await pdfCreate.createPdf({ content: [] }).getBlob()

    //   pdfUrl.value = URL.createObjectURL(blob)
    // } else {
    //   Swal.fire({
    //     title: 'Ticket',
    //     text: 'Attachment not found or empty data',
    //     icon: 'error',
    //   })
    // }
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

const pdfCreate = usePDF({
  autoInstallVFS: true,
})

const pdfUrl = ref('')

const openAttachment = async attachmentUrl => {
  window.open(attachmentUrl, '_blank')
}

const selectedStatus = ref(null)

const handleStatusClicked = status => {
  // selectedStatus.value = status

  // Jika status yang diklik sama dengan yang sudah dipilih, reset ke null
  selectedStatus.value = selectedStatus.value === status ? null : status
  sessionStorage.setItem('selectedStatus', status)
  if(selectedStatus.value){
    // selectedType.value = '' || null
    selectedType.value = selectedType.value || null
  }
  else{
    selectedType.value = null
  }
  fetchTicket(page.value, perPage.value, find.value, selectedType.value,  selectedDepartment.value, selectedStatus.value, fromdate.value, todate.value)
}

watchEffect(() => {
  if (selectedStatus.value) {
    fetchTicket(page.value, perPage.value, find.value, selectedType.value, selectedDepartment.value, selectedStatus.value, fromdate.value, todate.value)
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
  { text: 'Networking', department_in_charge: 'Networking' },
  { text: 'Operational', department_in_charge: 'Operational' },
  { text: 'Software', department_in_charge: 'Software' },
  { text: 'Analyst', department_in_charge: 'Analyst' },
]

watchEffect(() => {
  if (!selectedStatus.value) {
    fetchTicket(page.value, perPage.value, find.value, selectedType.value, selectedDepartment.value, status, fromdate.value, todate.value)
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

    fetchTicket(page.value, perPage.value, find.value, selectedType.value, selectedDepartment.value, status, fromdate.value, todate.value)
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
    fetchTicket(page.value, perPage.value, find.value, selectedType.value, selectedDepartment.value, status, fromdate.value, todate.value)
   
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
  const payload_end = {
    end_at:endDate.value,
    corrective_action: correctiveAction.value,
  }

  try {
    const response = await axiosIns.post(`/tickets/end/${id}`, payload_end )

    ticketEndValue.value = response.data.data[0]
    dialogEndVisible.value = false
    fetchTicket(page.value, perPage.value, find.value, selectedType.value, selectedDepartment.value, status, fromdate.value, todate.value)
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

const submitEnd = () => {
  endTicket(ticketEndValue.value.id)
}



const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/tickets/${id}` )

    fetchTicket(page.value, perPage.value, find.value, selectedType.value, selectedDepartment.value, status, fromdate.value, todate.value)

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
  fetchTicket(page.value, perPage.value, find.value, fromdate.value, todate.value)
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
      color: 'gray',
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


const refresh_page = () =>{
  window.location.reload()
  findText.value=''
}

const findText = ref()

const search = () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}


const fetchDataFromAPI = async () => {
  const selectedTicketType = selectedType.value

  try {
    const allTickets = await axiosIns.get('/tickets', {
     
      params: {
        page: 1, 
        perPage: totalTickets.value, 
        find: find.value,
        type: selectedTicketType,
        status_name: selectedStatus.value,
        fromdate:fromdate.value,
        todate:todate.value,
      },
    })

    return allTickets.data.data
  } catch (error) {
    throw new Error('Failed to fetch data from API')
  }
}

const formatTicketDataForExcel = ticketData => {
  return ticketData.map(data => {
    return [
      data.document_number,
      data.document_date.split(' ')[0],
      data.user? data.user.person.name : '',
      data.user?.person?.employee?.organization?.ancestors?.[0]?.name??'',
      data.user?.person?.employee?.organization?data.user.person.employee.organization.name:'',
      data.ticket_types.name,
      data.ticket_categories.name,
      data.ticket_sub_categories.name,
      data.description,

      // data.plan_start ? formatDateTimeMysql(data.plan_start.split(' ')[0]) : '',
      // data.target_end ? formatDateTimeMysql(data.target_end.split(' ')[0]) : '',
      data.plan_start ? formatDateTimeMySql(data.plan_start) : '',
      data.target_end ? formatDateTimeMySql(data.target_end) : '',
      data.response_time ? data.response_time : '',
      data.ticket_categories.department_in_charge,

      // data.user.person.employee.organization.name,
      // data.user?.person?.employee?.organization?.ancestors?.[0]?.name ?? '-',


      // data.priority,
      data.person_in_charge && data.person_in_charge.person ? data.person_in_charge.person.name : '',
      data.start_at ? formatDateTimeMySql(data.start_at) : '',
      data.end_at ? formatDateTimeMySql(data.end_at) : '',
      data.process_time ? data.process_time : '',
      data.target_in_hours ? data.target_in_hours : '',
      data.keterangan === 'Kurang dari target' ? '1' : data.keterangan === 'Melebihi target' ? '' : '0',
      data.keterangan? data.keterangan : '',
      data.corrective_action ? data.corrective_action : '',
      data.status_name === 'First_level_approved' ? 'Approved' : data.status_name,
      data.rejected_date? data.rejected_date:'-',
      data.reject_notes ? data.reject_notes : '-',
      data.score,
      data.lag_time,
    ]
  })
}

const exportClickHandler = async () => {
  try {
    const ticketData = await fetchDataFromAPI()
    const workbook = XLSX.utils.book_new()

    // const headerData = [
    //   ['Ticket Number', 'Date', 'Type', 'Category', 'Sub Category', 'Description', 'Plant Start', 'Target End', 'Response_Time', 'Priority', 'deparment_in_charge', 'person_in_charge', 'Start At', 'End at', 'process_time', 'Status', 'Feedback/Kepuasan User'],
    // ]
    const headerData = [
      ['TICKET NUMBER',
        'DATE',
        'REQUESTOR',
        'BISNIS UNIT',
        'DIVISI',
        'TYPE',
        'CATEGORY', 
        'SUB CATEGORY',
        'DESCRIPTION',
        'PLAN START',
        'TARGET END',
        'RESPONSE TIME (minute)',
        'DEPARTMENT IN CHARGE',
        'PERSON IN CHARGE',
        'START DATE',
        'END DATE',
        'PROCESS TIME (Minute)',
        'TARGET',
        '% TARGET',
        'KETERANGAN',
        'CORRECTIVE ACTION',
        'STATUS',
        'REJECT DATE',
        'NOTES',
        'FEEDBACK',
        'LAG TIME (minute)'],
    ]

    
    const data = formatTicketDataForExcel(ticketData)
    const worksheetData = [...headerData, ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 8 }, // lebar kolom ticket number 
      { wch: 5 }, // lebar kolom date
      { wch: 10 }, // lebar kolom requestor
      { wch: 10 }, // lebar kolom bisnis unit
      { wch: 10 }, // lebar kolom divisi
      { wch: 5 }, // lebar kolom type
      { wch: 6 }, // lebar kolom category
      { wch: 7 }, // lebar kolom sub category
      { wch: 20 },// lebar kolom description 
      { wch: 16 },// lebar kolom plan start
      { wch: 16 },// lebar kolom target end 
      { wch: 16 },// lebar kolom response time
      { wch: 7 },// department in charge
      // { wch: 7 },
      // { wch: 7 },// person in charge
      // { wch: 7 },// person in charge
      { wch: 7 },// person in charge
      { wch: 16 },// start date
      { wch: 16 },// end date
      { wch: 16 },// proses time 
      { wch: 16 },// target 
      { wch: 16 },// % target 
      { wch: 16 },// keterangan
      { wch: 5 },// Corrective action
      { wch: 5 },// status
      { ech: 5 },// notes
      { wch: 8 },// feedback
      { wch: 16 },// lag time
    ]

    worksheet['!cols'] = columnWidth
    XLSX.utils.book_append_sheet(workbook, worksheet, `Resume_Ticket_ICT`)
    XLSX.writeFile(workbook, `Resume_Ticket_ICT.xlsx`)
  } catch (error) {
    Swal.fire({
      title: 'TICKET',
      text: error,
      icon: 'error',
    })
  }
}

const namePerson = ref()

const openDialog = async id => {
  try {
    const ret = await axiosIns.get(`/tickets/page/assignTo/by/${id}` )

    selectedTicket.value = ret.data.data[0]
    targetEnd.value = formatDateMySql(selectedTicket.value.target_end)
    planstart.value = formatDateMySql(selectedTicket.value.plan_start)
    namePerson.value = selectedTicket.value.person_in_charge ? selectedTicket.value.person_in_charge.person.name : ''

    // dialogTypesTickes.value = selectedTicket.value.ticket_types.name
    dialogVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}

const handleClear = () => {
  fromDate.value = null
  toDate.value = null
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
    router.push({ name: 'ticket-add' })
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

    if (selectedStatus.value) {
      fetchTicket(page.value, perPage.value, find.value, selectedType.value, selectedDepartment.value, selectedStatus.value, fromdate.value, todate.value)
    }

   
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

// const downloadFile = async filename => {
//   loading.value = true
//   try{
//     const params ={
//       filename:filename,
//     }

//     const response = await axiosIns.get(`/tickets/attachment/file`, {
//       params,
//       headers:{
//         'Authorization': 'Bearer ' + localStorage.getItem("sinarjoAccessToken"),
//       },
//       responseType: 'blob',
//     })

//     // Create a blob URL
//     const blob = new Blob([response.data], { type: 'application/pdf' })
//     const href = URL.createObjectURL(blob)

//     window.open(href, '_blank')

//   }catch (error){
//   // console.error('Error preview :', error)
//     Swal.fire({
//       title: 'Ticket',
//       text: 'File No Found !',
//       icon: 'error',
//     })
//   }finally {
//     loading.value = false
//   }
// }

const downloadFile = async filename => {
  loading.value = true
  try {
    const params = {
      filename: filename,
    }

    const response = await axiosIns.get(`/tickets/attachment/file`, {
      params,
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem("sinarjoAccessToken"),
      },
      responseType: 'blob',
    })

    const fileExtension = filename.split('.').pop().toLowerCase()
    let mimeType = ''

    switch (fileExtension) {
    case 'pdf':
      mimeType = 'application/pdf'
      break
    case 'xlsx':
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
    default:
      throw new Error('Unsupported file type')
    }

    const blob = new Blob([response.data], { type: mimeType })
    const href = URL.createObjectURL(blob)

    if (fileExtension === 'pdf') {
      window.open(href, '_blank')
    } else if (fileExtension === 'xlsx') {
      const link = document.createElement('a')

      link.href = href
      link.download = filename
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
    }

    URL.revokeObjectURL(href)
  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: 'File Not Found!',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <Resume
        :type-name="selectedType" 
        :depart-name="selectedDepartment"
        :from-date="fromdate"
        :to-date="todate"
        @status-clicked="handleStatusClicked"
      />
      <VSpacer class="mt-5" />
      <VCard :loading="loading">
        <!-- {{ highlightedDocumentNumber }} -->
        <VRow>
          <VCol cols="12">
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
                @keydown.enter="search"
              />
              <VBtn
                icon
                size="x-small"
                variant="text"
                color="default"
                @click="refresh_page"
              >
                <VTooltip
                  location="top"
                  activator="parent"
                >
                  <span>Refresh</span>
                </VTooltip>
                <VIcon
                  size="20"
                  icon="tabler-refresh"
                />
              </VBtn>
              <VBtn
                prepend-icon="tabler:plus"
                @click="handleAddNewClick"
              >
                Add Ticket
              </VBtn>

              <!--
                <VBtn
                prepend-icon="ri:file-excel-2-line"
                @click="exportClickHandler"
                >
                Export
                </VBtn> 
              -->
            </VCardText>
            <VCardText class="d-flex gap-4">
              <div
                class="d-flex gap-2"
                style="width: 10rem;"
              >
                <VSelect 
                  v-model="selectedType"
                  label="Type"
                  :items="ticketType" 
                  item-text="text" 
                  item-title="name"
                  clearable
                />
              </div>
              <div
                class="d-flex gap-2"
                style="width: 12rem;"
              >
                <VSelect 
                  v-model="selectedDepartment"
                  label="Department in Charge"
                  :items="departmentOptions" 
                  item-text="text" 
                  item-title="department_in_charge"
                  clearable
                />
              </div>
              <VDateInput
                v-model="fromdate"
                label="From Date"
                class="calender-date-picker"
                density="compact"
                prepend-icon
                variant="outlined"
                clearable
                :config="{dateFormat: 'Y-m-d'}"
              />
              <VDateInput
                v-model="todate"
                label="To Date"
                class="calender-date-picker"
                density="compact"
                prepend-icon
                variant="outlined"
                clearable
                :config="{dateFormat:'Y-m-d'}"
              />
              <VBtn
                prepend-icon="ri:file-excel-2-line"
                @click="exportClickHandler"
              >
                Export
              </VBtn>
            </VCardText>
          </VCol>
        </VRow>

       
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
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Ticket Types
                </th>
                <!--
                  <th scope="col">
                  Status
                  </th> 
                -->
                <th scope="col">
                  Requestor
                </th>
                <th scope="col">
                  Description
                </th>

                

                <!--
                  <th scope="col">
                  Extention
                  </th> 
                -->



                <!--
                  <th scope="col">
                  Department in Charge
                  </th> 
                -->
                <th scope="col">
                  Assign To
                </th>
                <th scope="col">
                  Attachment
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
                v-for="(data, index) in tickets"
                :key="index"
              >
                <td style="width: 5rem;">
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
                            v-if="data.status_name === 'Submitted' || !data.person_in_charge_id && data.status_name !== 'Rejected'"
                            :to="{name: 'ticket-id-id', params:{id :data.id}}"
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
                            :to="{ name: 'ticket-approve-approve', params: {approve: data.id}}"
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
                            v-if="data.status_name === 'Rejected'"
                            :to="{ name: 'ticket-id-id', params: {id: data.id}}"
                          >
                            <template #prepend>
                              <VIcon
                                variant="none"
                                density="compact"
                                color="red"
                                size="24"
                                icon="mdi-eye-outline"
                              />
                            </template>
                            <VListItemTitle>View</VListItemTitle>
                          </VListItem> 
                          <VListItem
                            v-if="(data.status_name === 'First_level_approved') && (data.plan_start && data.target_end)"
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
                            v-if="(!data.target_end || !data.plan_start) && (data.status_name == 'First_level_approved' && data.person_in_charge_id)"
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

                          <VListItem
                            v-if="(data.status_name === 'First_level_approved')"
                            :to="{ name: 'project-list', query :{id:data.id} }"
                          >
                            <template #prepend>
                              <VIcon
                                variant="none"
                                density="compact"
                                color="error"
                                size="24"
                                icon="tabler-square-plus"
                              />
                            </template>
                            <VListItemTitle>Project</VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="(data.status_name === 'First_level_approved') && (data.plan_start && data.target_end)"
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
                            <VListItemTitle>Start</VListItemTitle>
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
                  <div
                    class="text-no-wrap"
                    style="margin-top: 15px;margin-bottom: 5px;"
                  >
                    <p
                      :style="{ color: resolveStatusVariant(data.status_name).color }"
                      style="margin: 0;"
                    >
                      {{ data.document_number }}
                    </p>
                    <VChip
                      :color="resolveStatusVariant(data.status_name).color"
                      size="small"
                      variant="none"
                    >
                      {{ resolveStatusVariant(data.status_name).text }}
                    </VChip>            
                  </div>               
                </td>

                <!-- <td style="min-width: 300px; word-wrap: break-word;"> -->

                <td style="min-width: 20px; word-wrap: break-word;">
                  {{ data.ticket_types.name }}
                </td>
                <td style="min-width: 250px; word-wrap: break-word;">
                  {{ data.user.person.name }}
                  <br>
                  Ext No:{{ data.extension_number }}
                </td>
                <td style="min-width: 300px; word-wrap: break-word;">
                  {{ data.description }}
                </td>

                

                <!-- <td>{{ data.extension_number }}</td> -->



                <!-- <td>{{ data.ticket_categories.department_in_charge }}</td> -->

                <td class="text-no-wrap">
                  {{ data.person_in_charge && data.person_in_charge.person ? data.person_in_charge.person.name : '-' }}
                  <br>
                  {{ data.ticket_categories.department_in_charge }}
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
                <!--
                  <td style="min-width: 150px;">
                  {{ data.submitted_date ? new Date(data.submitted_date).toLocaleString('id-ID', { 
                  timeZone: 'Asia/Jakarta', 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                  }).replace(',', '').replace(/\//g, '-') : '' }}
                  </td>

                  <td style="min-width: 150px;">
                  {{ data.approved_date ? new Date(data.approved_date).toLocaleString('id-ID', { 
                  timeZone: 'Asia/Jakarta', 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                  }).replace(',', '').replace(/\//g, '-') : '' }}
                  </td>
                -->

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
                      readonly
                    />
                  </VCol>

                  <VCol cols="3">
                    <VTextField
                      v-model="selectedTicketDialog.start_at"
                      label="Ticket Started"
                      readonly

                      variant="filled"
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
                        display: inline-block; /* Memastikan background hanya mengelilingi teks */
                        padding: 2px 8px; /* Sesuaikan padding untuk latar belakang */
                        border-radius: 8px; /* Sudut lengkung border */
                        background-color: rgba(255, 165, 0, 10%);
                        color: orange;
                        font-size: 25px;
                        vertical-align: middle;
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
                    <AppDateTimePicker
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
                  <AppDateTimePicker
                    v-model="endDate"
                    label="End Date Ticket"
                    class="calender-date-picker"
                    density="compact"
                    :config="{inline: true, enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true, maxDate: dayjs(new Date()).endOf('day').toDate()}"
                  />
                </VCol>
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

<style scoped>
.custom-icon-color {
  color: #050c9c;
}
</style>

<route lang="yaml">
  meta:
    action: Manage
    subject: ICT Ticket
    redirectIfLoggedIn: false
  </route>
