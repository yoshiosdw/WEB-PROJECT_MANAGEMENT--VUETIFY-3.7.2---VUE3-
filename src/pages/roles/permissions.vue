<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

  const isDialogVisible = ref(false)
  const emits = defineEmits(['data'])
  const emittedData = ref(null)
  

  const permissions = ref(null)
  const totalPermissions = ref(0)
  const page = ref(1)
  const perPage = ref(10)
  const find = ref('')
  
  const fetchPermissions = async (page, perPage, find) => {
    try {
      const response = await axiosIns.get('/permissions/', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken')
        },
        params: {
          page: page, 
          perPage: perPage, 
          find: find
        }
      })
      permissions.value = response.data.data
      totalPermissions.value = response.data.meta.total
    } catch (error) {
      Swal.fire({
        title:'LBG',
        text: error, 
        icon: 'error'
      })
      console.log(error)
    }
  }

  watchEffect(() => {
    fetchPermissions(page.value, perPage.value, find.value)
  })
</script>

<template>
  <VDialog v-model="isDialogVisible" persistent width="1024">
    <template #activator="{ props }">
      <VBtn v-bind="props">Add Permission</VBtn>
    </template>
    <VCard>
      <VCardText>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt quod quia ab quis, amet inventore expedita commodi perferendis incidunt numquam est quidem, eligendi earum explicabo facere hic itaque, magni nemo!</p>
      </VCardText>
    </VCard>
  </VDialog>
</template>
