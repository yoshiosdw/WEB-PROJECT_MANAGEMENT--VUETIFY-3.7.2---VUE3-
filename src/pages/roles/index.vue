<script setup>
import axiosIns from '@/plugins/axios';
import Swal from 'sweetalert2';
  
  const roles = ref(null)
  const totalRoles = ref(0)
  const page = ref(1)
  const perPage = ref(10)
  const find = ref(null)

  const showLoading = ref(false)

  const fetchRoles = async (page, perPage, find) => {
    showLoading.value = true
    try {
      const ret = await axiosIns.get('/roles', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
        },
        params: {
          page: page, 
          perPage: perPage, 
          find: find
        }
      })
      roles.value = ret.data.data
      showLoading.value = false
    } catch (error) {
      Swal.fire({
        title: 'LBG',
        text: error,
        icon: 'error'
      })
      showLoading.value = false
      console.log(error);
    }
  }

  const deleteRoleHandler =  (id) => {
    Swal.fire({
      title: 'LBG',
      text: 'Delete Role?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'primary',
      cancelButtonColor: 'warning',
      confirmButtonText: 'YES, Delete it!'
    }).then( async (ret) => {
      if(ret.isConfirmed){
        try {
          showLoading.value = true
          const ret = await axiosIns.delete(`/roles/${id}`, {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
            }
          })
          
          fetchRoles()
        } catch (error) {
          Swal.fire({
            title: 'LBG',
            text: error.response.data.message,
            icon: 'error'
          })
          console.log(error);
          showLoading.value = false
        }
      }
    })
  }

  watchEffect(() => {
    fetchRoles( page.value, perPage.value, find.value)
  })

</script>
<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardText class="d-flex gap-4" >
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <VTextField placeholder="Search Role" v-model="find"/>
          <VBtn  :to="{ name: 'roles-add'}"> Add New Role </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    
    <VCol v-for="role in roles" :key="role.id" cols="4">
      <VCard>
        <VCardText>
          <div class="d-flex align-center justify-space-between" >
            <h4>{{ role.name }}</h4>
          </div>
          <small>Total User: 0</small><br>
          <div class="d-flex justify-end gap-4">
            <VBtn  icon="tabler-pencil" variant="tonal" size="10" :to="{ name: 'roles-role', params:{role: role.id}}"/>
            <VBtn v-if="role.name !='administrator'" icon="tabler-trash" color="error" variant="tonal" size="10" @click="deleteRoleHandler(role.id)"/>
          </div>
          <!-- <router-link :to="{ name: 'roles-role', params:{role: role.id}}" class="d-flex mt-5">Edit Role</router-link>           -->
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
