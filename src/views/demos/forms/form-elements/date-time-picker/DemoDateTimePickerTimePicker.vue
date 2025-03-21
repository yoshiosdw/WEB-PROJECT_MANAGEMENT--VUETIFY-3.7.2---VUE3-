<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const time = ref('')
</script>

<template>
  <VDateInput
    v-model="time"
    label="Time picker"
    :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
  />
</template>
