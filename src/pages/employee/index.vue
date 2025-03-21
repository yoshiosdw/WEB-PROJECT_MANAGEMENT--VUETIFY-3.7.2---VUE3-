<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { useEmployee } from './useEmployeeStore'

const employees = ref()
const employeeStore = useEmployee()
const totalEmployee = ref(0)
const page = ref(1)
const perPage = ref(10)
const last = ref(0)
const find = ref()

const showLoading = ref(false)

const fetchEmployee = async(page, perPage, find) => {
  showLoading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,
    }

    const ret = await axiosIns.get('/employment/employees', {
     
      params: params,
    })

    showLoading.value = false
    employees.value = ret.data.data
    employeeStore.employees = ret.data.data
    totalEmployee.value = ret.data.meta.total 
    last.value = ret.data.meta.last
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      icon: 'error',
      text: error,
    })
    showLoading.value = false
  }
}

const findText = ref()

const search = () => {
  find.value = findText.value
}

watchEffect(() => {
  fetchEmployee(page.value, perPage.value, find.value)
})


const deleteData = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/employment/employees/${id}` )

    fetchEmployee(page.value, perPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Error deleting data',
      icon: 'error',
    })
    console.log(error)
    showLoading.value = false
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id) 
    }
  })
}

const paginationData = computed(() => {
  const firstIndex = totalEmployee.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalEmployee.value ? totalEmployee.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalEmployee.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard>
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <VTextField
            v-model="findText"
            label="Search"
            @keydown.enter="search"
          />
          <VBtn
            prepend-icon="tabler:plus"
            :to="{ name: 'employee-add' }"
          >
            Add Employee
          </VBtn>
        </VCardText>

        <VCardText>
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef"
            >
              <tr>
                <th scope="col">
                  NIK
                </th>
                <th scope="col">
                  Nama
                </th>
                <th scope="col">
                  Phone Number
                </th>
                <th scope="col">
                  Gender
                </th>
                <th scope="col">
                  Company Email
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in employees"
                :key="data.id"
              >
                <td>{{ data.person.nik }}</td>
                <td>{{ data.person.name }}</td>
                <td>{{ data.person.phone_number }}</td>
                <td>{{ data.person.gender_name }}</td>
                <td>{{ data.company_email }}</td>
                <td style="width: 8rem;">
                  <div class="d-flex justify-start">
                    <VBtn
                      icon
                      variant="text"
                      color="default"
                      size="x-small"
                    >
                      <VIcon
                        :size="22"
                        icon="tabler-dots-vertical"
                      />
  
                      <VMenu
                        v-if="data.id"
                        activator="parent"
                      >
                        <VList>
                          <VListItem
                            value="duplicate"
                            :to="{ name: 'employee-id', params: {id : data.id}}"
                          >
                            <template #prepend>
                              <VIcon
                                color="warning"
                                size="24"
                                class="me-3"
                                icon="tabler-pencil"
                                label="edit"
                              />
                            </template>
  
                            <VListItemTitle>Edit</VListItemTitle>
                          </VListItem>
                          
                          <VListItem
                            value="duplicate"
                            @click="btnDeleteClickHandler(data.id)"
                          >
                            <template #prepend>
                              <VIcon
                                color="error"
                                size="24"
                                class="me-3"
                                label="delete"
                                icon="tabler-trash"
                              />
                            </template>
  
                            <VListItemTitle>Delete</VListItemTitle>
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
    subject: Person
    redirectIfLoggedIn: false
  </route>
