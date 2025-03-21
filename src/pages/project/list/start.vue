<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue'
import axiosIns from '@/plugins/axios'
import { watchEffect } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  headerId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['saved', 'closed'])
const toast = useToast()
const isVisible  = ref(false)
const showLoading  = ref(false)

const ActualStart = ref()
const ActualEnd = ref()

const projectData = ref()
const name = ref()
const description = ref()
const planStart = ref()
const planEnd = ref()
const ticketId = ref()
const assignTo = ref()
const priority = ref()

const fetchProjectId = async headerId => {
  isVisible.value = true
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/projects/${headerId}`, {
    })

    showLoading.value = false
    projectData.value = ret.data.data[0]

    name.value = projectData.value.name
    description.value = projectData.value.description

    planStart.value = projectData.value.plan_start
    planEnd.value = projectData.value.plan_end

    ticketId.value = projectData.value.ticket?.id
    assignTo.value = projectData.value.assignTo?.id
    priority.value = projectData.value.priority_id



  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

watchEffect(() =>{
  fetchProjectId(props.headerId)
})

const closeDialog = () => {
  isVisible.value = false
  emit('closed', true)
}

const editProject = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.patch(`/projects/${id}`, {
      name            : name.value,
      description     : description.value,
      priority_id     : priority.value,
      assign_to       : assignTo.value,
      plan_start      : planStart.value,
      plan_end        : planEnd.value,
      actual_start    : ActualStart.value,
      actual_end      : ActualEnd.value,
      ticket_id       : ticketId.value,
    } )

    emit('saved', true)
    
    isVisible.value = false
    
    showLoading.value = false
  } catch (error) {
    console.log(error)
    toast.error('Failed create data')
  } finally {
    showLoading.value = false
  }
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
        <VCardTitle> Start Project </VCardTitle>
        <VDivider />
        <VCardText>
          <VForm
            ref="refCheckout"
            @submit.prevent="editProject(props.headerId)"
          >
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="name"
                  label="Name Project"
                  readonly
                  variant="filled"
                />
              </VCol> 
              <VCol cols="8">
                <VTextField
                  v-model="description"
                  label="Description"
                  readonly
                  variant="filled"
                />
              </VCol> 
            </VRow>
  
            <VRow>
              <VCol cols="4">
                <VDateInput
                  v-model="ActualStart"
                  label="Actual Start"
                  :config="{enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true}"
                />
              </VCol>
              <VCol cols="4">
                <VDateInput
                  v-model="ActualEnd"
                  label="Actual End"
                  :config="{enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true}"
                />
              </VCol>
            </VRow>
  
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-2 mt-3">
                  <VBtn
                    color="warning"
                    variant="outlined"
                    @click="closeDialog"
                  >
                    Close
                  </VBtn>
  
                  <VBtn
                    color="primary"
                    type="submit"
                    variant="outlined"
                  >
                    Simpan
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
