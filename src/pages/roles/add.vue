<script setup>
  import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import router from '@/router'
import Swal from 'sweetalert2'

  const permissions = ref()

  const selectedPermissions = ref([])

  const fetchPermissions =  async () => {
    try {
      const response = await axiosIns.get('/permissions', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
        }
      })
      permissions.value = response.data.data
    } catch (error) {
      Swal.fire({
        title: 'LBG',
        text: error, 
        icon: 'error'
      })
    }
  }

  watchEffect(() => {
    fetchPermissions()
  })

  const roleForm = ref()
  const name = ref('')
  const roleId = ref(null)
  const isSaved = ref(false)  

  const errors = ref({
    name: undefined
  })

  const createRole = async () => {
    try {
      const ret = await axiosIns.post('/roles', {
        name: name.value
      }, {
        headers: {
          'Authorization': 'Bearer '+localStorage.getItem('sinarjoAccessToken')
        }
      })
      roleId.value = ret.data.data.id
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
        createRole()
      } 
    })
  }

  const syncPermission = async data => {
    try {
      const ret = await axiosIns.post('/roles/permissions/sync', {
        role: roleId.value,
        permissions: data
      }, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
        }
      })
      router.push({ name: 'roles'})
    } catch (error) {
      Swal.fire({
        text: 'Set permission failed',
        title:'LBG',
        icon: 'error'
      })
      console.log(error);
    }
  }

</script>
<template>
  <VRow>
    <VCol cols="12">
      <VCard class="headline" :loading=!isSaved  title="Adding Role">
        <VCardText>
          <VForm ref="roleForm" @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="12">
                <VTextField 
                  v-model="name"
                  label="Role Name"
                  :rules="[requiredValidator]"
                  :error-messages="errors.name"
                ></VTextField>
              </VCol>
            </VRow>
          </VForm>
          <div class="d-flex justify-end gap-4 mt-5">
            <VBtn v-if="!isSaved" color="warning" :to="{ name: 'roles'}">Cancel</VBtn>
            <VBtn v-if="!isSaved" @click="onSubmit">Save</VBtn>
            <VBtn v-if="isSaved" color="success" :to="{ name: 'roles'}">Close</VBtn>
          </div>
        </VCardText>
      </VCard>
      <VSpacer class="d-flex mt-5"/>
      <VCard v-if="isSaved" title="Permissions">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <div class="d-flex flex-wrap gap-4">
                <VTextField placeholder="Search Permissions"/>
              </div>
              <div class="d-flex mt-4 mb-4">
                <h4>Permissions List</h4>
              </div>
              
              <div class="mt-3 gap-4 my-card">
                <VTable class="text-no-wrap">
                  <thead class="text-uppercase">
                    <tr>
                      <th scope="col">Feature</th>
                      <th scope="col">Action</th>
                      <th scope="col">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="permission in permissions" :key="permission.id">
                      <td>{{ permission.feature }}</td>
                      <td>{{ permission.access }}</td>
                      <td>
                        <div>
                          <VCheckbox 
                            :id="permission.id"
                            :value="permission.name"
                            v-model="selectedPermissions"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </VTable>
              </div>
              <div class="d-flex justify-end mt-5">
                <VBtn @click="syncPermission(selectedPermissions)">Save</VBtn>
              </div>
            </VCol>
          </VRow>
          
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
