<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { usePersonStore } from './usePersonStore'

const personStore = usePersonStore()
const people = ref([])
const totalPeople = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const loading = ref(true)

const fetchPeople = async (page, perPage, find) => {
  loading.value = true
  try {
    const response = await axiosIns.get('/people', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    people.value = response.data.data
    totalPeople.value = response.data.meta.total
    last.value = response.data.meta.last
    loading.value = false
    console.log(response)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: response.data.message,
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

const findPeople = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/people/${id}` )

    fetchPeople(page.value, perPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Error deleting data',
      icon: 'error',
    })
    console.log(error)
    loading.value = false
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

watchEffect(() => {
  fetchPeople(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalPeople.value}`
})

const addButtonClickHandler = () => {
  personStore.person = null
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <VTextField
            v-model="findText"
            placeholder="Search Person"
            @keydown.enter="findPeople"
          />
          
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @click="findPeople"
            />
            
            <VBtn
              v-if="1 == 2"
              :to="{ name: 'person-add'}"
              prepend-icon="tabler-plus"
            >
              Add Person
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
                  Gender
                </th>
                <th scope="col">
                  Address
                </th>
                <th scope="col">
                  City
                </th>
                <th scope="col">
                  Phone Number
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="person in people"
                :key="person.id"
              >
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ person.name }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ person.gender_name }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ person.address }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ person.city }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ person.phone_number }}</p>
                  </div>
                </td>

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
  
                      <VMenu activator="parent">
                        <VList>
                          <VListItem value="user">
                            <template #prepend>
                              <VIcon
                                color="primary"
                                size="24"
                                class="me-3"
                                icon="tabler:lock"
                              />
                            </template>
                            <VListItemTitle>Set Auth</VListItemTitle>
                          </VListItem>
                          <VDivider />
                          <VListItem value="duplicate">
                            <template #prepend>
                              <VIcon
                                color="warning"
                                size="24"
                                class="me-3"
                                icon="tabler-pencil"
                              />
                            </template>
  
                            <VListItemTitle>Edit</VListItemTitle>
                          </VListItem>
                          
                          <VListItem value="duplicate">
                            <template #prepend>
                              <VIcon
                                color="error"
                                size="24"
                                class="me-3"
                                icon="tabler-trash"
                              />
                            </template>
  
                            <VListItemTitle @click="btnDeleteClickHandler(person.id)">
                              Delete
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
  subject: Person
  redirectIfLoggedIn: false
</route>
