<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue'
import axiosIns from '@/plugins/axios'
import { watchEffect } from 'vue'
import { useToast } from 'vue-toastification'
import router from '@/router'
import { requiredValidator } from '@/@core/utils/validators'
import Line from './line/[line].vue'


// import Person from '@/pages/ticket/person.vue'
// import Person from '@/pages/lookup/employee.vue'
// import Person from '@/pages/lookup/employeeICT.vue'
import Team from '@/pages/lookup/lookupTeamProject.vue'
import Ticket from '@/pages/lookup/ticket.vue'
import AppDateTimePicker from '@/@core/components/AppDateTimePicker.vue'
import { formatDateTimeMySql, getCurrentDateTimeWIB } from '@/@core/utils/formatters'
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const props = defineProps({
  ticketData: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['saved', 'closed'])
const toast = useToast()

const Projectpriority = ref()
const projectStatus = ref()
const priority = ref()
const status = ref()

const isVisible = ref(false)
const isVisibleLine = ref(false)

const refForm = ref()

const showLoading = ref(false)
const person = ref()
const personNik = ref()
const personId = ref()

const name = ref()
const description = ref()

const planStart = ref(getCurrentDateTimeWIB())



// const planStart = ref(new Date())
const planEnd = ref()
const ActualStart = ref()
const ActualEnd = ref()
const assignTo = ref()

const ticketId = ref()
const ticketNumber = ref()
const ticketRequestor = ref()
const ticketDescription = ref()

const projectDepartment = ref()
const department = ref()

const projectId = ref()

const ticketTransferId = computed(() => props.ticketData)
const ticketTransfer = ref([])
const ticketTransferDesc = ref()
const ticketTransferDocNo = ref()
const ticketTransferRequestor = ref()

const teamDescription = ref()
const teamId = ref()
const teamName = ref()


const bisnisUnits = ref([])
const biu = ref()

const openDatePicker = event => {
  event.target.showPicker() 
}

const getTeam = val => {
 
  teamName.value = val.name
  teamDescription.value = val.description

  teamId.value = val.id

}

const getTicket = val => {
 
  ticketNumber.value = val.document_number
  ticketRequestor.value = val.user?.person?.name
  
  ticketDescription.value = val.description

  ticketId.value = val.id

}

const fetchPriority = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/projectPriority', {
    })

    showLoading.value = false
    Projectpriority.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

const fetchBiu = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('organizations/getByBiu')

    bisnisUnits.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
}

const fetchStatus = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/projectStatus', {
    })

    showLoading.value = false
    projectStatus.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

const fetchDepartment = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/projectDepartment', {
    })

    showLoading.value = false
    projectDepartment.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

const fetchTicketId = async id => {
  isVisible.value = true
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/tickets/${id}`, {
    })

    ticketTransfer.value = ret.data.data[0]
    ticketTransferDocNo.value = ticketTransfer.value?.document_number
    ticketTransferDesc.value = ticketTransfer.value?.description
    ticketTransferRequestor.value = ticketTransfer.value?.user?.person?.name

  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

const displayTicketDescription = computed(() => {
  return ticketTransferDesc.value || ticketDescription.value
})

const displayTicketDocNo = computed(() => {
  return ticketTransferDocNo.value || ticketNumber.value
})

const displayTicketRequestor = computed(() => {
  return ticketTransferRequestor.value || ticketRequestor.value
})

watchEffect(() =>{
  fetchPriority(),
  fetchStatus(),
  fetchDepartment(),
  fetchBiu()
})

watchEffect(() => {
  if (ticketTransferId.value) {
    isVisible.value = true
    fetchTicketId(props.ticketData)
  }
})

const closeDialog = () => {
  isVisible.value = false

  ticketTransferDesc.value = null
  ticketTransferDocNo.value = null
  ticketTransferRequestor.value = null
  clearForm()
  emit('closed', true)
}

const createProject = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.post('/projects', {
      name            : name.value,
      description     : description.value,
      priority_id     : priority.value,
      project_team_id : teamId.value,
      plan_start      : formatDateTimeMySql(planStart.value),
      plan_end        : formatDateTimeMySql(planEnd.value),
      actual_start    : ActualStart.value,
      actual_end      : ActualEnd.value,
      ticket_id       : ticketId.value,
      biu_id          : biu.value,
      project_department_id       : department.value,
    } )

    projectId.value = ret.data.data.id
    emit('saved', true)
    
    isVisible.value = false
    isVisibleLine.value = true
    
    // console.log(ret.data.data.id)
    clearForm()
    showLoading.value = false
  } catch (error) {
    console.log(error)
    toast.error('Failed create data')
  } finally {
    showLoading.value = false
  }
}

const clearForm = () => {
  ticketNumber.value = null
  ticketDescription.value = null
  ticketRequestor.value = null
  department.value = null
  name.value = null
  description.value = null
  priority.value = null
  status.value = null
  person.value = null
  planStart.value = new Date()
  planEnd.value = null
  biu.value = null
  teamId.value = null
  teamName.value = null
}

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      createProject()
    }
  })
}
</script>

<template>
  <div>
    <VDialog
      v-model="isVisible"
      width="1024"
      transition="dialog-bottom-transition"
      persistent
      z-index="1024"
    >
      <template #activator="{props}">
        <VBtn
          v-bind="props"
          prepend-icon="tabler-plus"
        >
          Add Project
        </VBtn>
      </template>
      <DialogCloseBtn @click="closeDialog" />
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardTitle>Add Project</VCardTitle>
        <VDivider />
  
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="validateFom"
          >
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="name"
                  label="Name Project"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="4">
                <VAutocomplete
                  v-model="department"
                  item-value="id"
                  item-title="description"
                  :items="projectDepartment"
                  label="To Department"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="4">
                <VAutocomplete
                  v-model="biu"
                  item-value="id"
                  item-title="name"
                  :items="bisnisUnits"
                  label="Bisnis Unit"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  label="Description"
                  :rules="[requiredValidator]"
                  rows="2"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="4"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="displayTicketDocNo"
                  label="Ticket Number"
                  readonly
                />
                <Ticket
                  v-if="!ticketTransferId"
                  @ticket="getTicket"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="displayTicketRequestor"
                  label="Ticket Requestor"
                  readonly
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="displayTicketDescription"
                  label="Ticket Description"
                  readonly
                  rows="2"
                />
              </VCol>
            </VRow>
            
            
            <VRow>
              <VCol cols="3">
                <VAutocomplete
                  v-model="priority"
                  item-value="code"
                  item-title="description"
                  :items="Projectpriority"
                  label="Priority"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="9"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="teamName"
                  label="Assign For Team"
                  item-title="name"
                  item-value="id"
                  readonly
                  :rules="[requiredValidator]"
                />
                <Team
                  @team="getTeam"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="planStart"
                  label="Plan Start"
                  type="datetime-local"
                  :rules="[requiredValidator]"
                  density="comfortable"
                  variant="outlined"
                  class="custom-date-field"
                  @click="openDatePicker"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="planEnd"
                  label="Plan End"
                  type="datetime-local"
                  :rules="[requiredValidator]"
                  density="comfortable"
                  variant="outlined"
                  class="custom-date-field"
                  @click="openDatePicker"
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
                  :disabled="showLoading"
                  @click="closeDialog"
                >
                  Cancel
                </VBtn>
  
                <VBtn
                  color="error"
                  :disabled="showLoading"
                  @click="validateFom"
                >
                  Save
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
    

    <!--
      <Line
      v-if="isVisibleLine"
      :header-id="projectId"
      /> 
    -->
  </div>
</template>

<style>
/* Menyembunyikan ikon kalender bawaan */
.custom-date-field input::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
</style>
