<script setup>
import { requiredValidator } from '@/@core/utils/validators';
import axiosIns from '@/plugins/axios';
import Swal from 'sweetalert2';

const isVisible = ref(false)
const refAttachForm = ref()
const attachment = ref()
const attachFile = ref()

const emits = defineEmits()
const props = defineProps({
  data: ({
    type: Object,
  })
})

const cancelClickHandler = () => {
  isVisible.value = false
}

const uploadAttach = async(id) => {
  try {
    const allowedMimeTypes = ['image/jpg', 'application/pdf', 'application/vnd.ms.excel']
    const formData = new FormData();
    formData.append('attachment', attachFile.value)

    const ret = await axiosIns.post(`/return/task/attachment/${props.data.id}`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
        'Content-Type': 'multipart/form-data',
        'Accept': allowedMimeTypes.join(',')
      }
    })
    emits('attach-updated', true)
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error, 
      icon: 'error'
    })
  }
}

const handleFileChange = event => {
  attachFile.value = event.target.files[0]
}

const onSubmit = () => {
  refAttachForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      uploadAttach(props.data.id)
      isVisible.value = false
    }
  })
}
</script>

<template>
  <VDialog v-model="isVisible" :width="900" persistent>
    <template #activator="{props}">
      <VListItemTitle v-bind="props">
        <VIcon
          color="warning"
          size="24"
          class="me-3"
          icon="tabler-upload"
        />
        Reupload
      </VListItemTitle>
    </template>
    <VCard>
      <VCardText>    
        <VForm ref="refAttachForm" @submit.prevent="onSubmit">
          <div class="mt-4">
            <VFileInput label="Attach file" v-model="attachment" @change="handleFileChange" :rules="[requiredValidator]" accept=".pdf,.xls,.xlsx,.jpg"/>
          </div>
          <div class="d-flex mt-6 gap-4 justify-end">
            <VBtn color="warning" @click="cancelClickHandler">Cancel</VBtn>
            <VBtn color="primary" type="submit" >Save</VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Return
    redirectIfLoggedIn: false
  </route>
