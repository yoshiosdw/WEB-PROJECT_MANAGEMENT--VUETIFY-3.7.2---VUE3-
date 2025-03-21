<script setup>
import { requiredValidator } from '@/@core/utils/validators';
import axiosIns from '@/plugins/axios';
import router from '@/router';
import { themeConfig } from '@themeConfig';
import Swal from 'sweetalert2';
import LookupPerson from '../lookup/person.vue';

const showLoading = ref(true)
const isPasswordVisible = ref(false)
const isRepeatedPasswordVisible = ref(false)

const userForm = ref()
const username = ref()
const password = ref()
const repeatedPassword = ref()
const personName = ref()
const personId = ref()
const roleName = ref()
const roleId = ref()
const roles = ref()

const getValueFromPersonDialog = data => {
  personId.value = data.id
  personName.value = data.name
}

const getValueFromRoleDialog = data => {
  roleName.value = data.name
  roleId.value = data.id
}

const onSubmit = () => {
  userForm.value?.validate().then(({ valid: isValid}) => {
      if(isValid) {
        if(password.value !== repeatedPassword.value){
          Swal.fire({
            text: 'Password not match!',
            title: 'LBG',
            icon: 'error'
          })
        } else {
          ceateUser()
        }
      } 
    })
} 

const fetchRole = async () => {
  try {
    const ret = await axiosIns.get('/roles', {
      headers: {
        'Authorization': 'Bearer '+ localStorage.getItem('sinarjoAccessToken')
      }
    })
    roles.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Fail to create User',
      icon: 'error'
    })
    console.log(error);
  }
}

const ceateUser = async () => {
  try {
    const ret = await axiosIns.post('/users', {
      username: username.value,
      password: password.value,
      person_id: personId.value,
      role: roleName.value
    }, {
      headers: {
        'Authorization':'Bearer '+localStorage.getItem('sinarjoAccessToken')
      }
    })
    router.push({name: 'user'})
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Fail to create User',
      icon: 'error'
    })
  }
}

onMounted(() => {
  fetchRole()
})

</script>
<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="showLoading">
        <VCardText>
          <VForm ref="userForm" @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="12">
                <VTextField label="Username" v-model="username" :rules="[requiredValidator]"/>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VTextField 
                label="Password" 
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                v-model="password" 
                :rules="[requiredValidator]"/>
              </VCol>
              <VCol cols="6">
                <VTextField 
                label="Repeat Password" 
                :type="isRepeatedPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isRepeatedPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isRepeatedPasswordVisible = !isRepeatedPasswordVisible"
                v-model="repeatedPassword" 
                :rules="[requiredValidator]"/>
              </VCol>
            </VRow>
            <VDivider class="mt-3 mb-3"/>
            <VRow>
              <VCol cols="6" class="d-flex gap-3">
                <VTextField label="Person" v-model="personName" :rules="[requiredValidator]" readonly="true"/>
                <LookupPerson @person="getValueFromPersonDialog"/>
              </VCol>
              <VCol cols="6" class="d-flex gap-3">
                <VSelect 
                  :items="roles"
                  item-title="name"
                  item-value="name"
                  single-line
                  v-model="roleName"
                />
              </VCol>
            </VRow>
            <VSpacer class="mt-4" />
            <VRow>
              <VCol cols="12" class="d-flex justify-end gap-3">
                <VBtn color="warning" :to="{ name: 'user'}">
                  Cancel
                </VBtn>
                <VBtn color="success" @click="onSubmit">
                  Save
                </VBtn>
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
  action: Manage
  subject: User
  redirectIfLoggedIn: false
</route>