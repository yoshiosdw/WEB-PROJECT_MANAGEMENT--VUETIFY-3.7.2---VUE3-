<script setup>
import axiosIns from "@/plugins/axios"
import ability from '@/plugins/casl/ability'
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"

const props = defineProps({
  data: ({
    type: Object,
  }),
})

const isVisible = ref(false)

const picaForm = ref()
const picas = ref()
const department = ref()
const picName = ref()
const problem = ref()
const corrective = ref()
const preventive = ref()


const fetchReturPica = async taskReturId => {
  try{
    const ret = await axiosIns.get(`/return/picas/${taskReturId}` )

    picas.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Get Pica data failed',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchReturPica(props.data.id)
})

const createReturPica = async () => {
  try {
    const ret = await axiosIns.post('/return/picas', {
      task_retur_id: props.data.id,
      department_name: props.data.department_in_charge,
      pic_name: picName.value,
      problem_identification: problem.value,
      corrective_action: corrective.value,
      preventive_action: preventive.value,
    } )

    fetchReturPica(props.data.id)
    department.value = null
    picName.value = null
    problem.value = null
    corrective.value = null
    preventive.value = null
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Create new Pica failed',
      icon: 'error',
    })
  }
}

const onSubmit = () => {
  picaForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid)
      createReturPica()
  })
}

const deleteData = async picaId => {
  try{
    const ret = await axiosIns.delete(`/return/picas/${picaId}` )

    fetchReturPica(props.data.id)
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Delete data failed.',
      icon: 'error',
    })
  }
}

const btnDeleteClickHandler = id => {
  isVisible.value = false
  Swal.fire({
    title: themeConfig.app.title,
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonColor: 'primary',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

const cancelClickHandler = () => {
  isVisible.value = false
}
</script>

<template>
  <VDialog
    v-model="isVisible"
    :width="950"
    persistent
  >
    <template #activator="{props}">
      <VListItemTitle v-bind="props">
        PICA
      </VListItemTitle>
    </template>
    <VCard>
      <VCardText>
        <VForm
          ref="picaForm"
          style="height: auto;"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="12">
              <VTextField 
                v-model="picName"
                label="PIC Name"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea 
                v-model="problem"
                label="Problem Identification"
                rows="2"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea 
                v-model="corrective"
                label="Corrective Action"
                rows="2"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea 
                v-model="preventive"
                label="Preventive Action"
                rows="2"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
          <div class="d-flex mt-6 gap-4 justify-end">
            <VBtn
              color="warning"
              @click="cancelClickHandler"
            >
              Close
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
      <VSpacer class="mt-6" />
      <VCardText>
        <VTable class="text-no-wrap">
          <thead class="text-uppercase">
            <tr>
              <th>Department Name</th>
              <th>PIC Name</th>
              <th>Problem Identification</th>
              <th>Corrective Action</th>
              <th>Preventive Action</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pica in picas"
              :key="pica.id"
            >
              <td>{{ pica.department_name }}</td>
              <td>{{ pica.pic_name }}</td>
              <td class="text-wrap">
                {{ pica.problem_identification }}
              </td>
              <td class="text-wrap">
                {{ pica.corrective_action }}
              </td>
              <td class="text-wrap">
                {{ pica.preventive_action }}
              </td>
              <td v-if="ability.can('Manage','PICA')">
                <VBtn 
                  icon="tabler-trash" 
                  variant="none" 
                  size="24"
                  @click="btnDeleteClickHandler(pica.id)"
                />
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
  meta:
    action: Manage
    subject: PICA
    redirectIfLoggedIn: false
  </route>
