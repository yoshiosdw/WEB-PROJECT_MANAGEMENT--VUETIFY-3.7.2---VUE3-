<script setup>
import { requiredValidator } from '@/@core/utils/validators';
import permission from '@/pages/lookup/permissions.vue';
import axiosIns from '@/plugins/axios';
import router from '@/router';
import { themeConfig } from '@themeConfig';
import Swal from 'sweetalert2';
import { useRoute } from 'vue-router';

  const route = useRoute();
  const id = ref(route.params.id)
  const categories = ref()
  const categoryName = ref()
  const selectedPermission = ref()
  const categoryForm = ref()
  const name = ref('')
  const isSaved = ref(false)  
  const departmentInCharge = ref()

  const errors = ref({
    name: undefined
  })

  const fetchReturCategories = async id => {
    try {
      const ret = await axiosIns.get(`return/categories/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
        }
      })
      categories.value = ret.data.data
      categoryName.value = categories.value[0].name
      departmentInCharge.value = categories.value[0].department_in_charge
    } catch (error) {
      Swal.fire({
        title: themeConfig.app.title,
        text: 'Fail to load data',
        icon: 'error'
      })
      router.push({ name: 'retur'})
    }
  }

  const getSelectedPermission = permission => {
    selectedPermission.value = permission.name
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
    fetchReturCategories(id.value)
  })

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
                  v-model="categoryName"
                  label="Category Name"
                  :rules="[requiredValidator]"
                  :error-messages="errors.name"
                  readonly="true"
                ></VTextField>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VTextField v-model="departmentInCharge" readonly="true"/>
              </VCol>
              <VCol cols="6">
                <div class="d-flex gap-3">
                  <VTextField readonly="true" v-model="selectedPermission" :rules="[requiredValidator]"/>
                  <permission @permission="getSelectedPermission"/>
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