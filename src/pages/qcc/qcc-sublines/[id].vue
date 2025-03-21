<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import router from "@/router"
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import { useToast } from "vue-toastification"
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const toast = useToast()
const route = useRoute()
const lineId = ref(route.params.id)

const plan_date = ref()
const plan_hour = ref()
const actual_hour = ref()
const actual_date = ref()
const addSublinesForm = ref(null)
const savingProcess = ref(false)

const onSubmit = () =>{
  addSublinesForm.value?.validate()
    .then(({ valid:isValid })=>{
      if (isValid)
        CreateSublines()
    })
}

const CreateSublines = async () =>{
  savingProcess.value = true
  try{
    const payload = {
      qcc_line_id: lineId.value,
      plan_date: plan_date.value,
      plan_hour: plan_hour.value,
      actual_date: actual_date.value,
      actual_hour: actual_hour.value,
    }

    const ret = await axiosIns.post('/qcc/sub/lines', payload )
    
    savingProcess.value = false
    plan_date.value = null
    plan_hour.value = null
    actual_date.value = null
    actual_hour.value = null 

    fetchLineSubline(lineId.value)
  }catch (error) {
    console.log(error)
    toast.error(error.response.data.message)
  } finally {
    savingProcess.value = false
  }
}

onMounted(()=>{
  fetchLineSubline(lineId.value)
  fetchLines(lineId.value)
})

const qccId = ref()
const lines = ref()

const back = () =>{
  router.push({ name: 'qcc-id', params: { id: qccId.value } })
}

const fetchLines = async lineId => {
  try {
    const ret = await axiosIns.get(`qcc/lines/${lineId}` )

    lines.value = ret.data.data[0]
    qccId.value = lines.value.qcc_id
    
  }catch(error){
    console.log(error)
    toast.error(error.response.data.message)
  }
}

const lineSubline = ref([])

const fetchLineSubline = async lineId =>{
  try{
    const ret = await axiosIns.get(`/qcc/sub/lines/by/${lineId}`)

    lineSubline.value = ret.data.data
  }catch (error) {
    console.log(error)
    toast.error(error.response.data.message)
  } finally {
    savingProcess.value = false
  }
}

const isVisible = ref(false)

const openDialog = () =>{
  isVisible.value = true
}

const DeleteBtnHandler = id =>{
  Swal.fire({
    title: 'Data',
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

const deleteData = async id => {
  // showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/qcc/sub/lines/${id}` )

    fetchLineSubline(lineId.value)

  } catch (error) {
    toast.error('Gagal hapus data')
  } finally {
    // showLoading.value = false
  }
}
</script>



<template>
  <VRow>
    <VCol cols="12">
      <VCard class="headline">
        <VCardTitle>Detail </VCardTitle>
        <VDivider />
        <VCardText>
          <VForm
            ref="addSublinesForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol
                cols="6"
                sm="6"
              >
                <VDateInput
                  v-model="plan_date"
                  label="Plan Date"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="6"
                sm="6"
              >
                <VDateInput
                  v-model="plan_hour"
                  label="Plan Hour"
                  :config="{enableTime:true, noCalendar: true, dateFormat: 'H:i'}"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="6"
                sm="6"
              >
                <VDateInput
                  v-model="actual_date"
                  label="Actual Date"
                />
              </VCol>
              <VCol
                cols="6"
                sm="6"
              >
                <VDateInput
                  v-model="actual_hour"
                  :config="{enableTime:true, noCalendar: true, dateFormat: 'H:i'}"
                  label="Actual Date"
                />
              </VCol>
              <VRow>
                <VCol
                  cols="12"
                  class="d-flex justify-end gap-4 mt-5"
                >
                  <VBtn
                    color="warning"
                    @click="back"
                  >
                    Close
                  </VBtn>
                  <VBtn
                    :loading="savingProcess"
                    type="submit"
                  >
                    Save
                  </VBtn>
                </VCol>
              </VRow>
            </VRow>
          </VForm>
        </VCardText>
        <VCardText>
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef"
            >
              <tr>
                <th scope="col">
                  Plan Date
                </th>
                <th scope="col">
                  Plan Hour
                </th>
                <th scope="col">
                  Actual Date
                </th>
                <th scope="col">
                  Actual Hour
                </th>
                <th scope="col">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in lineSubline"
                :key="data.id"
              >
                <td>
                  <div
                    class="text-no-wrap"
                    style="margin-top: 15px margin-bottom: 5px"
                  >
                    {{ data.plan_date }}
                  </div>
                </td>
                <td>
                  <div
                    class="text-no-wrap"
                    style="margin-top: 15px margin-bottom: 5px"
                  >
                    {{ data.plan_hour }}
                  </div>
                </td>
                <td>
                  <div
                    class="text-no-wrap"
                    style="margin-top: 15px margin-bottom: 5px"
                  >
                    {{ data.actual_date }}
                  </div>
                </td>
                <td>
                  <div
                    class="text-no-wrap"
                    style="margin-top: 15px margin-bottom: 5px"
                  >
                    {{ data.actual_hour }}
                  </div>
                </td>
                <td>
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="x-small"
                    @click="openDialog"
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
        <VDialog 
          v-model="isVisible" 
          width="768" 
          transition="dialog-bottom-transition" 
          style="z-index:768"
        >
          <VCard>
            <VCardTitle />
            <VCardText>
              <VRow>
                <VCol cols="6">
                  <!--
                    <VDateInput
                    v-model="plan_hour"
                    label="Plan Hour"
                    :config ="{enableTime:true, noCalendar: true, dateFormat: 'H:i'}"
                    :rules="[requiredValidator]"
                    /> 
                  -->
                  <VDateInput
                    v-model="date_picker" 
                    attach 
                    style="position: absolute"
                    :config="{enableTime:true, noCalendar: true, dateFormat: 'H:i'}"
                  >
                    <template #input="{ value, events }">
                      <VTextField
                        :value="value"
                        label="Select Date and Time"
                        v-on="events"
                      />
                    </template>
                  </VDateInput>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VDialog>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
