<script setup>

</script>

<template>
  <VCard>
    <VCardText>
      <VRow>
        <VCol cols="4" class="text-center">
          <small class="font-weight-semibold text-success">Total</small>
          <h3 class="text-h4 text-success"></h3>
        </VCol>
        <VDivider vertical />
        <VCol cols="4" class="text-center">
          <small class="font-weight-semibold text-success">Status Open</small>
          <h3 class="text-h4 text-success"></h3>
        </VCol>
        <VDivider vertical />
        <VCol cols="4" class="text-center" :style="color=red">
          <small class="font-weight-semibold text-error">Status Overdue</small>
          <h3 class="text-h4 text-success"></h3>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: SAT
    redirecIfLoggedIn: false
</route>
