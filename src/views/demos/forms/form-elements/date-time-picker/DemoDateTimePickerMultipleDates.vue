<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const multipleDate = ref('')
</script>

<template>
  <VDateInput
    v-model="multipleDate"
    label="Multiple Dates"
    :config="{ mode: 'multiple', dateFormat: 'Y-m-d' }"
  />
</template>
