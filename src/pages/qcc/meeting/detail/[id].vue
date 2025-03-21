<script setup>
import axiosIns from '@/plugins/axios'
import router from '@/router'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const route = useRoute()
const qccId = ref(route.params.id)
const showLoading = ref(false)
const toast = useToast()

const isVisible = ref(false)
const attendance = ref()
const notulen = ref()

const fetcQc = async id => {
  try {
    const ret = await axiosIns.get(`/qcc/qccs/${id}` )

    let response = ret.data.data[0]
    qcc.id = response.id
    qcc.circle = response.circle
    qcc.theme = response.theme
    qcc.workArea = response.work_area
    circle.code = qcc.circle.code
    circle.name = qcc.circle.name
    
  } catch (error) {
    toast.error('Gagal memuat data QCC')
  }

}

const qcc = reactive({
  id: null,
  circle: null,
  theme: null,
  workArea: null,
})

const circle = reactive({
  id: null, 
  code: null,
  name: null,
})



const perPage = ref(10)
const currentPage = ref(1)
const total = ref(0)
const last = ref(0)
const from = ref(0)
const to = ref(0)

const refAttachForm = ref()

const meetings = ref()

const fetchMeetingByQcc = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/qcc/meetings/byQcc/${id}` )

    meetings.value = ret.data.data
    
  } catch (error) {
    toast.error('Gagal memuat data QCC')
  } finally {
    showLoading.value = false
  }

}

onMounted(()=>{
  fetcQc(qccId.value)
  fetchMeetingByQcc(qccId.value)
})

const qccDataId = qccId.value

const addMeeting = () => {
  router.push({ name: 'qcc-meeting-fromqcc-id', params: { id: qccDataId } })
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

const downloadNotulen = async () => {
  try {
    const response = await axiosIns.get(`qcc/download/notulen/`, {
     
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

const downloadAttendance = async () => {
  try {
    const response = await axiosIns.get(`qcc/download/attendance/`, {
     
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
</script>

<template>
  <div>
    <VRow>
      <VCol cols="4">
        <VCard>
          <VCardText v-if="qcc">
            <VRow>
              <VCol
                cols="12"
                class="text-center"
              >
                <div>
                  <VText class="text-center text-3xl md:text-xl lg:text-3xl">
                    <b>{{ circle.code }}</b>
                  </VText>
                </div>
                <div>
                  {{ circle.name }}
                </div>
                <div><i>Leader: </i></div>
              </VCol>
            </VRow>
            <VDivider />
            <VRow class="mt-5">
              <VCol cols="12">
                <div>Tema:</div>
                <div>
                  <VText class="text-center text-md md:text-md lg:text-md">
                    <b>{{ qcc.theme }}</b>
                  </VText>
                </div>
                <div class="mt-2">
                  Work Area:
                </div>
                <div>
                  {{ qcc.workArea }}
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="8">
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
            />
            <div class="d-flex justify-end gap-4">
              <VBtn
                icon="tabler-search"
                :size="40"
                variant="none"
                color="warning"
              />
              <VBtn
                prepend-icon="tabler-plus"
                @click="addMeeting"
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
                <th>Tanggal Meeting</th>
                <th>Jam Awal</th>
                <th>Jam Akhir</th>
                <th>Ringkasan</th>
                <th>Catatan Komite</th>
                <th>Jadwal Meeting Selanjutnya</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in meetings"
                :key="data.id"
              >
                <td>{{ data.meeting_date }}</td>
                <td>{{ data.meeting_from_hour }}</td>
                <td>{{ data.meeting_to_hour }}</td>
                <td>{{ data.summary }}</td>
                <td>{{ data.committee_note }}</td>
                <td>{{ data.next_meeting_schedule_day }}</td>
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
                          <VDivider />
                          <VListItem
                            value="user"
                            @click="downloadNotulen"
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
                            @click="downloadAttendance"
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
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </VCol>
    </VRow>

    
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
  </div>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
