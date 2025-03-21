<script setup>
import axiosIns from "@/plugins/axios"
import router from '@/router'
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"

const picas = ref()
const route = useRoute()
const returId = ref(route.params.id)
const department = ref()
const picName = ref()
const problem = ref()
const corrective = ref()
const preventive = ref()
const picaForm = ref()
const saved = ref(false)
const returns = ref()


const fetchReturn = async id => {
  try {
    const ret = await axiosIns.get(`/returns/${id}` )

    returns.value = ret.data.data
    department.value = returns.value[0].return_categories.department_in_charge
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Fail to load Retur data',
      icon: 'error',
    })
    router.push({ name: 'retur' })
  }
}

const fetchReturPica = async id => {
  try{
    const ret = await axiosIns.get(`/return/picas/${id}` )

    picas.value = ret.data.data
    if(Array.from(picas.value).length !== 0){
        
      department.value = picas.value[0].department_name
      picName.value = picas.value[0].pic_name
      problem.value = picas.value[0].problem_identification
      corrective.value = picas.value[0].corrective_action
      preventive.value = picas.value[0].preventive_action

    } 
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Get Pica data failed',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchReturn(returId.value),
  fetchReturPica(returId.value)
})

const createReturPica = async () => {
  try {
    const ret = await axiosIns.post('/return/picas', {
      memo_retur_id: returId.value,
      department_name: department.value,
      pic_name: picName.value,
      problem_identification: problem.value,
      corrective_action: corrective.value,
      preventive_action: preventive.value,
    } )

    router.push({ name: 'retur' } )
    saved.value = true
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Create new Pica failed',
      icon: 'error',
    })
    saved.value = false
  }
}

const onSubmit = () => {
  picaForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid)
      createReturPica()
  })
}

onMounted(() => {
  picName.value = JSON.parse(localStorage.getItem('sinarjoUserData')).person.name
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <!-- <VOverlay v-model="isLoading" /> -->
      <VCard>
        <VCardTitle>Create PICA</VCardTitle>
        <VSpacer />
        <VCardText>
          <VForm
            ref="picaForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="6">
                <VTextField
                  v-model="department"
                  label="Department in Charge"
                  :readonly="true"
                />
              </VCol>
              <VCol cols="6">
                <VTextField 
                  v-model="picName"
                  label="PIC Name"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea 
                  v-model="problem"
                  label="Problem Identification"
                  rows="2"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea 
                  v-model="corrective"
                  label="Corrective Action"
                  rows="2"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea 
                  v-model="preventive"
                  label="Preventive Action"
                  rows="2"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <div class="d-flex justify-end gap-4">
                  <VBtn
                    :to="{name: 'retur'}"
                    color="warning"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    color="success"
                    type="submit"
                  >
                    Save
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: PICA
    redirectIfLoggedIn: false
  </route>
