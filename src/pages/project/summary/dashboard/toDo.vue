<script setup>
const props = defineProps({
  todo: {
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
          To Do
        </h6>
      </div>
      <div class="hold-container">
        <h6 class="hold-value">
          {{ props.todo }}
        </h6>
      </div>
      <div class="text-sm text-center text-disabled mt-6">
        Task is toDo
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
