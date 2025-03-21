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
  <VRow v-if="userData">
    <VCol
      v-if="isUserBioPanelVisible"
      cols="12"
      md="4"
    >
      <UserBioPanel :user-data="userData" />
    </VCol>

    <VCol
      :cols="isUserBioPanelVisible ? '12' : '12'"
      :md="isUserBioPanelVisible ? '8' : '12'"
    >
      <VTabs
        v-model="userTab"
        class="v-tabs-pill"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.icon"
        >
          <VIcon
            :size="20"
            :icon="tab.icon"
            class="me-1"
          />
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>

      <VWindow
        v-model="userTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem>
          <UserIctTabView :update="ValueFromAssignTo" />
        </VWindowItem>

        <VWindowItem>
          <UserGaTabView :update="ValueFromAssignTo" />
        </VWindowItem>
      </VWindow>
      <VSpacer class="mt-4" />

      <AssignTo
        :update="personInChargeId"
        @update="getValueFromAssignTo"
      />
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Dashboard
    redirectIfLoggedIn: false
</route>
