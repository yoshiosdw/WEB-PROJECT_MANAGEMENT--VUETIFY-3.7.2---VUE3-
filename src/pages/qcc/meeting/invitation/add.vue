<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import Circle from '@/pages/lookup/circleDialog.vue'
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
const circleId = ref()
const meetDateNow = ref()
const savingProcess = ref(false)

const meetStart = ref()
const room = ref()
const meetingData = ref()

const circle = ref()
const circleCode = ref()
const qccId = ref()

const qccLineData = ref()
const qccLine= ref()

const createMeeting = async () => {
  savingProcess.value = true
  try {
    const ret = axiosIns.post('/qcc/meeting/invitations', {
      plan_date: meetDateNow.value,
      plan_hour: meetStart.value,
      meeting_room_id: room.value,

      // qcc_line_id: qccLine.value.id,
      
      qcc_line_id: qccLine.value,
      circle_id: circleId.value,

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

const fetchQccLine = async() => {
  try {
    const ret = await axiosIns.get('/qcc/lines' )

    qccLineData.value = ret.data.data
  } catch(error) {
    toast.error('Failed Load Qcc Line Room')
  } 
}

watchEffect(() => {
  fetchMeetingRoom(),
  fetchQccLine()
})

const onSubmit = () => {
  circleForm.value?.validate()
    .then(({ valid: isValid })=>{
      if(isValid) createMeeting()
    })
}

const getCircle = val => {
  circleId.value = val.id
  circle.value = val.name
  circleCode.value = val.code
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard class="headline">
          <VCardTitle>Invitation Meeting</VCardTitle>
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
                <VCol cols="4">
                  <VDateInput
                    v-model="meetStart"
                    label="Meeting Start"
                    :rules="[requiredValidator]"
                    :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
                  />
                </VCol>
                <VCol cols="4">
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
                <VCol
                  cols="3"
                >
                  <VTextField 
                    v-model="circleCode" 
                    readonly
                    label="Kode Circle"
                  />
                </VCol>
                <VCol
                  cols="5"
                  class="d-flex gap-3"
                >
                  <VTextField 
                    v-model="circle" 
                    readonly
                    label="Nama Circle"
                  />
                  <Circle @circle="getCircle" />
                </VCol>
                <VCol
                  cols="4"
                >
                  <!--
                    <VAutocomplete 
                    v-model="qccLine"
                    return-object
                    label="Nama Kegiatan"
                    :items="qccLineData"
                    item-title="description"
                    item-value="id"
                    /> 
                  -->

                  <VTextField 
                    v-model="qccLine" 
                    label="Nama Kegiatan"
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
  </div>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Person
  redirectIfLoggedIn: false
</route>
