<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { computed, defineProps, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

const props = defineProps({
  satId:{
    type: String,
    default: null,
  },
})

const emits = defineEmits(['satNotif', 'close'])
const isVisible = ref(false)
const satNotif = ref([])
const total = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const route = useRoute()
const router = useRouter()
const satId = computed(() => props.satId)

// const idNotif = ref(route.query.id)


const toast = useToast()
const satNo = ref()
const joNo = ref()
const rejectBy = ref()
const rejectTime = ref()
const rejectDate = ref()
const note = ref()
const satTaskId = ref()

const sendData = val => {
  emits('satNotif', val)
  isVisible.value = false
}

const fetchNotification = async id => {
  isVisible.value = true
  try {
   
    const response = await axiosIns.get(`/job/order/takses/${id}`, {
    })

    satNotif.value = response.data.data[0]
    satNo.value = satNotif.value?.job_order?.document_number
    joNo.value = satNotif.value?.job_order?.bill_number
    rejectBy.value = satNotif.value?.user?.person?.name
    rejectTime.value = satNotif.value?.job_order?.updated_at
    rejectDate.value = satNotif.value?.job_order?.document_date
    note.value = satNotif.value?.note

    satTaskId.value = satNotif.value?.sat_job_order_id

  } catch (error) {
    toast.error('Gagal memuat data')
    console.log(error)
  }
}

// const findData = async () => {
//   page.value = 1
//   perPage.value = 10
//   find.value = findText.value
// }

watchEffect(() => {
  fetchNotification(satId.value)
})

const closeDialog = () => {
  isVisible.value = false
  emits('close', true)
}

const navigateToTask = () => {
  router.push({ name: 'sat-task-task', params: { task: satTaskId.value } })
  isVisible.value = false
}
</script>

<template>
  <VDialog
    v-model="isVisible"
    width="1024"
    transition="dialog-bottom-transition"
    persistent
  >
    <DialogCloseBtn @click="closeDialog" />

    <VCard>
      <VCardTitle>
        Detail Rejected
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="4">
            <VTextField 
              v-model="satNo"
              label="Sat Number"
              variant="filled"
            />
          </VCol>
          <VCol cols="4">
            <VTextField 
              v-model="joNo"
              label="Jo Number"
              variant="filled"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="4">
            <VTextField 
              v-model="rejectBy"
              label="Rejected By"
              variant="filled"
            />
          </VCol>
          <VCol cols="4">
            <VTextField 
              v-model="rejectDate"
              label="Rejected Date"
              variant="filled"
            />
          </VCol>
          <VCol cols="4">
            <VTextField 
              v-model="rejectTime"
              label="Rejected Time"
              variant="filled"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <VTextarea 
              v-model="note"
              rows="2"
              label="Reason"
              variant="filled"
            />
          </VCol>
        </VRow>
        <div class="d-flex justify-end gap-4 mt-5">
          <VBtn
            color="error"
            @click="navigateToTask"
          >
            Oke
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
