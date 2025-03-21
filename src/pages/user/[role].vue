<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from "@/plugins/axios"
import router from '@/router'
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"

const users = ref()
const route = useRoute()
const userId = ref(route.params.role)

const userForm = ref()
const username = ref()
const personName = ref()
const roleName = ref()
const roles = ref()
const isLoading = ref(false)
const isSaving = ref(false)

const fetchUser = async id => {
  isLoading.value = true
  try{
    const ret = await axiosIns.get(`users/${id}` )

    users.value = ret.data.data[0]
    username.value= users.value.username
    personName.value = users.value.person.name
    roleName.value = Array.from(users.value.roles).length = [] ? roleName.value = '' : roleName.value = users.value.roles[0].name
    isLoading.value = false
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: themeConfig.app.title,
      text: "Get data user failed.",
      icon: 'error',
    })
    console.log(error)
  }
}

const fetchRole = async () => {
  try {
    const ret = await axiosIns.get('/roles' )

    roles.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Fail to create User',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchUser(userId.value),
  fetchRole()
})

const onSubmit = () => {
  userForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) {
      setRole(userId.value)
    } 
  })
}

const setRole = async id => {
  isSaving.value = true
  try {
    const ret = await axiosIns.patch(`users/role/${id}`, {
      'username' : username.value,
      'role': roleName.value,
    } )

    isSaving.value = false
    router.push({ name: 'user' })
  } catch (error) {
    isSaving.value = false
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Set role failed',
      icon: 'error',
    })
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="isSaving">
        <VCardText>
          <VForm
            ref="userForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="username"
                  label="Username"
                  :rules="[requiredValidator]"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            
            <VRow>
              <VCol
                cols="6"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="personName"
                  label="Person"
                  :rules="[requiredValidator]"
                  readonly="true"
                />
              </VCol>
              <VCol
                cols="6"
                class="d-flex gap-3"
              >
                <VSelect 
                  v-model="roleName"
                  :items="roles"
                  item-title="name"
                  item-value="name"
                  single-line
                  clearable
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VSpacer class="mt-4" />
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  color="warning"
                  :to="{ name: 'user'}"
                >
                  Cancel
                </VBtn>
                <VBtn
                  color="success"
                  @click="onSubmit"
                >
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
