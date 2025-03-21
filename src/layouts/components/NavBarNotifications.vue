<script setup>
import { useNotificationsStore } from '@/store/notificationStore'
import Notifications from '@core/components/Notifications.vue'
import { computed } from 'vue'

const notificationStore = useNotificationsStore()

// Hanya menghitung notifikasi dengan status 0
const getNotificationsCount = computed(() => {
  return notificationStore.notifications.filter(notification => notification.status === 0).length
})

const getSatNotificationsCount = computed(() => {
  return notificationStore.notifSATList.length
})

const notifications = computed(() => notificationStore.notifications)
</script>

<template>
  <Notifications
    :notifications="notifications"
    :badge-props="{ content: getNotificationsCount }"
    :badge-sat="{ content: getSatNotificationsCount }"
  />
</template>
