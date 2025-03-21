<script setup>
import { formatDateMySql, formatDateTimeMySql } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import { useRouter } from 'vue-router'

const props = defineProps({
  update: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const userId = ref(JSON.parse(localStorage.getItem('sinarjoUserData')).id)
const tickets = ref()
const page = ref(1)
const perPage = ref(10)
const totalTicket = ref(0)
const last = ref(0)
const isLoading = ref(false)
const score = ref()

const selectedTicket = ref([])
const dialogVisible = ref(false)
const dialogVisibleRate = ref(false)
const refForm = ref()
const submitDate = ref()
const planstart = ref()
const targetend = ref()

const fetchTicket = async(page, perPage) => {
  isLoading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
    }

    const ret = await axiosIns.get('/tickets/page/GA', {
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

watchEffect(() => {
  fetchTicket(page.value, perPage.value)
})

watch(() => props.update, newVal => {
  if (newVal) {
    isLoading.value = true
    fetchTicket(page.value, perPage.value)
  }
})

const paginationData = computed(() => {
  const firstIndex = totalTicket.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalTicket.value ? totalTicket.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalTicket.value} entries`
})

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
    fetchTicket(page.value, perPage.value)

  } catch (error) {
    Swal.fire({
      title: 'Ticket',
      text: error,
      icon: 'error',
    })
    isLoading.value = false
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
    router.push({ name: 'ticket-ga-add' })
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard :loading="isLoading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
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
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in tickets"
              :key="data.id"
            >
              <td>
                <VBtn
                  icon
                  variant="none"
                  density="compact"
                  @click="openDialog(data.id)"
                >
                  <VIcon icon="mdi-eye-outline" />
                </VBtn>
                <VBtn
                  v-if="data.ticket_types.name !== 'Request' && data.score === null && data.status === 4"
                  icon
                  color="warning"
                  title="Rate"
                  variant="none"
                  density="compact"
                  @click="openDialogRate(data.id)"
                >
                  <VIcon
                    icon="mdi-star-outline" 
                    size="28px"
                  />
                </VBtn>
              </td>
              <td>{{ data.document_number }}</td>
              <td>
                <VChip
                  :color="resolveStatusVariant(data.status_name).color"
                  size="small"
                >
                  {{ resolveStatusVariant(data.status_name).text }}
                </VChip>
              </td>
              <td>{{ formatDateMySql(data.document_date) }}</td>
              <td>{{ data.description }}</td>
              <td>{{ data.ticket_categories.name }}</td>
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
        width="768"
        transition="dialog-bottom-transition"
        persistent
      >
        <DialogCloseBtn @click="closeDialog" />
        <VCard v-if="selectedTicket.ticket_types.name !== 'Request' ">
          <VCardTitle>
            Ticket Detail
          </VCardTitle>

          <VCardText
            class="mt-3"
          >
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
            <VRow class="mt-3">
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
    </VCol>
  </VRow>
</template>
