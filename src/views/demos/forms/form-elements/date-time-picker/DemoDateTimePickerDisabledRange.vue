<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const now = new Date()
const currentMonth = now.toLocaleString('default', { month: '2-digit' })
const currentYear = now.getFullYear()
const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Disabled Range"
    :config="{ dateFormat: 'Y-m-d', disable: [{ from: `${currentYear}-${currentMonth}-20`, to: `${currentYear}-${currentMonth}-25` }] }"
  />
</template>
