<script setup>
import permission from '@/pages/lookup/permissions.vue';
import axiosIns from '@/plugins/axios';
import Swal from 'sweetalert2';

  const categoryForm = ref()
  const name = ref('')
  const isSaved = ref(false)  
  const departmentInCharge = ref()

  const errors = ref({
    name: undefined
  })

  const createCategory = async () => {
    try {
      const ret = await axiosIns.post('/return/categories', {
        name: name.value,
        department_in_charge: departmentInCharge.value,
        permission: selectedPermission.value
      }, {
        headers: {
          'Authorization': 'Bearer '+localStorage.getItem('sinarjoAccessToken')
        }
      })
      isSaved.value = true
    } catch (error) {
      Swal.fire({
        text: response.data.message, 
        title: 'Lidah Buaya',
        icon: 'error'
      })
      console.log(error);
    }
  }

  const onSubmit = () => {
    roleForm.value?.validate().then(({ valid: isValid}) => {
      if(isValid) {
        createCategory()
      } 
    })
  }


</script>
<template>
  <VRow>
    <VCol cols="12">
      <VCard class="headline" :loading=!isSaved  title="Create Category">
        <VCardText>
          <VForm ref="categoryForm" @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="12">
                <VTextField 
                  v-model="name"
                  label="Category Name"
                  :rules="[requiredValidator]"
                  :error-messages="errors.name"
                ></VTextField>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VSelect :items="['BOA', 'FINANCE', 'MANUFACTURE', 'LOGISTIC', 'WAREHOUSE']"
                  v-model="departmentInCharge" clearable
                  label="Department In Charge"
                />
              </VCol>
              <VCol cols="6">
                <div class="d-flex gap-3">
                  <VTextField/>
                  <permission />
                </div>
              </VCol>
            </VRow>
          </VForm>
          <div class="d-flex justify-end gap-4 mt-5">
            <VBtn v-if="!isSaved" color="warning" :to="{ name: 'retur-category'}">Cancel</VBtn>
            <VBtn v-if="!isSaved" @click="onSubmit">Save</VBtn>
            <VBtn v-if="isSaved" color="success" :to="{ name: 'retur-category'}">Close</VBtn>
          </div>
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

<style scoped>
  .my-card {
    height: calc(55vh - 200px);
    overflow-y: auto;
  }
</style>