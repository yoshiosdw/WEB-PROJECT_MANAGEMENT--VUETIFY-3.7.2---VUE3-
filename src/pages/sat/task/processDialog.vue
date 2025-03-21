<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import { dateNow } from '@core/utils/formatters'
import Swal from "sweetalert2"

const props = defineProps({
  data: ({
    type: Object,
  }),
})

const emits = defineEmits(['status'])
const taskForm = ref()
const note = ref('')
const attachment = ref()
const attachFile = ref()
const isVisible = ref(false)

const sendStatus = val => {
  emits('status', val)
}

const updateTask = async() => {
  try {
    // const allowedMimeTypes = ['image/jpg', 'application/pdf', 'application/vnd.ms-excel']
    const formData = new FormData()


    // if (attachFile.value) {
    formData.append('attachment', attachFile.value)

    // }
    
    formData.append('request_ship_date', dateNow())
    formData.append('note', note.value)

    const ret = await axiosIns.post(`/job/order/takses/post/${props.data.id}`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
        'Content-Type': 'multipart/form-data',
      },
    })

    emits('task-uploaded', true)
    sendStatus(true)
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error.response.data.message,
      icon: 'error',
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
  <VDialog
    v-model="isVisible"
    :width="900"
    persistent
  >
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
        <VForm
          ref="taskForm"
          style="height: auto;"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="12">
              <VTextField :readonly="true">
                {{ props.data.task_name }}
              </VTextField>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <div class="d-flex ">
                <VTextarea 
                  v-model="note" 
                  label="Note"
                  rows="2"
                />
              </div>
              <div class="mt-4">
                <VFileInput
                  v-model="attachment"
                  label="Attach file"
                  accept=".pdf"
                  @change="handleFileChange"
                />
              </div>
              <div class="d-flex mt-6 gap-4 justify-end">
                <VBtn
                  color="warning"
                  @click="cancelClickHandler"
                >
                  Cancel
                </VBtn>
                <VBtn
                  color="primary"
                  type="submit"
                >
                  Save
                </VBtn>
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
