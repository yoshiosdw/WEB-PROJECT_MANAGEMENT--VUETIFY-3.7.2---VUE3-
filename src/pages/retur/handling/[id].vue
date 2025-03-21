<script setup>
import { requiredValidator } from '@/@core/utils/validators';
import axiosIns from '@/plugins/axios';
import router from '@/router';
import { themeConfig } from '@themeConfig';
import Swal from 'sweetalert2';
import { useRoute } from 'vue-router';

  const route = useRoute();
  const id = ref(route.params.id)
  const handlingForm = ref()
  
  const handling = ref()
  const name = ref()
  const departmentInCharge = ref()
  const description = ref()
  const permission = ref()
  const sequence = ref(0)
  const targetDays = ref(1)
  const status = ref(0)
  const isEndTask = ref(false)

  const isSaved = ref(false)  
  const isLoading = ref(false)
  

  const errors = ref({
    name: undefined
  })

  const fetchHandling = async id => {
    isLoading.value = true
    try {
      const ret = await axiosIns.get(`return/handlings/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
        }
      })
      handling.value = ret.data.data
      name.value = handling.value[0].name
      departmentInCharge.value = handling.value[0].department_in_charge
      description.value = handling.value[0].description
      permission.value = handling.value[0].permissions
      sequence.value = handling.value[0].sequence
      targetDays.value = handling.value[0].target_days
      status.value = handling.value[0].status
      isEndTask.value = handling.value[0].is_end_task == 0 ? false : true
      isLoading.value = false
    } catch (error) {
      isLoading.value = false
      Swal.fire({
        title: themeConfig.app.title,
        text: 'Fail to load data',
        icon: 'error'
      })
      router.push({ name: 'retur'})
    }
  }

  const updateCategory = async id => {
    try {
      const ret = await axiosIns.patch(`/return/categories/${id}`, {
        permission: selectedPermission.value
      }, {
        headers: {
          'Authorization': 'Bearer '+localStorage.getItem('sinarjoAccessToken')
        }
      })
      router.push({ name: 'retur-category'})
    } catch (error) {
      Swal.fire({
        text: error.message, 
        title: themeConfig.app.title,
        icon: 'error'
      })
      console.log(error);
    }
  }

  const onSubmit = () => {
    categoryForm.value?.validate().then(({ valid: isValid}) => {
      if(isValid) {
        updateCategory(id.value)
      } 
    })
  }

  watchEffect(()=> {
    fetchHandling(id.value)
  })

</script>
<template>
  <VRow>
    <VOverlay v-model="isLoading" />
    <VCol cols="12">
      <VCard class="headline" :loading=!isSaved  title="Update Handling Type" v-if="!isLoading">
        <VCardText>
          <VForm ref="handlingForm" @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="6">
                <VTextField 
                  v-model="name"
                  label="Name"
                  :rules="[requiredValidator]"
                  :error-messages="errors.name"
                ></VTextField>
              </VCol>
              <VCol cols="6">
                <VTextField 
                  v-model="departmentInCharge"
                  label="Department In Charge"
                  :rules="[requiredValidator]"
                  :error-messages="errors.departmentInCharge"
                ></VTextField>
              </VCol>
            </VRow>
            <VRow>
              
              <VCol cols="6">
                <VTextField 
                  v-model="permission"
                  label="Permission"
                  :rules="[requiredValidator]"
                  :error-messages="errors.departmentInCharge"
                ></VTextField>
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="targetDays"
                  label="Target in Days"
                  :rules="[requiredValidator]"
                  :error-messages="errors.departmentInCharge"
                  type="number" reverse
                />
              </VCol>
              <VCol cols="3">
                <VSwitch v-model="isEndTask" label="End of Task"/>
              </VCol>
            </VRow>
          </VForm>
          <div class="d-flex justify-end gap-4 mt-5">
            <VBtn v-if="!isSaved" color="warning" :to="{ name: 'retur-handling'}">Cancel</VBtn>
            <VBtn v-if="!isSaved" @click="onSubmit">Save</VBtn>
            <VBtn v-if="isSaved" color="success" :to="{ name: 'retur-handling'}">Close</VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
<route lang="yaml">
meta:
  action: Read
  subject: Config
  redirectIfLoggedIn: false
</route>
