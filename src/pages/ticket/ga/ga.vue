<script setup>
import Index from '@/pages/ticket/add.vue'
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { defineEmits, onMounted, ref } from 'vue'

const emits = defineEmits(['departId'])

const selectedDepartmentId = ref(null)
const loading = ref(true)

const fetchDepart = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/ticket/departments` )

    selectedDepartmentId.value = ret.data.data[1].id
    
    loading.value = false

  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
    loading.value = false
  }
}

onMounted(async () => {
  await fetchDepart()
})
</script>

<template>
  <template v-if="!loading">
    <!-- {{ selectedDepartmentId }} -->
    <Index :departments-id="selectedDepartmentId" />
  </template>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
