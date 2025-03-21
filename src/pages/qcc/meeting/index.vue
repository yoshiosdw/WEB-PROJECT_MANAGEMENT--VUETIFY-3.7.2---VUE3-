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
const meetings = ref()
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
    const ret = await axiosIns.get('/qcc/meetings', {
      params: {
        page: page, 
        per_page: perPage, 
        find: find,
      },
    })

    meetings.value = ret.data.data
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
    const ret = await axiosIns.delete(`/qcc/meetings/${id}` )

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
  }
}

const meetingId = ref()

const openDialog = async id => {
  isVisible.value = true

  meetingId.value = id
}

const handleFileChange = (event, type) => {
  const file = event.target.files[0]
  
  console.log(file.type)

  if (type === 'notulen') {
    notulen.value = file
  } else if (type === 'attendance') {
    attendance.value = file
  }
}

const uploadAttach = async id => {
  try {
    const allowedMimeTypes = ['image/jpg', 'application/pdf', 'application/vnd.ms.excel']
    const formData = new FormData()


    if (notulen.value) {
      formData.append('attached_notulen', notulen.value)
    }

    if (attendance.value) {
      formData.append('attached_attendee', attendance.value)
    }

    const ret = await axiosIns.post(`/qcc/meetings/attachment/${id}`, formData, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
        'Content-Type': 'multipart/form-data',
        'Accept': allowedMimeTypes.join(','),
      },
    })

    isVisible.value = false

    fetchMeeting(currentPage.value, perPage.value, find.value)

  } catch(error) {
    console.log(error)
  }
}

const onSubmit = () => {
  refAttachForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      uploadAttach(meetingId.value)
      isVisible.value = false
    }
  })
}

const cancelClickHandler = () => {
  isVisible.value = false
}

const downloadNotulen = async id => {
  try {
    const response = await axiosIns.get(`qcc/download/moms/`, {
      params: {
        id: id,
      },
     
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    
    const link = document.createElement('a')

    link.href = url

    link.setAttribute('download', `Form Notulen.xlsx`) 
    document.body.appendChild(link)
    link.click() 

    URL.revokeObjectURL(url)
    document.body.removeChild(link) 

  } catch (error) {
    console.error('Error downloading', error)
  }
}

const attendances = async id => {
  try {
    const response = await axiosIns.get(`qcc/download/attendances/`, {
      params: {
        id: id,
      },
     
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    
    const link = document.createElement('a')

    link.href = url

    link.setAttribute('download', `Form Attendance Meeting.xlsx`) 
    document.body.appendChild(link)
    link.click() 

    URL.revokeObjectURL(url)
    document.body.removeChild(link) 

  } catch (error) {
    console.error('Error downloading', error)
  }
}

const resolveAttachVariant = attachment => {
  if (attachment !== null && attachment !== undefined) {
    return {
      text: attachment,
      color: 'success',
    }
  }
  
  return {
    text: 'No Attachment',
    color: 'default',
  }
}


const truncateText = text => {
  if (text) {
    return `${text.substring(0, 6)}...`
  }
  
  return '-'
}

const downloadAttachedNotulen = async id => {
  try {
    const ret = await axiosIns.get(`/qcc/download/notulen/${id}`, {
      responseType: 'blob',
     
    })

    const fileType = ret.headers['content-type']
    
    const blob = new Blob([ret.data], { type: fileType })
    const href = URL.createObjectURL(blob)


    window.open(href, '_blank')

    URL.revokeObjectURL(href)

  } catch(error) {
    toast.error('Failed Download Attached Notulen')
  }
}

const downloadAttachedAttandance = async id => {
  try {
    const ret = await axiosIns.get(`/qcc/download/attend/${id}`, {
      responseType: 'blob',
     
    })

    const fileType = ret.headers['content-type']
    
    const blob = new Blob([ret.data], { type: fileType })
    const href = URL.createObjectURL(blob)


    window.open(href, '_blank')

    URL.revokeObjectURL(href)

  } catch(error) {
    toast.error('Failed Download Attached Notulen')
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
              :to="{name: 'qcc-meeting-add'}"
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
              <th>Aksi</th>
              <th class="text-no-wrap">
                Tanggal Meeting
              </th>
              <th class="text-no-wrap">
                Jam Awal
              </th>
              <th class="text-no-wrap">
                Jam Akhir
              </th>
              <th class="text-no-wrap">
                Ringkasan
              </th>
              <th class="text-no-wrap">
                Catatan Komite
              </th>
              <th>
                Jadwal Meeting Selanjutnya
              </th>
              <th class="text-no-wrap">
                Form Notulen
              </th>
              <th class="text-no-wrap">
                Form Kehadiran
              </th>   
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in meetings"
              :key="data.id"
            >
              <td style="width: 8rem;">
                <div class="d-flex justify-start">
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="23"
                    :to="{name: 'qcc-meeting-id', params:{id: data.id}}"
                  >
                    <VIcon
                      :size="22"
                      icon="tabler-pencil"
                    />
                  </VBtn>
                  <VBtn
                    icon
                    variant="text"
                    color="primary"
                    size="23"
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
                    size="23"
                  >
                    <VIcon
                      :size="22"
                      icon="tabler-dots-vertical"
                    />

                    <VMenu activator="parent">
                      <VList>
                        <VDivider />
                        <VListItem
                          value="user"
                          @click="downloadNotulen(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"
                              icon="tabler-download"
                            />
                          </template>
                          <VListItemTitle>Form Notulen</VListItemTitle>
                        </VListItem>    

                        <VListItem
                          value="user"
                          @click="attendances(data.qcc_id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="primary"
                              size="24"
                              class="me-3"
                              icon="tabler-download"
                            />
                          </template>
                          <VListItemTitle>Form Attendance</VListItemTitle>
                        </VListItem>    
                        <VDivider />

                        <VListItem
                          value="user"
                          @click="openDialog(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="success"
                              size="24"
                              class="me-3"
                              icon="tabler-upload"
                            />
                          </template>
                          <VListItemTitle>Upload Attachment</VListItemTitle>
                        </VListItem> 
                      </VList>
                    </VMenu>
                  </VBtn>
                </div>
              </td>
              <td>{{ data.meeting_date }}</td>
              <td>{{ data.meeting_from_hour }}</td>
              <td>{{ data.meeting_to_hour }}</td>
              <td>{{ data.summary }}</td>
              <td>{{ data.committee_note }}</td>
              <td>{{ data.next_meeting_schedule_day }}</td>
              <td>
                <div>
                  <VChip 
                    v-if="data.attached_notulen !== null"
                    :color="resolveAttachVariant(data.attached_notulen).color"
                    @click="downloadAttachedNotulen(data.id)"
                  >
                    {{ truncateText(data.attached_notulen) }}
                  </VChip>
                </div>
              </td>
              <td>
                <div>
                  <VChip 
                    v-if="data.attached_attendee !== null"
                    :color="resolveAttachVariant(data.attached_attandee).color"
                    @click="downloadAttachedAttandance(data.id)"
                  >
                    {{ truncateText(data.attached_attendee) }}
                  </VChip>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>

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
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
