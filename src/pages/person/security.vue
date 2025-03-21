<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'

const securityForm = ref()
const isPasswordVisible = ref(false)
const isRepeatPasswordVisible = ref(false)
const password = ref()
const repeatPassword = ref()
const roles = ref([])
const role = ref()

const fetchRoles = async () => {
  try {
    const ret = await axiosIns.get('/roles' )

    roles.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Load role data failed',
      icon: 'error',
    })
  }
}



const onSubmit = () => {
  securityForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid){
      if(password.value !== repeatPassword.value){
        alert('not match')
      } else {
        alert('saved')
      }
    }
  })
}

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <div>
    <VForm
      ref="securityForm"
      @submit.prevent="onSubmit"
    >
      <VRow>
        <VCol cols="12">
          <VTextField
            label="Username"
            :rules="[requiredValidator]"
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="6">
          <VTextField
            v-model="password"
            label="Password"
            :type="isPasswordVisible ? 'text' : 'password'"
            :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
            :rules="[requiredValidator]"
            @click:append-inner="isPasswordVisible = !isPasswordVisible"
          />
        </VCol>
        <VCol cols="6">
          <VTextField
            v-model="repeatPassword"
            label="Repeat Password"
            :type="isRepeatPasswordVisible ? 'text' : 'password'"
            :append-inner-icon="isRepeatPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
            :rules="[requiredValidator]"
            @click:append-inner="isRepeatPasswordVisible = !isRepeatPasswordVisible"
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12">
          <VSelect 
            v-model="role"
            :items="roles"
            item-value="name"
            item-title="name"
            single-line
            :rules="[requiredValidator]"
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol
          cols="12"
          class="d-flex justify-end mt-4"
        >
          <VBtn
            prepend-icon="tabler-disc"
            type="submit"
          >
            Save
          </VBtn>
        </VCol>
      </VRow>
    </VForm>
  </div>
</template>

<route lang="yaml">
  meta:
    action: 'Read'
    subject: 'Dashboard'
    redirectIfLoggedIn: false
</route>
