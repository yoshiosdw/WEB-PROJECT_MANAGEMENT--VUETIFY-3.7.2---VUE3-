<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import router from '@/router'
import Swal from 'sweetalert2'

const jobFunctions = ref()

const fetchJobFunctions =  async () => {
  try {
    const response = await axiosIns.get('/job/functions' )

    jobFunctions.value = response.data.data
    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error, 
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchJobFunctions()
})

const jobForm = ref()
const code = ref()
const name = ref('')
const header = ref(null)
const isSaved = ref(false)  

const errors = ref({
  code: undefined,
  name: undefined,
})

const createJobFunctions = async (code, name, header) => {
  try {
    const ret = await axiosIns.post('/job/functions', {
      code: code,
      name: name,
      parent_id: header,
    }, {
      headers: {
        'Authorization': 'Bearer '+localStorage.getItem('sinarjoAccessToken'),
      },
    })

    isSaved.value = true
    router.push({ name: 'job-functions' })
  } catch (error) {
    errors.value.code = JSON.parse(error)
    errors.value.name = JSON.parse(error)
    Swal.fire({
      text: response.data.message, 
      title: 'Lidah Buaya',
      icon: 'error',
    })
    console.log(error)
  }
}

const onSubmit = () => {
  jobForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) {
      createJobFunctions(code.value, name.value, header.value)
    } 
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard
        class="headline"
        :loading="!isSaved"
        title="Adding Job Function"
      >
        <VCardText>
          <VForm
            ref="jobForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="6">
                <VTextField 
                  v-model="code"
                  label="Job Code"
                  :rules="[requiredValidator]"
                  :error-messages="errors.code"
                />
              </VCol>
              <VCol cols="6">
                <VTextField 
                  v-model="name"
                  label="Job Name"
                  :rules="[requiredValidator]"
                  :error-messages="errors.name"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VSelect 
                  v-model="header"
                  :items="jobFunctions"
                  item-title="name"
                  item-value="id"
                  single-line
                />
              </VCol>
            </VRow>
          </VForm>
          <div class="d-flex justify-end gap-4 mt-5">
            <VBtn @click="onSubmit">
              Save
            </VBtn>
            <VBtn
              color="success"
              :to="{ name: 'job-functions'}"
            >
              Close
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Return
  redirectIfLoggedIn: false
</route>

<style scoped>
  .my-card {
    height: calc(55vh - 200px);
    overflow-y: auto;
  }
</style>
