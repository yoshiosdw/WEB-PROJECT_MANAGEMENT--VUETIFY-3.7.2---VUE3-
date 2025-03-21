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
const circles = ref()
const showLoading = ref(false)

const fetchCircle = async (page, perPage, find) => {
  showLoading.value = false
  try {
    const ret = await axiosIns.get('/qcc/circles', {
      params: {
        page: page, 
        per_page: perPage, 
        find: find,
      },
    })

    circles.value = ret.data.data
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
    id: 1,
    name: 'Non Aktive',
  },
  {
    id: 0,
    name: 'Active',
  },
])

const find = ref()
const findText = ref()

const findTextHanlder = () => {
  find.value = findText.value
}

watchEffect(()=>{
  fetchCircle(currentPage.value, perPage.value, find.value)
})

const deleteData = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/qcc/circles/${id}` )

    fetchCircle(currentPage.value, perPage.value, find.value)
  } catch (error) {
    console.log(error)
    toast.error('Gagal hapus data')
  } finally {
    showLoading.value = false
  }
}

const btnDeleteClickHandler = id => {
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
              :to="{name: 'qcc-circle-add'}"
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
              <th>Tanggal Dibentuk</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in circles"
              :key="data.id"
            >
              <td>{{ data.code }}</td>
              <td>{{ data.name }}</td>
              <td>{{ data.formed_on }}</td>
              <td style="width: 8rem;">
                <div class="d-flex justify-start">
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="x-small"
                    :to="{name: 'qcc-circle-id', params:{id: data.id}}"
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
                        <VListItem value="user">
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"
                              icon="tabler:bulb"
                            />
                          </template>
                          <VListItemTitle>Submit QCC</VListItemTitle>
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
                              icon="tabler-calendar"
                            />
                          </template>
                          <VListItemTitle>Meeting</VListItemTitle>
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
