<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import EmployeeDialog from '@/pages/lookup/employeeDialog.vue'
import axiosIns from '@/plugins/axios'
import router from '@/router'
import { onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isSaved = ref(false)

const onSubmit = () => {
  circleForm.value?.validate()
    .then(({ valid: isValid })=>{
      if(isValid) createCircle()
    })
}

const circleForm = ref()
const code = ref()
const name = ref()
const formedOn = ref()
const savingProcess = ref(false)
const circleId = ref()

const createCircle = async () => {
  savingProcess.value = true
  try {
    const ret = await axiosIns.post('/qcc/circles', {
      code: code.value,
      name: name.value,
      formed_on: formedOn.value,
    } )

    if(ret.status === 200){
      isSaved.value = true
      circleId.value = ret.data.data.id
      console.log(ret.data.data.id)
    } 
  } catch (error) {
    console.log(error)
    toast.error('Gagal create data')
  } finally {
    savingProcess.value = false
  }
}

const employee = reactive({
  id: null,
  name: null,
})

const getEmployee = val => {
  employee.id = val.id
  employee.name = val.person.name
}

const jobDescription = ref()
const category = ref()
const categories = ref()

const fetchCategories = async () => {
  try {
    const ret = await axiosIns.get('/qcc/circle/member/categories' )

    categories.value = ret.data.data
  } catch (error) {
    toast.error('Gagal memuat data Kategori')
  }
}

const addMemberForm = ref()

const onSubmitMember = ()=> {
  addMemberForm.value?.validate()
    .then(({ valid: isValid })=>{
      if(isValid) createMember()
    })
}

const createMember = async () => {
  savingProcess.value = true
  try {
    const ret = await axiosIns.post('/qcc/circle/members', {
      circle_id: circleId.value,
      employee_id: employee.id,
      job_description: jobDescription.value,
      category_id: category.value,
    } )

    employee.name = null
    jobDescription.value = null
    category.value = null
    fetchMember()
  } catch (error) {
    console.log(error)
    toast.error(error.response.data.message)
  } finally {
    savingProcess.value = false
  }
}


const members = ref()

const fetchMember = async () => {
  try {
    const ret = await axiosIns.get('/qcc/circle/members', {
      params: {
        circle_id: circleId.value,
      },
    })

    members.value = ret.data.data
  } catch (error) {
    toast.error('Gagal memuat data Member')
  }
}

onMounted(()=>{
  fetchCategories()
})
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard
          class="headline"
          title="Create Circle"
        >
          <VCardText>
            <VForm
              ref="circleForm"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <VCol cols="4">
                  <VTextField 
                    v-model="code"
                    label="Kode Circle"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="8">
                  <VTextField 
                    v-model="name"
                    label="Nama Circle"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="4">
                  <VDateInput 
                    v-model="formedOn"
                    label="Tanggal dibentuk"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>
            </VForm>
            <div class="d-flex justify-end gap-4 mt-5">
              <VBtn
                :loading="savingProcess"
                color="warning"
                @click="router.back()"
              >
                Close
              </VBtn>
              <VBtn
                v-if="!isSaved"
                :loading="savingProcess"
                @click="onSubmit"
              >
                Save
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
    <VRow v-if="isSaved">
      <VCol cols="12">
        <VCard>
          <VCardTitle>Form Tambah Member</VCardTitle>
          <VDivider />
          <VCardText>
            <VForm
              ref="addMemberForm"
              @submit.prevent="onSubmitMember"
            >
              <VRow>
                <VCol
                  cols="6"
                  class="d-flex gap-2"
                >
                  <VTextField
                    v-model="employee.name"
                    label="Karyawan"
                    readonly
                    :rules="[requiredValidator]"
                  />
                  <EmployeeDialog @employee="getEmployee" />
                </VCol>
                <VCol cols="3">
                  <VTextField
                    v-model="jobDescription"
                    label="Posisi Pekerjaan"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="3">
                  <VAutocomplete
                    v-model="category"
                    label="Kategori"
                    :items="categories"
                    item-title="name"
                    item-value="id"
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
                    Save and Create New
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
        
        <VTable v-if="isSaved">
          <thead
            class="text-uppercase"
            style="background-color: #efefef"
          >
            <tr>
              <th>Kayawan</th>
              <th>Departemen</th>
              <th>Kategori</th>
              <th>Posisi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in members"
              :key="data.id"
            >
              <td>
                <div>{{ data.employee.person.name }}</div>
                <div><b>{{ data.employee.person.nik }}</b></div>
              </td>
              <td>{{ data.employee.organization.name }}</td>
              <td>{{ data.member_category.name }}</td>
              <td>{{ data.job_description }}</td>
              <td>
                <VBtn
                  icon
                  variant="text"
                  color="default"
                  size="x-small"
                  @click="onBtnDeleteHandler(data.id)"
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
      </VCol>
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
