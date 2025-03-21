<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const dateRange = ref('')
</script>

<template>
  <VDateInput
    v-model="dateRange"
    label="Range"
    :config="{ mode: 'range' }"
  />
</template>
