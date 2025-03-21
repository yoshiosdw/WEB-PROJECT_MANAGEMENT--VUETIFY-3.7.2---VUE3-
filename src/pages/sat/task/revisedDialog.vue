<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"

const props = defineProps({
  data: ({
    type: Object
  })
})

const taskForm = ref()
const note = ref('')
const attachment = ref()
const attachFile = ref()
const isVisible = ref(false)

const emits = defineEmits(['status'])
const sendStatus = val => {
  emits('status', val)
}

const updateTask = async() => {
  try {
    const formData = new FormData()
    formData.append('note', note.value)
    const ret = await axiosIns.patch(`/job/order/takses/revised/${props.data.id}`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem("sinarjoAccessToken"),
        'Content-Type': 'multiple/form-date'
      }
    })
    emits('task-uploaded', true)
    sendStatus(true)
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
          icon="tabler-360"
        />
        Revised
      </VListItemTitle>
    </template>
    <VCard>
      <VCardText>
        <VForm ref="taskForm" @submit.prevent="onSubmit" style="height: auto;">
          <VRow>
            <VCol cols="12">
              <VTextField :readonly="true">{{ props.data.task_name }}</VTextField>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <div class="d-flex ">
                <VTextarea 
                  label="Note"  
                  :rules="[requiredValidator]"
                  v-model="note"
                  rows="2"
                />
              </div>
              <!-- <div class="mt-4">
                <VFileInput label="Attach file" :rules="[requiredValidator]" v-model="attachment" @change="handleFileChange" accept=".pdf,.xls,.xlsx,.jpg"/>
              </div> -->
              <div class="d-flex mt-6 gap-4 justify-end">
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
