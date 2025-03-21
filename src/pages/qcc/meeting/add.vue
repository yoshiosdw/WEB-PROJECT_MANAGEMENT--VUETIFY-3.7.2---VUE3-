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

// const qccId = ref(route.params.id)

const circleForm = ref()
const code = ref()
const name = ref()
const type = ref()
const referenceId = ref()
const note = ref()
const circleId = ref()
const meetingScheduledDay = ref()
const meetDateNow = ref()
const savingProcess = ref(false)

const meetDone = ref()
const meetStart = ref()
const description = ref()
const summary = ref()

const nextHour = ref()
const nextDay = ref()
const room = ref()
const meetingData = ref()
const committeNote = ref()

const attachFile = ref()
const notulen = ref()
const attendance = ref()
const showLoading = ref(false)

const theme = ref()
const workArea = ref()
const circle = ref()
const qccId = ref()



// const qccData = ref()


// const fetcQc = async () => {
//   showLoading.value = true
//   try {
//     const ret = await axiosIns.get(`/qcc/qccs/`, {
//       headers: {
//         Authorization: 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
//       },
//     })

//     qccData.value = ret.data.data

//     // qcc.id = response.id
//     // qcc.circle = response.circle
//     // qcc.theme = response.theme
//     // qcc.workArea = response.work_area
//     // circle.code = qcc.circle.code
//     // circle.name = qcc.circle.name
    
//   } catch (error) {
//     toast.error('Gagal memuat data QCC')
//   } finally {
//     showLoading.value = false
//   }

// }

// onMounted(()=>{
//   fetcQc()
// })

const createMeeting = async () => {
  savingProcess.value = true
  try {
    const ret = axiosIns.post('/qcc/meetings', {
      meeting_date: meetDateNow.value,
      meeting_from_hour: meetStart.value,
      meeting_to_hour: meetDone.value,
      description: description.value,
      summary: summary.value,

      next_meeting_schedule_date: nextDay.value,
      next_meeting_schedule_hour: nextHour.value,
      next_schedule_room_id: room.value,
      committee_note: committeNote.value,

      qcc_id: qccId.value,

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
      if(isValid) createMeeting()
    })
}

const getvalueFromQcc = val => {
  qccId.value = val.id
  theme.value = val.theme
  workArea.value = val.work_area
  circle.value = val.circle?.name
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
                  <VSelect
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
    <VRow>
      <VCol cols="12" />
    </VRow>
  </div>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Person
  redirectIfLoggedIn: false
</route>
