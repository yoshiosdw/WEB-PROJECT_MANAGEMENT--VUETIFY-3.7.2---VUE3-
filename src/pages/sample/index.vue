<script setup>
import { onMounted } from 'vue';

const sample = ref()

onMounted(()=>{
  sample.value = 'asdfas'
})
</script>
<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText>
          {{ sample }}
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
<route lang="yaml">
  meta:
    action: Read
    subject: Auth
    redirectIfLoggedIn: false
  </route>