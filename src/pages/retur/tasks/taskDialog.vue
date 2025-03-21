<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import { dateNow } from '@core/utils/formatters'
import Swal from 'sweetalert2'

const props = defineProps({
  data: ({
    type: Object,
  })
})

const taskForm = ref()
const transDate = ref(dateNow())
const note = ref('')
const attachment = ref()
const attachFile = ref()

const loading = ref(false)
const isVisible = ref(false)

const emits = defineEmits(['status'])

const sendStatus = val => {
  emits('status', val)
}

// const updateTask = async () => {
//   try {
//     const ret = await axiosIns.post(`/return/takses/post/${props.data.id}`, {
//       attachment: attachFile.value,
//       trans_date: dateNow(),
//       note: note.value
//     }, {
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
//         "Content-Type": "multipart/form-data"
//       }
//     })
//     emits('task-updated', true);
//     sendStatus(true)
//     Swal.fire({
//       title: 'LBG',
//       text: 'Update success',
//       icon: 'success'
//     })
//   } catch (error) {
//     Swal.fire({
//       title:'LBG',
//       text:'Update data failed',
//       icon:'error'
//     })
//     sendStatus(false)
//     console.log(error);
//   }
// }

const updateTask = async () => {
  try {
    const allowedMimeTypes = ['image/jpg', 'application/pdf', 'application/vnd.ms-excel'];

    const formData = new FormData();
    formData.append('attachment', attachFile.value);

    // if (!allowedMimeTypes.includes(attachFile.value.type)) {
    //   Swal.fire({
    //     title: 'LBG',
    //     text: 'Invalid file type. Only JPG, PDF, and Excel files are allowed.',
    //     icon: 'error'
    //   });
    //   return;
    // }

    formData.append('trans_date', dateNow());
    formData.append('note', note.value);

    const ret = await axiosIns.post(`/return/takses/post/${props.data.id}`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
        'Content-Type': 'multipart/form-data',
        'Accept': allowedMimeTypes.join(',')
      }
    });

    emits('task-updated', true);
    sendStatus(true);

    // Swal.fire({
    //   title: 'LBG',
    //   text: 'Update success',
    //   icon: 'success'
    // });
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error.response.data.message,
      icon: 'error'
    });

    sendStatus(false);
    console.log(error);
  }
};


const handleFileChange = event => {
  attachFile.value = event.target.files[0]
}

const onSubmit = () => {
  taskForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid){
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
        Set Prosess
      </VListItemTitle>
    </template>
    <VCard>
      <VCardText>
        <VForm ref="taskForm" @submit.prevent="onSubmit" style="height: auto;">
          <VRow>
            <VCol cols="12">
              <VTextField :readonly="true">{{ props.data.handling_retur }}</VTextField>
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
              <div class="mt-4">
                <VFileInput label="Attach file" :rules="[requiredValidator]" v-model="attachment" @change="handleFileChange" accept=".pdf,.xls,.xlsx,.jpg"/>
              </div>
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
  subject: Return
  redirectIfLoggedIn: false
</route>
