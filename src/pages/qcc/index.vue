<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'


const toast = useToast()
const perPage = ref(10)
const currentPage = ref(1)
const total = ref(0)
const last = ref(0)
const from = ref(1)
const to = ref(10)
const qccs = ref()
const showLoading = ref(false)

const fetchQcc = async (page, perPage, find) => {
  showLoading.value = false
  try {
    const ret = await axiosIns.get('/qcc/qccs', {
      params: {
        page: page, 
        per_page: perPage, 
        find: find,
      },
    })

    qccs.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error(error.response)
  } finally {
    showLoading.value = false
  }
}

const status = ref(0)

const statuses = ref([
  {
    id: 0,
    name: 'Created',
  },
  {
    id: 1,
    name: 'Submitted',
  },
  {
    id: 5,
    name: 'Closed',
  },
  {
    id: 9,
    name: 'Reject',
  },
])

const find = ref()
const findText = ref()

const findTextHanlder = () => {
  find.value = findText.value
}

watchEffect(()=>{
  fetchQcc(currentPage.value, perPage.value, find.value)
})

const deleteData = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/qcc/qccs/${id}` )

    fetchCircle(page.value, perPage.value, find.value)
  } catch (error) {
    toast.error('Gagal hapus data')
  } finally {
    showLoading.value = false
  }
}

const btnDeleteClickHandler = () => {
  Swal.fire({
    title: themeConfig.app.title,
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


const submitBtnHandler = id => {
  Swal.fire({
    title: themeConfig.app.title,
    text: 'Sure submit data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes!',
  }).then(ret => {
    if(ret.isConfirmed) {
      submit(id)
    }
  })
}

const submit = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.post(`/qcc/submits/${id}`, {} )

    ret.data.status ? toast.success('Sukses submit data') : toast.error('Gagal post data!')
  } catch (error) {
    
  } finally {
    showLoading.value = false
    fetchQcc(currentPage.value, perPage.value, find.value)
  }
}


const downloadQcc = async id => {
  try {
    const response = await axiosIns.get(`qcc/download/register/qccs/`, {
      params: {
        id: id,
      },
     
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    
    const link = document.createElement('a')

    link.href = url

    link.setAttribute('download', `Form QCC-001 Registrasi & Rencana QCC.xlsx`) 
    document.body.appendChild(link)
    link.click() 

    URL.revokeObjectURL(url)
    document.body.removeChild(link) 

  } catch (error) {
    console.error('Error downloading', error)
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <div
            class="d-flex gap-2"
            style="width: 15rem;"
          >
            <VSelect 
              v-model="status"
              label="Status"
              :items="statuses"
              item-title="name"
              item-value="id"
              clearable
            />
          </div>
          <VTextField
            v-model="findText"
            placeholder="Search.."
            @keydown.enter="findTextHanlder"
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="none"
              color="warning"
              @click="findTextHanlder"
            />
            <VBtn
              prepend-icon="tabler-plus"
              :to="{name: 'qcc-add'}"
            >
              Add Record
            </VBtn>
          </div>
        </VCardText>
        <VTable>
          <thead
            class="text-uppercase"
            style="background-color: #efefef"
          >
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th>Tema</th>
              <th>Diajukan Oleh Cirlce</th>
              <th>Area Kerja</th>
              <th>Deskripsi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in qccs"
              :key="data.id"
            >
              <td>{{ data.code }}</td>
              <td>{{ data.name }}</td>
              <td>{{ data.theme }}</td>
              <td>{{ data.circle.name }}</td>
              <td>{{ data.work_area }}</td>
              <td>{{ data.note }}</td>
              <td>{{ data.status_name }}</td>
              <td style="width: 8rem;">
                <div class="d-flex justify-start">
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="x-small"
                    :to="{name: 'qcc-id', params:{id: data.id}}"
                    :disabled="data.status !== 0"
                  >
                    <VIcon
                      :size="22"
                      icon="tabler-pencil"
                    />
                  </VBtn>
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="x-small"
                    :disabled="data.status !== 0"
                    @click="btnDeleteClickHandler(data.id)"
                  >
                    <VIcon
                      :size="22"
                      icon="tabler-trash"
                    />
                  </VBtn>
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
                        <VListItem
                          value="user"
                          @click="downloadQcc(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"
                              icon="tabler:download"
                            />
                          </template>
                          <VListItemTitle>Download Form</VListItemTitle>
                        </VListItem>    

                        <VListItem
                          value="user"
                          :disabled="data.status !== 0"
                          @click="submitBtnHandler(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"
                              icon="tabler-check"
                            />
                          </template>
                          <VListItemTitle>Submit</VListItemTitle>
                        </VListItem> 
                        <VListItem
                          value="user"
                          :to="null"
                        >
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"
                              icon="tabler:address-book-off"
                            />
                          </template>
                          <VListItemTitle>Reject</VListItemTitle>
                        </VListItem> 
                        <VDivider />
                        <VListItem
                          value="user"
                          :to="{ name: 'qcc-meeting-invitation-fromqcc-id', params:{id: data.id}}"
                        >
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"
                              icon="tabler-calendar"
                            />
                          </template>
                          <VListItemTitle>Meeting Invitation</VListItemTitle>
                        </VListItem>    
                        <VListItem
                          value="user"
                          :to="{ name: 'qcc-meeting-detail-id', params:{id: data.id}}"
                        >
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"
                              icon="tabler:users-group"
                            />
                          </template>
                          <VListItemTitle>Meeting</VListItemTitle>
                        </VListItem>    
                        <VDivider />
                        <VListItem
                          value="user"
                          :to="null"
                        >
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"  
                              icon="tabler:circle-minus"
                            />
                          </template>
                          <VListItemTitle>Close</VListItemTitle>
                        </VListItem>
                      </VList>
                    </VMenu>
                  </VBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
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
