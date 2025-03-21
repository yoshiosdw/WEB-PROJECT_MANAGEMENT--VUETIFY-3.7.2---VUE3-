<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue'
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import { watchEffect } from 'vue'
import { useToast } from 'vue-toastification'

// import Person from '@/pages/ticket/person.vue'
import Person from '@/pages/lookup/employeeByTeam.vue'
import { formatDateTimeMySql } from '@/@core/utils/formatters'

const props = defineProps({
  headerId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  projectTeam: {
    type: String,
    required: true,
  },
})


const emit = defineEmits(['saved', 'closed'])
const toast = useToast()

const Projectpriority = ref()
const projectType = ref()
const priority = ref()
const status = ref()

const isVisible = ref(false)
const refForm = ref()

const showLoading = ref(false)

const planStartLine = ref()
const planEndLine = ref()
const ActualStartLine = ref()
const ActualEndLine = ref()
const statusLine = ref()
const priorityLine = ref()
const descriptionLine = ref()
const nameLine = ref()
const typeLine = ref()

const personLine = ref()
const personLineId = ref()
const personNikLine = ref()
const projectStatus = ref()
const projectLineData = ref([])

const personLineOldId = ref()
const priorityLineOldId = ref()
const typeLineOldId = ref()



const getApprovalPerson = val => {
 
  personLine.value = val.person.name
  personNikLine.value = val.person.nik

  personLineId.value = val.id

}

const openDatePicker = event => {
  event.target.showPicker() 
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

// const fetchStatus = async () => {
//   showLoading.value = true
//   try {
//     const ret = await axiosIns.get('/projectStatus', {
//     })

//     showLoading.value = false
//     projectStatus.value = ret.data.data
//   } catch (error) {
//     console.log(error)
//     toast.error('Failed Load Data')
//   }
//   finally{showLoading.value = false}
// }

const fetchType = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/projectType', {
    })

    showLoading.value = false
    projectType.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

const fetchProjectLineId = async headerId => {
  isVisible.value = true
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/project/line/${headerId}`, {
    })

    showLoading.value = false
    projectLineData.value = ret.data.data[0]

    personLine.value = projectLineData.value.assign_to?.person?.name
    personLineOldId.value = projectLineData.value.assign_to?.id

    priorityLine.value = projectLineData.value.project_priority?.description
    priorityLineOldId.value = projectLineData.value.priority_id

    typeLine.value = projectLineData.value.project_type?.description
    typeLineOldId.value = projectLineData.value.type_id

    descriptionLine.value = projectLineData.value.description

    planStartLine.value = projectLineData.value.plan_start
    planEndLine.value = projectLineData.value.plan_end

    ActualStartLine.value = projectLineData.value.actual_start
    ActualEndLine.value = projectLineData.value.actual_end

  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

watchEffect(() =>{
  fetchProjectLineId(props.headerId),
  fetchPriority(),
  fetchType()
})

const editProjectLine = async id => {
  showLoading.value = true
  isVisible.value = true
  try {

    const params = {
      description     : descriptionLine.value,
      project_id      : props.projectId,
      type_id         : typeLine.value.code || typeLineOldId.value,
      priority_id     : priorityLine.value.code || priorityLineOldId.value,
      assign_to       : personLineId.value || personLineOldId.value,
      plan_start      : formatDateTimeMySql(planStartLine.value),
      plan_end        : formatDateTimeMySql(planEndLine.value),
      
      // actual_start    : ActualStartLine.value,
      // actual_end      : ActualEndLine.value,
    }

    const ret = await axiosIns.patch(`/project/line/${id}`, params)

    // projectId.value = ret.data.data.id
    clearForm()
    showLoading.value = false
    isVisible.value = false

    emit('saved', true)

    // console.log(ret.data.data.id)
  } catch (error) {
    console.log(error)
    toast.error('Failed create data. Error: ' + error.message)
  }
}

const clearForm = () => {
  personLine.value = null
  nameLine.value = null
  descriptionLine.value = null
  priorityLine.value = null
  statusLine.value = null
  planStartLine.value = null

  // planStartLine.value = new Date()
  planEndLine.value = null
  ActualStartLine.value = null
  ActualEndLine.value = null
}

const closeDialog = () => {
  isVisible.value = false
  emit('closed', true)
}

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      editProjectLine(props.headerId)
    }
  })
}
</script>

<template>
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
      <VCardTitle>Project Line</VCardTitle>
      <VDivider />
      <VCardText>
        <VForm
          ref="refForm"
          @submit.prevent="validateFom"
        >
          <VRow style="margin-top: 3px;">
            <VCol
              cols="4"
              class="d-flex gap-3"
            >
              <VTextField
                v-model="personLine"
                label="Assign To"
                readonly
                :rules="[requiredValidator]"
              />
              <Person
                :project-team="props.projectTeam"
                @employee="getApprovalPerson"
              />
            </VCol>
            <VCol cols="4">
              <VAutocomplete
                v-model="priorityLine"
                return-object
                item-value="code"
                item-title="description"
                :items="Projectpriority"
                label="Priority"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="4"
              class="d-flex gap-3"
            >
              <VAutocomplete
                v-model="typeLine"
                return-object
                item-value="code"
                :items="projectType"
                item-title="description"
                label="Type Project"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea
                v-model="descriptionLine"
                label="Description Line"
                :rules="[requiredValidator]"
                rows="2"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="4">
              <VTextField
                v-model="planStartLine"
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
                v-model="planEndLine"
                label="Plan End"
                type="datetime-local"
                :rules="[requiredValidator]"
                density="comfortable"
                variant="outlined"
                class="custom-date-field"
                @click="openDatePicker"
              />
            </VCol>
            <!--
              <VCol cols="3">
              <VDateInput
              v-model="ActualStartLine"
              label="Actual Start"
              :config="{enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true}"
              />
              </VCol>
              <VCol cols="3">
              <VDateInput
              v-model="ActualEndLine"
              label="Actual End"
              :config="{enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true}"
              />
              </VCol> 
            -->
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
</template>

<style>
/* Menyembunyikan ikon kalender bawaan */
.custom-date-field input::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
</style>
