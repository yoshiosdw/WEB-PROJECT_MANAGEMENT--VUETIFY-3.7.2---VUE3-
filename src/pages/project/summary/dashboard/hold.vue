<script setup>
const props = defineProps({
  hold: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <VCard>
    <VCardText>
      <div>
        <h6 class="text-h6">
          Hold
        </h6>
      </div>
      <div class="hold-container">
        <h6
          class="hold-value"
          style="color: #D9534F;"
        >
          {{ props.hold }}
        </h6>
      </div>
      <div class="text-sm text-center text-disabled mt-6">
        Task is Hold
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
