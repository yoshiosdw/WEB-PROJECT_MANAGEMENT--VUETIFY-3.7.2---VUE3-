<script setup>
import { formatDateMySql, formatDateTimeMySql } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const props = defineProps({
  update: {
    type: String,
    required: true,
  },
})

// const props = defineProps({
//   update: null, // Definisikan properti update
// })

const router = useRouter()

const userId = ref(JSON.parse(localStorage.getItem('sinarjoUserData')).id)
const tickets = ref()
const page = ref(1)
const perPage = ref(10)
const totalTicket = ref(0)
const last = ref(0)
const isLoading = ref(false)
const selectedType = ref('Complain') 
const ticketType = ref([])
const refForm = ref()
const score = ref()
const isDisable = ref(false)

const selectedTicket = ref([])
const planstart = ref()
const targetend = ref()
const dialogVisible = ref(false)
const dialogVisibleRate = ref(false)
const dialogVisibleAttachment = ref(false)
const find = ref()
const findText = ref()
const newAttachment = ref()
const attachFile = ref()

const handleFileChange = event => {
  attachFile.value = event.target.files[0]
}

const search = () => {
  find.value = findText.value
}

const fetchTicket = async(page, perPage, selectedType, find) => {
  isLoading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      type: selectedType,
      find:find,
    }

    const ret = await axiosIns.get('/tickets/page/ICT', {
      params: params,
    })

    tickets.value = ret.data.data
    totalTicket.value = ret.data.meta.total
    last.value = ret.data.meta.last
    isLoading.value = false
  } catch(error) {
    console.log(error)
    isLoading.value = false
  }
}

const fetchTicketType = async (page, perPage, find) => {
  isLoading.value = true
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
    isLoading.value = false
  }
}

watchEffect(() => {
  fetchTicket(page.value, perPage.value, selectedType.value, find.value)
  fetchTicketType(page.value, perPage.value, null)
})

const updated = ref(null)

// watchEffect(() => {
//   // console.log('Nilai update berubah:', props.update)

//   if (props.update) {
//     isLoading.value = true
//     fetchTicket(page.value, perPage.value, selectedType.value)
//     fetchTicketType(page.value, perPage.value, null)
//     isLoading.value = false

//   }
// })

watch(() => props.update, newVal => {
  if (newVal) {
    isLoading.value = true
    fetchTicket(page.value, perPage.value, selectedType.value, find.value)
    fetchTicketType(page.value, perPage.value, null)
  }
})


const paginationData = computed(() => {
  const firstIndex = totalTicket.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalTicket.value ? totalTicket.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalTicket.value} entries`
})

const disable = status => {
  return status !== 'Submitted'
}

const submitDate = ref()

const openDialog = async id => {
  try {
    const ret = await axiosIns.get(`/tickets/${id}` )

    selectedTicket.value = ret.data.data[0]
    submitDate.value = formatDateTimeMySql(selectedTicket.value.submitted_date)
    planstart.value = formatDateTimeMySql(selectedTicket.value.plan_start)
    targetend.value = formatDateTimeMySql(selectedTicket.value.target_end)
    dialogVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}

const openDialogRate = async id => {
  try {
    const ret = await axiosIns.get(`/tickets/${id}` )

    selectedTicket.value = ret.data.data[0]

    dialogVisibleRate.value = true
  } catch (error) {
    console.error(error)
  }
}

const closeDialogRate = () => {
  dialogVisibleRate.value = false
}

const submitRating = async () => {
  isLoading.value = true
  try {
    const id = selectedTicket.value.id
    
    const payload = {
      score: selectedTicket.value.rating,
    }

    const ret = await axiosIns.post(`/tickets/feedback/${id}`, payload, {
      headers: {
        'Authorization': 'Bearer ' +localStorage.getItem('sinarjoAccessToken'),
      },
    })

    closeDialogRate()

    fetchTicket(page.value, perPage.value, selectedType.value, find.value)
    fetchTicketType(page.value, perPage.value, null)

   
  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    isLoading.value = false
  }
}

const downloadFilledExcel = async (
  ticketnumber, submittedDate, requestor, department, 
  extnumber, email, approv, requestorId, requestFor, requestForName, 
  devName, devDetail, devLoc, desc_ticket, desc, form_request, b_benefit, b_impact, department_approval,
) => {
  try {
    let sameAsRequestor = false
    let otherUser = ''

    if (requestorId === requestFor) {
      sameAsRequestor = true
    } else {
      otherUser = requestForName 
    }
    
    const formattedExt = extnumber ? extnumber : '-'
    
    const formattedTicketNumber = ticketnumber ? `${ticketnumber} | ${formattedExt}` : '-'

    const response = await axiosIns.post('/form/request/compDevice', {
      ticket_number: formattedTicketNumber ,
      submitted_date: submittedDate,
      requestor: requestor,
      department: department,
      email: email,
      approval:approv,
      same_as_requestor: sameAsRequestor,
      other_user_name: otherUser,
      devName: devName,
      devDetail: devDetail,
      devLocation: devLoc,
      desc_ticket: desc_ticket,
      descrip:desc,
      form_request: form_request,
      busBenefit: b_benefit,
      busImpact: b_impact,
      department_approval: department_approval,
    }, {
      
      responseType: 'blob', 
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))

    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', `ticket_${ticketnumber}.xlsx`) 
    document.body.appendChild(link)
    link.click()

    // Hapus objek URL setelah link di klik
    URL.revokeObjectURL(url)
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading file:', error)
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


const goBackRate = () => {
  closeDialogRate()
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


const sendLogoSelection = async (id, logo) =>{
  try{
    isLoading.value = true

    // loading.value = true
    console.log(logo)

    const response = await axiosIns.post(`/form/request/compDevice/${id}`, {
      logo:logo,
    },{
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),

        // 'Content-Type': 'application/json'
      },
      responseType: 'blob',
    })

    console.log('File downloaded successfully:', response)
    
    // Menyimpan file jika response adalah blob
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', `ticket.xlsx`)
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(link)
    isLoading.value = false

    // loading.value = false

  }catch(error){
    console.log('Error sending logo selection:', error)
  }
}

const showLogoSelection = async id=>{
  const { value: logo } = await Swal.fire({
    title: 'Pilih Bisnis Unit',
    input: 'select',
    inputOptions: {
      'SJB': 'SJB',
      'LINUS': 'LINUS',
      'TKI': 'TKI',
      'LBG': 'LBG',
      'PALMAS': 'PALMAS',
    },
    inputPlaceholder: 'Pilih logo...',
    showCancelButton: true,
    confirmButtonText: 'Download',
    cancelButtonText: 'Batal',
    inputValidator: value => {
      if (!value) {
        return 'Harap pilih Bisnis Unit!'
      }
    },
  })

  if (logo) {
    // Kirim ID dan logo yang dipilih ke endpoint lain
    sendLogoSelection(id, logo)
  }
}

const openDialogAttachment = async id => {
  try {
    const ret = await axiosIns.get(`/tickets/${id}` )

    selectedTicket.value = ret.data.data[0]
    submitDate.value = formatDateTimeMySql(selectedTicket.value.submitted_date)
    dialogVisibleAttachment.value = true
  } catch (error) {
    console.error(error)
  }
}

const closeDialogAttachment = () => {
  dialogVisibleAttachment.value = false
}

const submitAttachment = async () => {
  const formData = new FormData()

  formData.append('attachment', attachFile.value)

  try {
    // Pastikan menggunakan ID tiket yang benar dari selectedTicket
    const response = await axiosIns.post(`/tickets/attachment/file/${selectedTicket.value.id}`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
        'Content-Type': 'multipart/form-data',
      },
    })

    dialogVisibleAttachment.value = true
    closeDialogAttachment()

    Swal.fire({
      title: 'Success',
      text: 'Upload File Success !',
      icon: 'success',
    })
    fetchTicket(page.value, perPage.value, selectedType.value, find.value)
  } catch (error) {
    console.error('Error updating attachment:', error)
  }
}

const fileUpload = event => {
  const file = event.target.files[0]

  newAttachment.value = file
}

const resolveAttachVariant = attachment => {
  if (attachment !== null)
    return {
      text: attachment,
      color: 'success',
    }
}

const downloadFile = async filename => {
  isLoading.value = true
  try{
    console.log('testt ajaa yaa')
 
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
    isLoading.value = false
  }
}

const truncateText = text => {
  return `${text.substring(0, 6)}...`
}
</script>

<template>
  <VRow>
    <VOverlay v-model="isLoading" />
    <VCol cols="12">
      <VCard :loading="isLoading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <!--          
            <div
            class="d-flex flex-column flex-grow-1"
            >
            <VTextField 
            v-model="findText"
            label="Search Ticket"
            clearable    
            @keydown.enter="search"
            />
            </div> 
          -->
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
          <VSpacer />
          <div class="d-flex justify-end gap-4">
            <VBtn
              prepend-icon="tabler-plus"
              @click="handleAddNewClick"
            >
              Add New
            </VBtn>
          </div>
        </VCardText>
        <VDivider />
        <VTable>
          <thead
            class="text-uppercase text-small"
            style="background-color: #efefef;"
          >
            <tr>
              <th>Action</th>
              <th>Document Number</th>
              <th>Status</th>  
              <th>Document Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Attachment</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in tickets"
              :key="data.id"
            >
              <td style="width: 3rem;">
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
                          v-if="data.ticket_types.name === 'Request'"
                          :readonly="disable(data.status_name)"
                          @click="showLogoSelection(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="error"
                              size="24"
                              class="me-3"
                              icon="tabler-download"
                              label="Submit"
                            />
                          </template>
                          <VListItemTitle>Download</VListItemTitle>
                        </VListItem>

                        <VListItem
                          @click="openDialog(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="warning"
                              size="24"
                              class="me-3"
                              icon="mdi-eye-outline"
                              label="Submit"
                            />
                          </template>
                          <VListItemTitle>View</VListItemTitle>
                        </VListItem>

                        <VListItem
                          v-if="data.score === null && data.status === 4"
                          @click="openDialogRate(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="warning"
                              size="24"
                              class="me-3"
                              icon="mdi-star-outline"
                              label="Submit"
                            />
                          </template>
                          <VListItemTitle>Rate</VListItemTitle>
                        </VListItem>

                        <VListItem
                          v-if="data.ticket_types.name === 'Request'"
                          :readonly="disable(data.status_name)"
                          @click="openDialogAttachment(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="error"
                              size="24"
                              class="me-3"
                              icon="tabler-cloud-upload"
                              label="Submit"
                            />
                          </template>
                          <VListItemTitle>Upload Attachment </VListItemTitle>
                        </VListItem>
                      </VList>
                    </VMenu>
                  </VBtn>
                </div>
              </td>
              <td>
                <div
                  class="text-no-wrap"
                >
                  <p
                    :style="{ color: resolveStatusVariant(data.status_name).color }"
                    style="margin: 0;"
                  >
                    {{ data.document_number }}
                  </p>
                </div>               
              </td>
              <td>
                <div
                  class="text-no-wrap"
                  style="margin-top: 15px;margin-bottom: 5px"
                >
                  <p
                    :style="{ color: resolveStatusVariant(data.status_name).color }"
                    style="margin: 0;"
                  >
                    {{ data.ticket_types.name }}
                  </p>
                  <VChip
                    :color="resolveStatusVariant(data.status_name).color"
                    size="small"
                    variant="none"
                    style="padding:0;"
                  >
                    {{ resolveStatusVariant(data.status_name).text }}
                  </VChip>            
                </div>               
              </td>
              <td>{{ formatDateMySql(data.document_date) }}</td>
              <td>{{ data.description }}</td>
              <td>{{ data.ticket_categories.name }}</td>
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
            :length="last"
          />
        </VCardText>
      </VCard>
      <VDialog
        v-model="dialogVisible"
        width="900"
        transition="dialog-bottom-transition"
        persistent
      >
        <DialogCloseBtn @click="closeDialog" />
        <VCard>
          <VCardTitle>
            Ticket Detail
          </VCardTitle>

          <VCardText>
            <VRow
              v-if="selectedTicket.status == 9"
              class="mt-2"
            >
              <VCol cols="3">
                <VTextField
                  v-model="selectedTicket.rejected_date"
                  label="Rejected Date"
                  variant="filled"
                  readonly
                />
              </VCol>
              <VCol cols="9">
                <VTextField
                  v-model="selectedTicket.reject_notes"
                  label="Notes"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
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
                  v-model="submitDate"
                  label="Submitted Date"
                  variant="filled"
                  readonly
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
              <VCol cols="5">
                <VTextField
                  v-model="planstart"
                  label="Plan Start"
                  variant="filled"
                  readonly
                />
              </VCol>
              <VCol cols="5">
                <VTextField
                  v-model="targetend"
                  label="Target End"
                  readonly
                  variant="filled"
                />
              </VCol>
              <!-- {{ personId }} -->
            </VRow>
            <VRow 
              v-if="selectedTicket.status_name !== 'Submitted' && selectedTicket.status_name !== 'Rejected'"
              class="mt-3"
            >
              <VCol
                cols="12"
                class="d-flex gap-3"
              >
                <VTextField
                  v-if="selectedTicket.person_in_charge && selectedTicket.person_in_charge.person"
                  v-model="selectedTicket.person_in_charge.person.name"
                  label="PIC"
                  readonly
                  variant="filled"
                />
                <VTextField
                  v-else
                  value="-"
                  label="PIC"
                  readonly
                  variant="filled"
                />
              </VCol>
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
            <VRow
              v-if="selectedTicket.status == 4"
              class="mt-3"
            >
              <VCol cols="12">
                <VTextarea
                  v-model="selectedTicket.corrective_action"
                  label="Corrective Action"
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
                    v-model="selectedTicket.document_number"
                    label="Ticket Number"
                    readonly
                    variant="filled"
                  />
                </VCol>

                <VCol cols="3">
                  <VTextField
                    v-model="selectedTicket.submitted_date"
                    label="Ticket Created"
                    variant="filled"
                    readonly
                  />
                </VCol>

                <VCol cols="3">
                  <VTextField
                    v-model="selectedTicket.start_at"
                    label="Ticket Started"
                    variant="filled"
                    readonly
                  />
                </VCol>

                <VCol cols="3">
                  <VTextField
                    v-model="selectedTicket.end_at"
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
                    v-model="selectedTicket.rating"
                    max="5"
                    clearable
                    hover
                    clear-icons="mdi-star-outline"
                    size="65px"
                    style="margin-right: 10px;" 
                  />
                  <span
                    v-if="selectedTicket.rating !== null"
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
                      v-if="getRatingIcon(selectedTicket.rating)"
                      :icon="getRatingIcon(selectedTicket.rating)"
                    />
                    {{ getRatingLabel(selectedTicket.rating).label }}
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
        v-model="dialogVisibleAttachment"
        width="900"
        transition="dialog-bottom-transition"
        persistent
      >
        <DialogCloseBtn @click="closeDialogAttachment" />
        <VCard>
          <VCardTitle>
            Upload Attachment
          </VCardTitle>

          <VCardText>
            <VForm
              enctype="multipart/form-data"
            >
              <VRow
                v-if="selectedTicket.status == 9"
                class="mt-2"
              >
                <VCol cols="3">
                  <VTextField
                    v-model="selectedTicket.rejected_date"
                    label="Rejected Date"
                    variant="filled"
                    readonly
                  />
                </VCol>
                <VCol cols="9">
                  <VTextField
                    v-model="selectedTicket.reject_notes"
                    label="Notes"
                    readonly
                    variant="filled"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="3">
                  <VTextField  
                    v-model="selectedTicket.ticket_types.name"
                    label="Ticket Type"
                    readonly
                    variant="filled"
                  />
                </VCol>
                <VCol cols="9">
                  <VTextField 
                    v-model="selectedTicket.document_number"
                    label="Document Number"
                    readonly
                    variant="filled"
                  />
                </VCol>
              </VRow>

              <VRow class="mt-3">
                <VCol cols="4">
                  <VTextField 
                    v-model="selectedTicket.ticket_categories.name"
                    label="Ticket Category"
                    readonly
                    variant="filled"
                  />
                </VCol>
                <VCol cols="4">
                  <VTextField 
                    v-model="selectedTicket.ticket_sub_categories.name"
                    label="Ticket Sub Category"
                    readonly
                    variant="filled"
                  />
                </VCol>
                <VCol
                  cols="4"
                >
                  <VTextField
                    v-model="submitDate"
                    label="Submitted Date"
                    variant="filled"
                    readonly
                  />
                </VCol>
              </VRow>

              <VRow
                v-if="selectedTicket.status_name === 'Submitted'"
                class="mt-3"
              >
                <VCol cols="12">
                  <VFileInput 
                    v-model="newAttachment"
                    :disabled="readonlyFields"
                    label="Upload File Here !"
                    accept=".pdf"
                    clearable
                    @change="handleFileChange"
                  />
                </VCol>
              </VRow>
    
              <VRow
                v-if="selectedTicket.status_name !== 'Submitted'"
                class="mt-3"
              >
                <VCol cols="12">
                  <VFileInput 
                    v-model="newAttachment"
                    :disabled="readonlyFields"
                    label="Upload File Here !"
                    accept=".pdf"
                    clearable
                    @change="handleFileChange"
                  />
                </VCol>
              </VRow>
    
              <VRow
                v-if="selectedTicket.status == 4"
                class="mt-3"
              >
                <VCol cols="12">
                  <VTextarea
                    v-model="selectedTicket.corrective_action"
                    label="Corrective Action"
                    rows="2"
                    readonly
                    variant="filled"
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
                  @click="submitAttachment"
                >
                  Upload
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VDialog>
    </VCol>
  </VRow>
</template>


