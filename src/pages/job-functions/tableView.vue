<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'


const jobFunctions = ref([])
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const currentPage = ref(0)
const fromRecord = ref(0)
const toRecord = ref(0)
const totalJobFunctions = ref(0)

const find = ref('')
const findText = ref('')

const loading = ref(false)

const fetchJobFunctions = async (page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/job/functions', {
     
      params:{
        find: find, 
        page: page,
        perPage: perPage,
      },
    })

    jobFunctions.value = ret.data.data
    currentPage.value = ret.data.meta.current_page
    fromRecord.value = ret.data.meta.from
    toRecord.value = ret.data.meta.to
    totalJobFunctions.value = ret.data.meta.total
    last.value = ret.data.meta.last
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load Organization data ',
      icon: 'error',
    })
    console.log(error)
    loading.value = false
  }
}

const findJobFunctions = () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/job/functions/${id}` )

    fetchJobFunctions(page.value, perPage.value, find.value )
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.titile,
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
  fetchJobFunctions(page.value, perPage.value, find.value )
})

const paginationData = computed(()=>{
  return `Showing ${fromRecord.value} to ${toRecord.value} of ${totalJobFunctions.value}`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay :loading="loading" />
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
            placeholder="Search Job Function"
            @keydown.enter="findJobFunctions"
          />
          
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @click="findJobFunctions"
            />
            
            <VBtn
              prepend-icon="tabler-plus"
              :to="{name: 'job-functions-add'}"
            >
              Add Record
            </VBtn>
          </div>
        </VCardText>
        <VDivider />
        <VCardText>
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef;"
            >
              <tr>
                <th scope="col">
                  Code
                </th>
                <th scope="col">
                  Name
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="job in jobFunctions"
                :key="job.id"
              >
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ job.code }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ job.name }}</p>
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
  
                            <VListItemTitle @click="btnDeleteClickHandler(org.guid)">
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
