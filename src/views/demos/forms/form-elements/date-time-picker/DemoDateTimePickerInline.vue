<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Inline"
    :config="{ inline: true }"
  />
</template>
