<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

const countOfTotalReturn = ref(0)
const countOfOpenReturn = ref(0)
const countOfOverdueReturn = ref(0)

const fetchCountOfReturn = async () => {
  try {
    const response = await axiosIns.get('/return/count/totals' )

    countOfTotalReturn.value = response.data.data[0].total_retur
    
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to get data count of retur',
      icon: 'error',
    })
    console.log(error)
  }
}

const fetchCountofOpenReturn = async () => {
  try {
    const response = await axiosIns.get('/return/count/opens' )

    countOfOpenReturn.value = response.data.data[0].retur_open
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to get data count of open retur',
      icon: 'error',
    })
    console.log(error)
  }
}

const fetchCountOfOverdueReturn = async () => {
  try {
    const response = await axiosIns.get('/return/count/overdue' )

    countOfOverdueReturn.value = response.data.data[0].overdue
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to get data count of overdue retur',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchCountOfReturn(),
  fetchCountofOpenReturn(),
  fetchCountOfOverdueReturn()
})
</script>

<template>
  <VCard>
    <VCardText>
      <VRow>
        <VCol
          cols="4"
          class="text-center"
        >
          <small class="font-weight-semibold text-success">Total Return</small>
          <h3 class="text-h4 text-success">
            {{ countOfTotalReturn }}
          </h3>
        </VCol>
        <VDivider vertical />
        <VCol
          cols="4"
          class="text-center"
        >
          <small class="font-weight-semibold text-success">Status Open</small>
          <h3 class="text-h4 text-success">
            {{ countOfOpenReturn }}
          </h3>
        </VCol>
        <VDivider vertical />
        <VCol
          cols="4"
          class="text-center"
          :style="color=red"
        >
          <small class="font-weight-semibold text-error">Status Overdue</small>
          <h3 class="text-h4 text-error">
            {{ countOfOverdueReturn }}
          </h3>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: REturn
    redirecIfLoggedIn: false
</route>
