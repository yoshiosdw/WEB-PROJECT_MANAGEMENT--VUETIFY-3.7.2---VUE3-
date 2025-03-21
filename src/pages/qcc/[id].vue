<script setup>
import axiosIns from '@/plugins/axios'
import router from '@/router'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const route = useRoute()
const toast = useToast()
const isSaved = ref(false)
const qccId = ref(route.params.id)
const qccLinesId = ref()
const showLoading = ref(false)
const qccForm = ref()
const qcc = reactive({})

// const qcc = reactive({
//   code: null,
//   name: null,
//   work_area: null,
//   theme: null,
//   type: null,
//   reference_id: null,
//   note: null,
//   circle_idd: null,
//   meeting_scheduled_day: null,
//   meeting_scheduled_our: null
// })

const fetchQcc = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/qcc/qccs/${id}` )

    qcc.value = ret.data.data[0]
  } catch (error) {
    console.log(error)
    toast.error(error)
  } finally {
    showLoading.value = false
  }
}

const onSubmit = () => {
  circleForm.value?.validate()
    .then(({ valid: isValid })=>{
      if(isValid) updateCircle()
    })
}

const savingProcess = ref(false)

// const updateCircle = async  => {
//   savingProcess.value = true
//   try {
//     const ret = axiosIns.patch(`/qcc/circles/${circleId.value}`, {
//       code: code.value,
//       name: name.value,
//       formed_on: formedOn.value
//     }, {
//       headers: {
//         Authorization: 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
//       }
//     })
//     router.back()
//   } catch (error) {
//     console.log(error);
//     toast.error('Gagal create data')
//   } finally {
//     savingProcess.value = false
//   }
// }

onMounted(()=>{
  fetchQcc(qccId.value)
  fetchQccLines(qccId.value)
})

// const employee = reactive({
//   id: null,
//   name: null
// })
// const getEmployee = val => {
//   employee.id = val.id
//   employee.name = val.person.name
// }

// const addMemberForm = ref()
// const onSubmitMember = ()=> {
//   addMemberForm.value?.validate()
//   .then(({valid: isValid})=>{
//     if(isValid) createMember()
//   })
// }

// const jobDescription = ref()
// const category = ref()
// const categories = ref()
// const fetchCategories = async () => {
//   try {
//     const ret = await axiosIns.get('/qcc/circle/member/categories', {
//       headers: {
//         Authorization: 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
//       }
//     })
//     categories.value = ret.data.data
//   } catch (error) {
//     toast.error('Gagal memuat data Kategori')
//   }
// }
// const createMember = async () => {
//   savingProcess.value = true
//   try {
//     const ret = await axiosIns.post('/qcc/circle/members', {
//       circle_id: circleId.value,
//       employee_id: employee.id,
//       job_description: jobDescription.value,
//       category_id: category.value
//     }, {
//       headers: {
//         Authorization: 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
//       }
//     })
//     employee.name = null
//     jobDescription.value = null
//     category.value = null
//     fetchMember()
//   } catch (error) {
//     toast.error(error.response.data.message)
//   } finally {
//     savingProcess.value = false
//   }
// }

// const members = ref()
// const fetchMember = async () => {
//   try {
//     const ret = await axiosIns.get('/qcc/circle/members', {
//       headers: {
//         Authorization: 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
//       }, params: {
//         circle_id: circleId.value
//       }
//     })
//     members.value = ret.data.data
//   } catch (error) {
//     toast.error('Gagal memuat data Member')
//   }
// }

// onMounted(()=> {
//   fetchCategories(),
//   fetchMember()
// })

// const onBtnDeleteHandler = id => {
//     Swal.fire({
//     title: themeConfig.app.title,
//     text: 'Sure delete data?',
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonColor: 'warning',
//     cancelButtonColor: 'primary',
//     confirmButtonText: 'Yes, delete it!'
//   }).then((ret) => {
//     if(ret.isConfirmed) {
//       deleteData(id)
//     }
//   })
// }

// const deleteData = async id => {
//   savingProcess.value = true
//   try {
//     await axiosIns.delete(`/qcc/circle/members/${id}`, {
//       headers: {
//         Authorization: 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
//       }
//     })
//     fetchMember()
//   } catch (error) {
//     toast.error(error.response.data.message)
//   } finally {
//     savingProcess.value = false
//   }
// }
const QccLines = ref([])

const fetchQccLines = async id =>{
  try{
    const res = await axiosIns.get(`/qcc/lines/by/${id}` )

    QccLines.value = res.data.data
  }catch (error) {
    console.log(error)
    toast.error(error)
  } finally {
    showLoading.value = false
  }
}

// const sublines = ref([])
// const fetchSublines = async () =>{
//   try{
//     const res = await axiosIns
//   }catch (error) {
//     console.log(error);
//     toast.error(error)
//   } finally {
//     showLoading.value = false
//   }
// }
const addStepForm = ref()
const aktivitas = ref()
const sequence = ref()

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
      qcc_id: qccId.value,
      sequence: sequence.value,
      description: aktivitas.value,
    }
   
    const ret = await axiosIns.post('/qcc/lines', payload,
      {
      
      })

    qcc_lines_id.value = ret.data.data.id

    sequence.value = null
    nama_kegiatan.value = null
    fetchQccLines(qccId.value)
  }catch (error) {
    console.log(error)
    toast.error(error.response.data.message)
  } finally {
    savingProcess.value = false
  }
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

const addSublines = qcc_lines_id =>{
  router.push({ name: 'qcc-qcc-sublines-id', params: { id: qcc_lines_id } })
}
</script>

<template>
  <div>
    <VRow v-if="!showLoading">
      <VCol cols="12">
        <VCard>
          <VCardTitle>Update Circle</VCardTitle>
          <VDivider />
          <VCardText>
            <VForm
              v-if="qcc.value"
              ref="circleForm"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <VCol cols="3">
                  <VTextField 
                    v-model="qcc.value.code"
                    label="Kode QCC"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField 
                    v-model="qcc.value.name"
                    label="Nama Circle"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="3">
                  <VSelect
                    v-model="qcc.value.type"
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
                    v-model="qcc.value.theme"
                    label="Tema"
                    rows="2"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="3">
                  <VTextField
                    v-model="qcc.value.work_area"
                    label="Area Kerja"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="9">
                  <VTextField
                    v-model="qcc.value.note"
                    label="Keterangan Lain"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="3">
                  <VTextField
                    v-model="qcc.value.reference_id"
                    label="QCC Perubahan"
                  />
                </VCol>
                <VCol cols="2">
                  <VSelect
                    v-model="qcc.value.meeting_scheduled_day"
                    label="Jadwal Meeting (Hari)"
                    :items="[{id: 1, name: 'Senin'}, {id: 2, name: 'Selasa'}, {id: 3, name: 'Rabu'}, {id: 4, name: 'Kamis'}, {id: 5, name: `Jum'at`}, {id: 6, name: 'Sabtu'},]"
                    item-title="name"
                    item-value="id"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="2">
                  <VDateInput
                    v-model="qcc.value.meeting_scheduled_time"
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
                    v-model="aktivitas"
                    label="Aktivitas"
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
        <VTable>
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
              v-for="data in QccLines"
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
                  @click="addSublines(data.id)"
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
