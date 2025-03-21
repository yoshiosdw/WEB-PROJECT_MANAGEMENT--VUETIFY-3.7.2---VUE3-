<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue'
import axiosIns from '@/plugins/axios'
import { watchEffect } from 'vue'
import { useToast } from 'vue-toastification'
import router from '@/router'
import { requiredValidator } from '@/@core/utils/validators'
import Line from './line/[line].vue'
import { getCurrentDateTimeWIB, formatDateTimeMySql } from '@/@core/utils/formatters'

// import Person from '@/pages/ticket/person.vue'
import Person from '@/pages/lookup/employee.vue'
import Team from '@/pages/lookup/lookupTeamProject.vue'
import Ticket from '@/pages/lookup/ticket.vue'

const props = defineProps({
  headerId: {
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
const planEnd = ref()
const ActualStart = ref()
const ActualEnd = ref()
const assignTo = ref()

const ticketId = ref()
const ticketIdOld = ref()
const ticketNumber = ref()
const ticketDescription = ref()

const projectId = ref()

const personOldId = ref()
const priorityOldId = ref()
const typeOldId = ref()

const teamDescription = ref()
const teamOldId = ref()
const teamId = ref()
const teamName = ref()

const ticketRequestor = ref()

const projectDepartment = ref()
const department = ref()
const departmentOldId = ref()

const projectLineData = ref()

const bisnisUnits = ref([])
const biu = ref()
const biuOldId = ref()

const openDatePicker = event => {
  event.target.showPicker() 
}

const getTeam = val => {
  teamName.value = val.name
  teamDescription.value = val.description

  teamId.value = val.id
}

const getApprovalPerson = val => {
 
  person.value = val.person.name
  personNik.value = val.person.nik

  personId.value = val.id

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

const fetchProjectId = async headerId => {
  isVisible.value = true
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/projects/${headerId}`, {
    })

    showLoading.value = false
    projectLineData.value = ret.data.data[0]

    department.value = projectLineData.value.project_department?.description || ''
    departmentOldId.value = projectLineData.value.project_department_id

    biu.value = projectLineData.value.biu?.name || ''
    biuOldId.value = projectLineData.value.biu_id

    ticketNumber.value = projectLineData.value.ticket?.document_number
    ticketDescription.value = projectLineData.value.ticket?.description

    teamName.value = projectLineData.value.team?.description || ''
    teamOldId.value = projectLineData.value.team?.id

    priority.value = projectLineData.value.project_priority?.description
    priorityOldId.value = projectLineData.value.priority_id

    name.value = projectLineData.value.name
    description.value = projectLineData.value.description

    planStart.value = projectLineData.value.plan_start
    planEnd.value = projectLineData.value.plan_end

    ActualStart.value = projectLineData.value.actual_start
    ActualEnd.value = projectLineData.value.actual_end

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

const fetchBiu = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('organizations/getByBiu')

    showLoading.value = false
    bisnisUnits.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
}

watchEffect(() =>{
  fetchProjectId(props.headerId),
  fetchPriority(),
  fetchStatus(),
  fetchDepartment()
  fetchBiu()
})

const editProject = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.patch(`/projects/${id}`, {
      name            : name.value,
      description     : description.value,
      priority_id     : priority.value.code || priorityOldId.value,
      assign_to       : personId.value || personOldId.value,
      plan_start      : formatDateTimeMySql(planStart.value),
      plan_end        : formatDateTimeMySql(planEnd.value),
      actual_start    : ActualStart.value,
      actual_end      : ActualEnd.value,
      ticket_id       : ticketId.value || ticketIdOld.value,
      project_department_id       : department.value.id || departmentOldId.value,
      project_team_id : teamId.value || teamOldId.value,
      biu_id          : biu.value.id || biuOldId.value,
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

  name.value = null
  description.value = null
  priority.value = null
  status.value = null
  person.value = null
  planStart.value = new Date()
  planEnd.value = null
}

// watch(isVisible, newVal => {
//   if (!newVal) {
//     emit('closed')
//   }
// })

const closeDialog = () => {
  isVisible.value = false
  emit('closed', true)
}

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      editProject(props.headerId)
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
                  return-object
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
                  return-object
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
                  v-model="ticketNumber"
                  label="Ticket Number"
                  readonly
                />
                <Ticket
                  @ticket="getTicket"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="ticketRequestor"
                  label="Ticket Requestor"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="ticketDescription"
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
                  @click="isVisible = false"
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
