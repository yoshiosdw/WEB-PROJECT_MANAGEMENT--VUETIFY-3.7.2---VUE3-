<script setup>
const props = defineProps({
  progress: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <VCard>
    <VCardText>
      <div>
        <h5 class="text-h6">
          In Progress
        </h5>
      </div>
      <div class="hold-container">
        <h6
          class="hold-value"
          style="color: #00CFE8;"
        >
          {{ props.progress }}
        </h6>
      </div>
      <div class="text-sm text-center text-disabled mt-6">
        Task in Progress
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.hold-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.hold-value {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
}
</style>
