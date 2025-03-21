<script setup>
import axiosIns from '@/plugins/axios'
import ability from '@/plugins/casl/ability'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { useUserStore } from './useUserStore'

const userStore = useUserStore()
const showLoading = ref(false)
const users = ref()
const totalUsers = ref(0)
const page = ref(1)
const perPage = ref(10)
const last = ref(0)
const find = ref('')
const findText = ref('')

const fetchUser = async (page, perPage, find) => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/users', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    users.value = ret.data.data
    totalUsers.value = ret.data.meta.total
    last.value = ret.data.meta.last
    showLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load data',
      icon: 'error',
    })
    console.log(error)
    showLoading.value = false
  }
}

watchEffect(()=>{
  fetchUser(page.value, perPage.value, find.value)
})

const findUser = async() => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const deactiveData = async id => {
  try {
    const ret = await axiosIns.patch(`/users/deactivate/${id}`, {})

    fetchUser(page.value, perPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Error deactive data',
      icon: 'error',
    })
    console.log(error)
  }
}

const activeData = async id => {
  try {
    const ret = await axiosIns.patch(`/users/activate/${id}`, {})

    fetchUser(page.value, perPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Error activate data',
      icon: 'error',
    })
    console.log(error)
  }
}

const removeRole = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.patch(`users/role/remove/${id}`, {} )

    fetchUser(page.value, perPage.value, find.value)
    showLoading.value = false
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Fail to remove role',
      icon: 'error',
    })
    console.log(error)
  }
}

const removeRoleClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure to remove role from user?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, remove it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      removeRole(id)
    }
  })
}

const deactivateUserClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure deactivate user?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, deactive it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      deactiveData(id)
    }
  })
}

const activateUserClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure activate user?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, activate it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      activeData(id)
    }
  })
}

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalUsers.value}`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <VTextField
            v-model="findText"
            placeholder="Search user"
            @keydown.enter="findUser"
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @click="findUser"
            />
            
            <VBtn
              :to="{name: 'user-add'}"
              prepend-icon="tabler-plus"
            >
              Add User
            </VBtn>
          </div>
        </VCardText>
        <VDivider />
        <VCardText>
          <VTable>
            <thead class="text-uppercase">
              <tr>
                <th scope="col">
                  Name
                </th>
                <th scope="col">
                  Username
                </th>
                <th scope="col">
                  Role
                </th>
                <th scope="col">
                  Email
                </th>
                <th scope="col">
                  Status
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
              >
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ user.person.name }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ user.username }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p v-if="user.roles[0]">
                      {{ user.roles[0].name }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ user.person.email }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ user.statusName }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-center">
                    <VBtn 
                      icon
                      variant="none"
                      density="compact"
                      color="success"
                    >
                      <VIcon icon="tabler-dots-vertical" />
                      <VMenu activator="parent">
                        <VList width="15rem">
                          <VListItem
                            v-if="1 == 2"
                            :to="{ name: 'user-id', params: {id: user.id} }"
                          >
                            <!-- <VListItem :to="{ name: 'user-id', params: {id: user.id} }" v-if="ability.can('Manage', 'User')"> -->
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-pencil" 
                                variant="primary" 
                                density="compact"
                                color="success"
                              />
                              Edit
                            </VListItemTitle>
                          </VListItem>
                            
                          <VListItem
                            v-if="user.status == 1"
                            :to="{ name: 'user-role', params: {role: user.id} }"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-lock" 
                                variant="primary" 
                                density="compact"
                                color="success"
                              />
                              Update Role
                            </VListItemTitle>
                          </VListItem>
                          <VListItem
                            v-if="user.status == 1 && user.roles.length == 1"
                            @click="removeRoleClickHandler(user.id)"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-lock" 
                                variant="primary" 
                                density="compact"
                                color="error"
                              />
                              Remove Role
                            </VListItemTitle>
                          </VListItem>

                          <VDivider />
                          <VListItem
                            v-if="user.status == 1 && ability.can('Manage', 'User')"
                            @click="deactivateUserClickHandler(user.id)"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-trash" 
                                variant="primary" 
                                density="compact"
                                color="error"
                              />
                              Deactive
                            </VListItemTitle>
                          </VListItem>
                          <VListItem
                            v-if="user.status == 0 && ability.can('Manage', 'User')"
                            @click="activateUserClickHandler(user.id)"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler:circle-check" 
                                variant="primary" 
                                density="compact"
                                color="success"
                              />
                              Activate
                            </VListItemTitle>
                          </VListItem>
                        </VList>
                      </VMenu>
                    </VBtn>
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">
            {{ paginationData }}
          </span>

          <VPagination
            v-model="page"
            size="small"
            :total-visible="5"
            :length="last"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: User
  redirectIfLoggedIn: false
</route>
