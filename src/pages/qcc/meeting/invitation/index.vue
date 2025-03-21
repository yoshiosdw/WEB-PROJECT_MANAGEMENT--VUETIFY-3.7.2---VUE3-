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
const invitations = ref()
const showLoading = ref(false)
const isVisible = ref(false)

const status = ref(0)
const find = ref()
const findText = ref()

const attendance = ref()
const notulen = ref()

const refAttachForm = ref()


const fetchMeeting = async (page, perPage, find) => {
  showLoading.value = false
  try {
    const ret = await axiosIns.get('/qcc/meeting/invitations', {
      params: {
        page: page, 
        per_page: perPage, 
        find: find,
      },
    })

    invitations.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error(error.response)
  } finally {
    showLoading.value = false
  }
}

const findTextHanlder = () => {
  find.value = findText.value
}

watchEffect(()=>{
  fetchMeeting(currentPage.value, perPage.value, find.value)
})

const deleteData = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/qcc/meeting/invitations/${id}` )

    fetchMeeting(currentPage.value, perPage.value, find.value)

  } catch (error) {
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

const rejectedData = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.post(`/qcc/meeting/invitations/rejected/${id}`,null )

    fetchMeeting(currentPage.value, perPage.value, find.value)

  } catch (error) {
    toast.error('Failed Reject data')
  } finally {
    showLoading.value = false
  }
}

const btnRejected = id => {
  Swal.fire({
    title: themeConfig.app.title,
    text: 'Sure Closed data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, Close it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      rejectedData(id)
    }
  })
}

const sentInvitation = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.post(`/qcc/meeting/invitations/sent/${id}`,null )

    fetchMeeting(currentPage.value, perPage.value, find.value)

  } catch (error) {
    toast.error('Gagal hapus data')
  } finally {
    showLoading.value = false
  }
}

const formInvitation = async id => {
  try {
    const response = await axiosIns.get(`qcc/download/invitations`, {
      params: {
        id: id,
      },
     
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    
    const link = document.createElement('a')

    link.href = url

    link.setAttribute('download', `Form Meeting Invitation.xlsx`) 
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
              :to="{name: 'qcc-meeting-invitation-add'}"
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
              <th class="text-no-wrap">
                Diajukan Oleh Circle
              </th>
              <th class="text-no-wrap">
                Tema
              </th>
              <th class="text-no-wrap">
                Tempat Meeting
              </th>
              <th class="text-no-wrap">
                Tanggal Meeting
              </th>
              <th class="text-no-wrap">
                Jam Meeting
              </th>
              <th class="text-no-wrap">
                Status
              </th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in invitations"
              :key="data.id"
            >
              <td>{{ data.circle?.name }}</td>
              <td>{{ data.qcc_line_id }}</td>
              <td>{{ data.meeting_room?.name }}</td>
              <td>{{ data.plan_date }}</td>
              <td>{{ data.plan_hour }}</td>
              <td>{{ data.status_name }}</td>

              <td style="width: 8rem;">
                <div class="d-flex justify-start">
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="x-small"
                    :to="{name: 'qcc-meeting-invitation-id', params:{id: data.id}}"
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
                    :disabled="data.status === 9"
                  >
                    <VIcon
                      :size="22"
                      icon="tabler-dots-vertical"
                    />

                    <VMenu activator="parent">
                      <VList>
                        <VListItem
                          value="user"
                          @click="formInvitation(data.circle_id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"
                              icon="tabler-download"
                            />
                          </template>
                          <VListItemTitle>Download Form</VListItemTitle>
                        </VListItem> 
                        <VListItem
                          value="user"
                          :disabled="data.status !== 0"
                          @click="sentInvitation(data.id)"
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
                        <VDivider />
                        <VListItem
                          value="user"
                          :disabled="data.status !== 1"
                          @click="btnRejected(data.id)"
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

    <!--
      <VDialog 
      v-model="isVisible" 
      width="550" 
      transition="dialog-bottom-transition" 
      persistent
      >
      <DialogCloseBtn @click="isVisible = !isVisible" />
      <VCard>
      <VCardTitle>Upload Attachment</VCardTitle>
      <VCardText>
      <VForm
      ref="refAttachForm"
      @submit.prevent="onSubmit"
      >
      <VRow>
      <VCol cols="6">
      <VFileInput
      label="Upload Notulen"
      accept=".pdf,.xls,.xlsx,.jpg"
      @change="(e) => handleFileChange(e, 'notulen')"
      />
      </VCol>
      <VCol cols="6">
      <VFileInput
      label="Upload Attendance"
      accept=".pdf,.xls,.xlsx,.jpg"
      @change="(e) => handleFileChange(e, 'attendance')"
      />
      </VCol>
      </VRow>

      <div class="d-flex mt-6 gap-4 justify-end">
      <VBtn
      color="warning"
      @click="cancelClickHandler"
      >
      Cancel
      </VBtn>
      <VBtn
      color="primary"
      type="submit"
      >
      Save
      </VBtn>
      </div>
      </VForm>
      </VCardText>
      </VCard>
      </VDialog> 
    -->
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
