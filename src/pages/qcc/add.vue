<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import router from '@/router'
import { useToast } from 'vue-toastification'
import circleDialog from '../lookup/circleDialog.vue'

// import { VDatePicker, VTextField } from 'vuetify/components';


const toast = useToast()
const isSaved = ref(false)

const onSubmit = () => {
  circleForm.value?.validate()
    .then(({ valid: isValid })=>{
      if(isValid) createQcc()
    })
}

const circleForm = ref()
const code = ref()
const name = ref()
const workArea = ref()
const theme  = ref()
const type = ref()
const referenceId = ref()
const note = ref()
const circleId = ref()
const meetingScheduledDay = ref()
const meetingScheduledTime = ref()
const savingProcess = ref(false)
const nama_kegiatan = ref()
const plan_date = ref()
const plan_hour = ref()
const sequence = ref()
const qcc_id = ref()
const qcc_lines_id = ref()

const qccIdNew = ref()


const createQcc = async () => {
  savingProcess.value = true
  try {
    const ret = await axiosIns.post('/qcc/qccs', {
      code: code.value,
      name: name.value,
      work_area: workArea.value,
      theme: theme.value,
      type: type.value,
      reference_id: referenceId.value,
      note: note.value,
      circle_id: circleId.value,
      meeting_scheduled_day: meetingScheduledDay.value,
      meeting_scheduled_hour: meetingScheduledTime.value,
      circle_id: circle.id,
    } )

    // if (ret.status === 200){
    //     qcc_id.value = ret.data.data.id
    //   console.log(ret.data.data.code)
    // }

    qccIdNew.value = ret.data.data.id

    // console.log(ret.data.data.id)
    isSaved.value = true
  } catch (error) {
    console.log(error)
    toast.error('Gagal create data')
  } finally {
    savingProcess.value = false
  }
}

const addStepForm = ref()

const onSubmitQccLinesSub = () =>{
  addStepForm.value?.validate()
    .then(({ valid:isValid })=>{
      if (isValid)
        createQccLines()
    })
}

const createQccLines = async () =>{
  savingProcess.value = true
  try{
    const payload = {
      qcc_id: qccIdNew.value,
      sequence: sequence.value,
      description: nama_kegiatan.value,
    }
   
    const ret = await axiosIns.post('/qcc/lines', payload,
      {
      
      })

    qcc_lines_id.value = ret.data.data.id

    sequence.value = null
    nama_kegiatan.value = null
    fetchLines(qccIdNew.value)
  }catch (error) {
    console.log(error)
    toast.error(error.response.data.message)
  } finally {
    savingProcess.value = false
  }
}

const date_picker = ref()

const circle = reactive({
  id:null,
  code: null,
  name: null,
})

const getCircle = val => {
  circle.id = val.id
  circle.code = val.code
  circle.name = val.name
}

const qcc_lines = ref([])

const fetchLines = async qccIdNew =>{
  try{
    const ret = await axiosIns.get(`/qcc/lines/by/${qccIdNew}`, {
      
      
    })

    qcc_lines.value = ret.data.data
  }catch (error) {
    toast.error('Gagal memuat data kegiatan')
  }
}

const addSublines = () =>{
  router.push({ name: 'qcc-qcc-sublines-id', params: { id: qcc_lines_id.value } })
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard class="headline">
          <VCardTitle>Form Submit QCC</VCardTitle>
          <VDivider />
          <VCardText>
            <VForm
              ref="circleForm"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <VCol
                  cols="8"
                  class="d-flex gap-2"
                >
                  <VTextField
                    v-model="circle.code"
                    :readonly="true"
                    label="Kode Circle"
                    :rules="[requiredValidator]"
                  />
                  <VTextField
                    v-model="circle.name"
                    :readonly="true"
                    label="Nama Circle"
                  />
                  <CircleDialog @circle="getCircle" />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="3">
                  <VTextField
                    v-model="code"
                    label="Kode QCC"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField
                    v-model="name"
                    label="Nama"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="3">
                  <VSelect
                    v-model="type"
                    label="Type"
                    :items="[{id: 0, name: 'Baru'}, {id: 1, name: 'Tema ke'}, {id: 2, name: 'Perubahan'}]"
                    item-title="name"
                    item-value="id"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12">
                  <VTextarea
                    v-model="theme"
                    label="Tema"
                    rows="2"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="3">
                  <VTextField
                    v-model="workArea"
                    label="Area Kerja"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="9">
                  <VTextField
                    v-model="note"
                    label="Keterangan Lain"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="3">
                  <VTextField
                    v-model="referenceId"
                    label="QCC Perubahan"
                  />
                </VCol>
                <VCol cols="2">
                  <VSelect
                    v-model="meetingScheduledDay"
                    label="Jadwal Meeting (Hari)"
                    :items="[{id: 1, name: 'Senin'}, {id: 2, name: 'Selasa'}, {id: 3, name: 'Rabu'}, {id: 4, name: 'Kamis'}, {id: 5, name: `Jum'at`}, {id: 6, name: 'Sabtu'},]"
                    item-title="name"
                    item-value="id"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="2">
                  <VDateInput
                    v-model="meetingScheduledTime"
                    label="Jam (WIB)"
                    :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
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
                    :disabled="isSaved"
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
    <VRow v-if="isSaved">
      <VCol cols="12">
        <VCard>
          <VCardTitle>Step</VCardTitle>
          <VDivider />
          <VCardText>
            <VForm
              ref="addStepForm"
              @submit.prevent="onSubmitQccLinesSub"
            >
              <VRow>
                <VCol
                  cols="2"
                  class="d-flex gap-2"
                >
                  <VSelect
                    v-model="sequence"
                    label="Langkah"
                    :items="[1,2,3,4,5,6,7,8,]"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol
                  cols="10"
                  class="d-flex gap-2"
                >
                  <VTextField
                    v-model="nama_kegiatan"
                    label="Nama Kegiatan"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol
                  cols="12"
                  class="d-flex justify-end gap-2"
                >
                  <VBtn
                    type="submit"
                    color="success"
                    :loading="savingProcess"
                  >
                    <VIcon left>
                      mdi-plus
                    </VIcon>
                    Add
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
    <VRow>
      <VCardText>
        <VTable v-if="isSaved">
          <thead
            class="text-uppercase"
            style="background-color: #efefef"
          >
            <tr>
              <th scope="col">
                Step
              </th>
              <th scope="col">
                Aktivitas
              </th>
              <th scope="col">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in qcc_lines"
              :key="data.id"
            >
              <td>
                <div
                  class="text-no-wrap"
                  style="margin-top: 15px;margin-bottom: 5px"
                >
                  {{ data.sequence }}
                </div>
              </td>
              <td>
                <div
                  class="text-no-wrap"
                  style="margin-top: 15px;margin-bottom: 5px"
                >
                  {{ data.description }}
                </div>
              </td>
              <td>
                <VBtn
                  icon
                  variant="text"
                  color="default"
                  size="x-small"
                  @click="addSublines"
                >
                  <VIcon
                    :size="22"
                    icon="tabler-plus"
                  />
                </VBtn>
                <VBtn
                  icon
                  variant="text"
                  color="default"
                  size="x-small"
                  @click="DeleteBtnHandler(data.id)"
                >
                  <VIcon
                    :size="22"
                    icon="tabler-trash"
                  />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VRow>   
  </div>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Dashboard
  redirectIfLoggedIn: false
</route>

<style scoped>
  .my-card {
    height: calc(55vh - 200px);
    overflow-y: auto;
  }
</style>
