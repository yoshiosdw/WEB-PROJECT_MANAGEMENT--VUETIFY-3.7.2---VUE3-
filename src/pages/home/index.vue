<script setup>
import axiosIns from '@/plugins/axios'
import { useBioPanelStore } from '@/store/biopanelStore'
import UserBioPanel from '@/views/apps/ticket/UserBioPanel.vue'
import UserGaTabView from '@/views/apps/ticket/UserGaTabView.vue'
import UserIctTabView from '@/views/apps/ticket/UserIctTabView.vue'
import AssignTo from '@/views/apps/ticket/assignTo.vue'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

const userId = ref(JSON.parse(localStorage.getItem('sinarjoUserData')))
const userData = ref()
const userTab = ref(null)
const isLoading = ref(false)

const biopanelStore = useBioPanelStore()
const isUserBioPanelVisible = computed(() => biopanelStore.showUserBioPanel)
const started = ref(null)
const ended = ref(null)

const ValueFromAssignTo = ref(null)

const getValueFromAssignTo = value => {
  ValueFromAssignTo.value = value 
}

window.Pusher = Pusher
window.Echo = new Echo({
  broadcaster: 'pusher',
  key: '247276ba235e583f320f',
  cluster: 'ap1',
  encrypted: true,
})

const personInChargeId = ref(null)

window.Echo.channel('tickets')
  .listen('TicketApproved', data => {
    console.log('Received TicketApproved Event:', data)

    personInChargeId.value = data.personInChargeId
    
  })

// const assign = ref(false)

const tabs = [
  {
    icon: 'tabler-device-desktop',
    title: 'ICT Tickets',
  },
  {
    icon: 'tabler-augmented-reality-2',
    title: 'GA Tickets',
  },
]

const fetchUser = async id => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/users/${id}` )

    userData.value = ret.data.data
    isLoading.value = false
  } catch(error) {
    isLoading.value = false
    console.log(error)
  }
}



watchEffect(() => {
  fetchUser(userId.value.id)
})

const showUserBioPanel = ref(true)

// watchEffect(() => {
//   console.log('Nilai ValueFromAssignTo berubah:', ValueFromAssignTo.value)

//   if (ValueFromAssignTo.value) {
//     window.location.reload()
//   }
// })
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <!-- <VImg class="mx-auto d-block" :src="SjbImage" width="200" height="200" /> -->
      </VCol>
    </VRow>
    <VRow>
      <VCol
        cols="12"
        class="text-center"
      >
        <h2>Welcome To,</h2>
        <p>
          Project - Management
          <!-- We are <b>THERMOPAK,</b> we are the champion 🚀 -->
        </p>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>

<route lang="yaml">
  meta:
    action: Read
    subject: Dashboard
    redirectIfLoggedIn: false
  </route>
