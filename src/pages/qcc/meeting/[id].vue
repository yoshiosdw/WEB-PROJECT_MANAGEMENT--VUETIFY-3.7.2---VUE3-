<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import Qcc from '@/pages/lookup/qccDialog.vue'
import axiosIns from '@/plugins/axios'
import router from '@/router'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

// import CircleDialog from '../lookup/circleDialog.vue'


const toast = useToast()
const route = useRoute()
const isSaved = ref(false)

const meetingId = ref(route.params.id)

const circleForm = ref()
const meetDateNow = ref()
const savingProcess = ref(false)

const meetDone = ref()
const meetStart = ref()
const description = ref()
const summary = ref()

const nextHour = ref()
const nextDay = ref()
const room = ref()
const roomId = ref()
const meetingData = ref()
const committeNote = ref()

const attachFile = ref()
const notulen = ref()
const attendance = ref()
const showLoading = ref(false)

const theme = ref()
const themeId = ref()
const workArea = ref()
const circle = ref()
const qccId = ref()

const isVisible = ref(false)
const refAttachForm = ref()

const qccMeetings = ref([])


const fetchQccMeeting = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/qcc/meetings/${id}` )

    qccMeetings.value = ret.data.data[0]

    meetDateNow.value = qccMeetings.value.meeting_date
    meetStart.value = qccMeetings.value.meeting_from_hour
    meetDone.value = qccMeetings.value.meeting_to_hour

    theme.value = qccMeetings.value.qcc?.name
    themeId.value = qccMeetings.value.qcc_id
    workArea.value = qccMeetings.value.qcc?.work_area
    circle.value = qccMeetings.value.qcc?.circle.name

    description.value = qccMeetings.value.description
    summary.value = qccMeetings.value.summary

    nextDay.value = qccMeetings.value.next_meeting_schedule_day
    nextHour.value = qccMeetings.value.next_meeting_schedule_hour
    roomId.value = qccMeetings.value.next_schedule_room_id
    room.value = qccMeetings.value.room?.name
    committeNote.value = qccMeetings.value.committee_note


    
  } catch (error) {
    toast.error('Gagal memuat data QCC Meetings')
  } finally {
    showLoading.value = false
  }

}

onMounted(()=>{
  fetchQccMeeting(meetingId.value)
})

const createMeeting = async meetingId => {
  savingProcess.value = true
  try {
    const ret = axiosIns.post(`/qcc/meetings/${meetingId}`, {
      meeting_date: meetDateNow.value,
      meeting_from_hour: meetStart.value,
      meeting_to_hour: meetDone.value,
      description: description.value,
      summary: summary.value,

      next_meeting_schedule_date: nextDay.value,
      next_meeting_schedule_hour: nextHour.value,
      committee_note: committeNote.value,

      next_schedule_room_id: room.value.id || roomId.value,
      qcc_id: qccId.value || themeId.value,

    } )

    isSaved.value = true

    router.back()
    
  } catch (error) {
    console.log(error)
    toast.error('Gagal create data')
  } finally {
    savingProcess.value = false
  }
}

const fetchMeetingRoom = async() => {
  try {
    const ret = await axiosIns.get('/qcc/meeting/rooms' )

    meetingData.value = ret.data.data
  } catch(error) {
    toast.error('Failed Load Meeting Room')
  } 
}

watchEffect(() => {
  fetchMeetingRoom()
})

const onSubmit = () => {
  circleForm.value?.validate()
    .then(({ valid: isValid })=>{
      if(isValid) createMeeting(meetingId.value)
    })
}

const getvalueFromQcc = val => {
  qccId.value = val.id
  theme.value = val.theme
  workArea.value = val.work_area
  circle.value = val.circle?.name
}

const meetingIdData = ref()

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


const onUpload = () => {
  refAttachForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      uploadAttach(meetingIdData.value)
      isVisible.value = false
    }
  })
}

const cancelClickHandler = () => {
  isVisible.value = false
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard class="headline">
          <VCardTitle>Detail Meeting</VCardTitle>
          <VDivider />
          <VCardText>
            <VForm
              ref="circleForm"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <VCol
                  cols="4"
                >
                  <VDateInput
                    v-model="meetDateNow"
                    label="Meeting Date"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="3">
                  <VDateInput
                    v-model="meetStart"
                    label="Meeting Start"
                    :rules="[requiredValidator]"
                    :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
                  />
                </VCol>
                <VCol cols="3">
                  <VDateInput
                    v-model="meetDone"
                    label="Meeting Done"
                    :rules="[requiredValidator]"
                    :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
                  />
                </VCol>
              </VRow>

              <VRow>
                <VCol
                  cols="4"
                  class="d-flex gap-2"
                >
                  <VTextField
                    v-model="theme"
                    label="QCC Theme"
                    readonly
                    :rules="[requiredValidator]"
                  />
                  <Qcc @qcc="getvalueFromQcc" />
                </VCol>
                <VCol cols="3">
                  <VTextField
                    v-model="workArea"
                    label="Work Area"
                    readonly
                  />
                </VCol>
                <VCol cols="5">
                  <VTextField
                    v-model="circle"
                    label="Circle Name"
                    readonly
                  />
                </VCol>
              </VRow>

              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="description"
                    label="Description"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextarea
                    v-model="summary"
                    label="Summary"
                    rows="2"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>

              <VDivider class="mt-4" />

              <VRow class="mt-2">
                <VCol
                  cols="4"
                >
                  <VAutocomplete
                    v-model="nextDay"
                    label="Next Meeting (Day)"
                    :items="[{id: 1, name: 'Senin'}, {id: 2, name: 'Selasa'}, {id: 3, name: 'Rabu'}, {id: 4, name: 'Kamis'}, {id: 5, name: `Jum'at`}, {id: 6, name: 'Sabtu'},]"
                    item-title="name"
                    item-value="id"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="3">
                  <VDateInput
                    v-model="nextHour"
                    label="Next Meeting Start"
                    :rules="[requiredValidator]"
                    :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
                  />
                </VCol>
                <VCol cols="3">
                  <VAutocomplete 
                    v-model="room"
                    return-object
                    label="Meeting Room"
                    :items="meetingData"
                    item-title="name"
                    item-value="id"
                  />
                </VCol>
              </VRow>

              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="committeNote"
                    label="Committe Note"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>

              <VRow>
                <VCol
                  cols="12"
                  class="d-flex justify-end gap-4 mt-5"
                >
                  <VBtn
                    :loading="savingProcess"
                    color="warning"
                    @click="router.back()"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    :loading="savingProcess"
                    @click="onSubmit"
                  >
                    Save
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
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
            @submit.prevent="onUpload"
          >
            <VRow>
              <VCol cols="6">
                <VFileInput
                  v-model="notulen"
                  label="Upload Notulen"
                  accept=".pdf,.xls,.xlsx,.jpg"
                  @change="handleFileChange"
                />
              </VCol>
              <VCol cols="6">
                <VFileInput
                  v-model="attendance"
                  label="Upload Attendance"
                  accept=".pdf,.xls,.xlsx,.jpg"
                  @change="handleFileChange"
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
