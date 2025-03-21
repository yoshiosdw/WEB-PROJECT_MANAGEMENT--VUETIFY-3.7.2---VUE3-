<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Human Friendly"
    :config="{ altInput: true, altFormat: 'F j, Y', dateFormat: 'Y-m-d' }"
  />
</template>
