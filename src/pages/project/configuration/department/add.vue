<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { watchEffect } from 'vue'
import { useToast } from 'vue-toastification'
import router from '@/router'
import { requiredValidator } from '@/@core/utils/validators'

const emit = defineEmits(['saved', 'closed'])
const toast = useToast()

const isVisible = ref(false)
const isVisibleLine = ref(false)

const refForm = ref()

const showLoading = ref(false)

const name = ref()
const description = ref()

const departId = ref()
const saved = ref(false)

const closeDialog = () => {
  isVisible.value = false

  clearForm()
  emit('closed', true)
}

const createDepartment = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.post('/projectPriority', {
      name            : name.value,
      description     : description.value,

    } )

    emit('saved', true)

    isVisible.value = false
    isVisibleLine.value = true
    
    // console.log(ret.data.data.id)
    clearForm()
    showLoading.value = false

    departId.value = ret.data.data.id
  } catch (error) {
    console.log(error)
    toast.error('Failed create data')
  } finally {
    showLoading.value = false
  }
}

const clearForm = () => {
  name.value = null
  description.value = null
}

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      createDepartment()
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
          Add Department
        </VBtn>
      </template>
      <DialogCloseBtn @click="closeDialog" />
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardTitle>Add Department</VCardTitle>
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
                  label="name"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="description"
                  label="Description"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow
              class="mt-3"
            >
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
  </div>
</template>

<style>
.no-spinner input::-webkit-outer-spin-button,
.no-spinner input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner input[type="text"] {
  -moz-appearance: textfield; /* For Firefox */
}
</style>

<route lang="yaml">
  meta:
    action: Read
    subject: Dashboard
    redirectIfLoggedIn: false
  </route>
