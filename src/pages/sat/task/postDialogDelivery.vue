<script setup>
import AppDateTimePicker from "@/@core/components/AppDateTimePicker.vue"
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import { dateNow, formatDateMySql } from '@core/utils/formatters'
import Swal from "sweetalert2"
import { VDateInput } from "vuetify/lib/labs/components.mjs"

const props = defineProps({
  data: ({
    type: Object
  })
})

const taskForm = ref()
const note = ref('')
const attachment = ref()
const soNumber = ref()
const confirmationDate = ref(new Date())
const attachFile = ref()
const isVisible = ref(false)

const emits = defineEmits(['status'])
const sendStatus = val => {
  emits('status', val)
}

const updateTask = async() => {
  try {
    // const allowedMimeTypes = ['image/jpg', 'application/pdf', 'application/vnd.ms-excel']
    const formData = new FormData();
    if (attachFile.value) {
      formData.append('attachment', attachFile.value);
    }
    
    formData.append('request_ship_date', dateNow());
    formData.append('confirmation_date', formatDateMySql(confirmationDate.value));
    formData.append('note', note.value);
    formData.append('so_number', soNumber.value);

    const ret = await axiosIns.post(`/job/order/takses/post/${props.data.id}`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
        'Content-Type': 'multipart/form-data',
      }
    });

    emits('task-uploaded', true);
    sendStatus(true);
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error.response.data.message,
      icon: 'error'
    })
    sendStatus(false)
    console.log(error)
  }
}

const handleFileChange = event => {
  attachFile.value = event.target.files[0]
}

const onSubmit = () => {
  taskForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      updateTask(),
      isVisible.value = false
    }
  })
}

const cancelClickHandler = () => {
  isVisible.value = false
}
</script>

<template>
  <VDialog v-model="isVisible" :width="900" persistent>
    <template #activator="{props}">
      <VListItemTitle v-bind="props">
        <VIcon 
          color="primary"
          size="24"
          class="me-3"
          icon="tabler-check"
        />
        Set Process
      </VListItemTitle>
    </template>
    <VCard>
      <VCardText>
        <VForm ref="taskForm" @submit.prevent="onSubmit" style="height: auto;">
          <VRow>
            <VCol cols="6">
              <VTextField :readonly="true">{{ props.data.task_name }}</VTextField>
              </VCol>
              <VCol>
                <VDateInput
                  :model-value="new Date().toJSON().slice(0, 10)"
                  v-model="confirmationDate"
                  density="compact"
                  variant="outlined"
                  prepend-icon=""
                  hide-actions="true"
                  label="Shipdate Confirmation"
                  :rules="[requiredValidator]"
                />
              </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <div class="d-flex gap-4 justify-end">
                <VBtn color="warning" @click="cancelClickHandler">Cancel</VBtn>
                <VBtn color="primary" type="submit" >Save</VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: SAT
    redirectIfLoggedIn: false
</route>
