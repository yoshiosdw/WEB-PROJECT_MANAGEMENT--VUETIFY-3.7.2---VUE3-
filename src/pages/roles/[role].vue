<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'


const role = ref()
const permissions = ref()
const selectedPermissions = ref([])
const loading = ref(true)
const find = ref()

const assignedPermissionsData = ref()

const route = useRoute()
const roleId = route.params.role 

const roleForm = ref()
const name = ref('')

const errors = ref({
  name: undefined,
})

const fetchPermissions = async (id, find) => {
  try {
    const permissionsData = await axiosIns.get('/permissions', {
     
      params: {
        find: find,
      },
    })

    permissions.value = permissionsData.data.data
    
    
    const assignedPermissions = await axiosIns.get(`/roles/${id}` )
    
    selectedPermissions.value = assignedPermissions.data.data[0].permissions.map(item => item.name)
    name.value = assignedPermissions.data.data[0].name
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Error fetching data',
      icon: 'error',
    })
    console.log(error)
  }
}

const updateRole = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.patch(`/roles/${id}`, {
      name: name.value,
    }, {
      headers: {
        'Authorization': 'Bearer '+localStorage.getItem('sinarjoAccessToken'),
      },
    })

    loading.value = false
  } catch (error) {
    Swal.fire({
      text: response.data.message, 
      title: 'Lidah Buaya',
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

const onSubmit = () => {
  roleForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) {
      updateRole(roleId)
    } 
  })
}

const syncPermission = async data => {
  loading.value = true
  try {
    const ret = await axiosIns.post('/roles/permissions/sync', {
      role: roleId,
      permissions: data,
    } )

    loading.value = false
  } catch (error) {
    Swal.fire({
      text: 'Set permission failed',
      title:'LBG',
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

watchEffect(()=>{
  fetchPermissions(roleId, find.value)
},
)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <div
        v-if="loading"
        class="text-center"
      >
        <VProgressCircular
          :size="70"
          :width="7"
          color="primary"
          indeterminate
        />
      </div>
      <VCard
        v-if="!loading"
        title="Role"
      >
        <VCardText>
          <VForm
            ref="roleForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <VTextField 
                  v-model="name"
                  label="Role Name"
                  :rules="[requiredValidator]"
                  :error-messages="errors.name"
                />
              </VCol>
            </VRow>
          </VForm>
          <div class="d-flex justify-end gap-4 mt-5">
            <VBtn
              color="warning"
              :to="{ name: 'roles'}"
            >
              Close
            </VBtn>
            <VBtn @click="onSubmit">
              Save
            </VBtn>
          </div>
        </VCardText>
      </VCard>
      <VSpacer class="d-flex mt-5" />
      <VCard
        v-if="!loading"
        title="Permissions List"
      >
        <VCardText>
          <VTextField
            v-model="find"
            label="Find Permission"
          />
          <div class="mt-3 gap-4 my-card">
            <VTable class="text-no-wrap">
              <thead class="text-uppercase">
                <tr>
                  <th scope="col">
                    Feature
                  </th>
                  <th scope="col">
                    Action
                  </th> <th scope="col">
                    Description
                  </th>
                  <th scope="col">
                    Select
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="permission in permissions"
                  :key="permission.id"
                >
                  <td>{{ permission.feature }}</td>
                  <td>{{ permission.access }}</td>
                  <td>{{ permission.description || '' }}</td>
                  <td>
                    <div>
                      <VCheckbox
                        :id="permission.name"
                        v-model="selectedPermissions"
                        :value="permission.name"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </div>
          <div class="d-flex justify-end mt-5">
            <VBtn @click="syncPermission(selectedPermissions)">
              Sync
            </VBtn>
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
