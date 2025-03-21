<script setup>
import axiosIns from "@/plugins/axios"
import router from "@/router"
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"

const users = ref()
const userId = JSON.parse(localStorage.getItem('sinarjoUserData') || 'null')
const userForm = ref()
const password = ref()
const repeatedPassword = ref()
const showLoading = ref(false)

const fetchUser = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/users/${id}` )

    users.value = ret.data.data
    showLoading.value  = false
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Get data failed',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchUser(userId.id)
})

const onSubmit = () => {
  userForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) {
      if(password.value !== repeatedPassword.value){
        Swal.fire({
          text: 'Password not match!',
          title: 'LBG',
          icon: 'error',
        })
      } else {
        updateUser(userId.id)
      }
    } 
  })
} 

const updateUser = async id => {
  try {
    const params = {
      password: password.value,
    }

    const ret = await axiosIns.patch(`/change/passwords/${id}`, params )

    router.push('/login')
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <!-- {{ userId.id }} -->
        <VCardText>
          <VForm
            ref="userForm"
            @submit.prevent="onSubmit"
          >
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
                  v-model="repeatedPassword" 
                  label="Repeat Password"
                  :type="isRepeatedPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isRepeatedPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :rules="[requiredValidator]" 
                  @click:append-inner="isRepeatedPasswordVisible = !isRepeatedPasswordVisible"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <VBtn
                    :to="{name: 'home'}"
                    color="warning"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    color="success"
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
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Dashboard
    redirectIfLoggedIn: false
  </route>
