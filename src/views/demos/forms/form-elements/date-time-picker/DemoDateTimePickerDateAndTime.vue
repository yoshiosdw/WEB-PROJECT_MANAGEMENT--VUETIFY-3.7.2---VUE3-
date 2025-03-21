<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Date & TIme"
    :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }"
  />
</template>
