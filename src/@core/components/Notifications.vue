<script setup>
import notificationImage from '@/assets/images/illustrations/congo-illustration.png'
import axiosIns from '@/plugins/axios'
import ability from '@/plugins/casl/ability'
import { useNotificationsStore } from '@/store/notificationStore'
import { computed, defineProps, onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { formatDateMySql } from '../utils/formatters'
import NotifDialog from '@/pages/lookup/notification/notifSat.vue'

const props = defineProps({
  badgeProps: {
    type: Object,
    default: () => ({}),
  },
  badgeSat: {
    type: Object,
    default: () => ({}),
  },
  location: {
    type: String,
    default: 'bottom end',
  },
})

const notificationsStore = useNotificationsStore()
const notifdata = ref([])
const loading = ref(false)
const isNotif = ref(false)
const router = useRouter()

const getNotifications = computed(() => notificationsStore.notifications)
const getNotificationSat = computed(() => notificationsStore.notifSATList)

const userData = JSON.parse(localStorage.getItem('sinarjoUserData'))
const roles = userData && userData.roles ? userData.roles.map(r => r.name) : []
const satId = ref()

const fetchNotifications = async () => {
  loading.value = true
  try {
    const response = await axiosIns.get('/notifications/inbox')
    const notifications = response.data.data
    if (!userData) {
      handleNoUserData()
      
      return
    }

    const { role, id: userId } = userData
    if (roles.includes('ICT Staff')) {
      console.log('Role ICT Staff detected') // Debug jika role ICT Staff terdeteksi
    }

    notifdata.value = filterNotifications(notifications, role, userId)
    notificationsStore.setNotifications(notifdata.value)
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    loading.value = false
  }
}

const handleNoUserData = () => {
  notifdata.value = []
  notificationsStore.setNotifications([])
}

const filterNotifications = (notifications, role, userId) => {
  if (roles.includes('administrator') && ability.can('Posting', 'BOA SAT Task')) {
    return notifications
  } else {
    return notifications.filter(notification => filterNotificationByRole(notification, role, userId))
  }
}

const filterNotificationByRole = (notification, role, userId) => {
  if (role === 'ICT Staff') {
    return handleIctStaffRole(notification, userId)
  } else if (ability.can('Posting', 'BOA SAT Task')) {
    return notification.status_sat && notification.sat_number
  }
  
  return false
}

const handleIctStaffRole = (notification, userId) => {
  return (ability.can('Manage', 'ICT Ticket') && notification.message === 'Assign To Me' && notification.person_in_charge_id === userId) || 
         (ability.can('Approver', 'ICT Ticket') && notification.message === 'New Ticket')
}


const markAsRead = async (notificationId, jobOrderId) => {
  satId.value = jobOrderId
  try {
    const notification = notifdata.value.find(n => n.id === notificationId)

    if (notification.message === 'New Ticket' && notification.ticket_id) {
      await navigateToTicket(notification.ticket_id)
    }
    if (notification.message === 'Assign To Me' && notification.ticket_id) {
      await navigateToAssignTicket(notification.ticket_id)
    }

    if (jobOrderId !== null) {
      isNotif.value = true
    } else {
      await axiosIns.delete(`/notification/deletedBy/${notificationId}`)
    }
    fetchNotifications()
  } catch (error) {
    console.error(error)
  }
}

const navigateToTicket = async ticketId => {
  await router.push({ path: `/ticket/id/${ticketId}` })
}

const navigateToAssignTicket = async ticketId => {
  await router.push({ path: `/ticket/assignto/${ticketId}` })
}

const getClosed = async () => {
  isNotif.value = false
  await axiosIns.delete(`/notification/deletedBy/${satId.value}`)
}

const markAllAsRead = async () => {
  try {
    const messagesToDelete = notifdata.value.map(notification => notification.id)

    await axiosIns.post('/notifications/deleteAll', { message_type: messagesToDelete })
    fetchNotifications()
  } catch (error) {
    console.error(error)
  }
}

watchEffect(() => {
  fetchNotifications()
})

// watch([getNotifications, getNotificationSat], ([newNotif, newNotifSat]) => {
//   notifdata.value = [...newNotif, ...newNotifSat] 
// })

watch(() => notificationsStore.notifTrigger, () => {
  fetchNotifications()
})
</script>

<template>
  <VBtn
    icon
    variant="text"
    color="default"
    size="small"
    @click="handleClick"
  >
    <VBadge
      v-if="notifdata"
      :model-value="notifdata.length"
      color="error"
      :content="notifdata.length > 0 ? notifdata.length : null"
    >
      <VIcon
        icon="tabler-bell"
        size="24"
      />
    </VBadge>

    <VMenu
      activator="parent"
      width="380px"
      :location="props.location"
      offset="14px"
    >
      <VList class="py-0">
        <VListItem
          title="Notifications"
          class="notification-section"
          height="48px"
        >
          <template #append>
            <VChip
              v-if="notifdata.length"
              color="primary"
              size="small"
            >
              {{ notifdata.length }} New
            </VChip>
          </template>
        </VListItem>

        <VDivider />

        <div class="notification-list">
          <template
            v-for="notification in notifdata"
            :key="notification.id"
          >
            <VListItem
              :title="`${notification.message || notification.status_sat} - ${notification.ticket_number || notification.sat_number}`"
              :subtitle="notification.department || `by- ${notification.processed_by_sat ?? 'Unknown'}`"
              link
              lines="one"
              min-height="66px"
              @click="markAsRead(notification.id, notification.job_order_task_id)"
            >
              <template #prepend>
                <VListItemAction start>
                  <VAvatar
                    :color="notification.color || 'primary'"
                    :image="notificationImage || undefined"
                    size="40"
                    variant="tonal"
                  />
                </VListItemAction>
              </template>
              <template #append>
                <small class="whitespace-no-wrap">
                  {{ formatDateMySql(notification.created_at) }}
                </small>
              </template>
            </VListItem>
            <VDivider />
          </template>
        </div>

        <VListItem class="notification-section">
          <VBtn
            block
            @click="markAllAsRead"
          >
            READ ALL NOTIFICATIONS
          </VBtn>
        </VListItem>
      </VList>
    </VMenu>

    <NotifDialog
      v-if="isNotif"
      :sat-id="satId"
      @close="getClosed"
    />
  </VBtn>
</template>

<style lang="scss">
.notification-section {
  padding: 14px !important;
}

.v-list-item {
  color: inherit;
}

.notification-list {
  max-height: 300px; /* Set max height for scrollable notifications */
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden; /* Hide horizontal scrolling if not needed */
}
</style>
