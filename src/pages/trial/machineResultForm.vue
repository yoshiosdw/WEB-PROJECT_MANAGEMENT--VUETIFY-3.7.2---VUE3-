<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

  const isVisible = ref(false)
  const process = ref(null)
  const selectedProcess = ref(null)
  const operator = ref(null)

  const prop = defineProps({
    machineId: String
  })

  const emits = defineEmits(['data'])
  const sendData = val => {
    emits('data', val)
  }
  const refResultForm = ref()
  const onSubmit = () => {
    sendData(
      {
        operator: operator.value,
        machine_id: prop.machineId
      }
    )
    isVisible.value = false
  }

  const fetchProcess = async () => {
    try {
      const ret = await axiosIns.get('/trial/get/processes', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
        }
      })
      process.value = ret.data.data
    } catch (error) {
      Swal.fire({
        title:'Manufacture',
        text: error,
        icon: 'error'
      })
      console.log(error)
    }
  }

  watchEffect(() => {
    fetchProcess()
  })
</script>
<template>

  <VDialog v-model="isVisible" width="1024" persistent>
    <template #activator="{ props }">
      <VBtn icon=""
        size="x-small" color="default"
        variant="text"
        v-bind="props"
      >
        <VIcon size="22" icon="tabler:settings-plus" color="error"/>
      </VBtn>
    </template>
    <VCard>
      <VCardText>
        <VForm ref="refResultForm" @submit.prevent="onSubmit">
          <VRow>
            <VCol cols="6">
              <VSelect 
                :items="process"
                label="Process"
                v-model="selectedProcess"
                item-title="name"
                item-value="id"
                single-line
                return-object
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="4">
              <VTextField label="Hasil /Shift (kg)"
              />
            </VCol>
            <VCol cols="4">
              <VTextField label="Waste (kg)" 
                v-model="wasteKg"
                type="number"
                inputmode="numeric"
                reverse=""
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="4">
              <VTextField label="Target Waste (%)"
                v-model="targetWaste"
                type="number"
                inputmode="numeric"
                reverse=""
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextField label="Ampere"
                v-model="ampere"
                type="number"
                inputmode="numeric"
                reverse=""
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="6">
              <VTextField label="Operator"
                v-model="operator"
              />
            </VCol>            
          </VRow>
          <VRow>
            <VCol cols="12" class="d-flex justify-end gap-4">
              <VBtn color="success" type="submit">Save</VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

</template>
