<script setup>
const props = defineProps({
  sinarjoUserData: {
    type: Object,
    required: true,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'submit',
  'update:isDialogVisible',
])

const sinarjoUserData = ref(structuredClone(toRaw(props.sinarjoUserData)))
const isUseAsBillingAddress = ref(false)

watch(props, () => {
  sinarjoUserData.value = structuredClone(toRaw(props.sinarjoUserData))
})

const onFormSubmit = () => {
  emit('update:modelValue', false)
  emit('submit', sinarjoUserData.value)
}

const onFormReset = () => {
  sinarjoUserData.value = structuredClone(toRaw(props.sinarjoUserData))
  emit('update:isDialogVisible', false)
}

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 700"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-14 pa-5">
      <VCardItem class="text-center">
        <VCardTitle class="text-h5 mb-3">
          Edit User Information
        </VCardTitle>
        <p class="mb-0">
          Updating user details will receive a privacy audit.
        </p>
      </VCardItem>

      <VCardText>
        <!-- 👉 Form -->
        <VForm
          class="mt-6"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 First Name -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="sinarjoUserData.fullName.split(' ')[0]"
                label="first Name"
              />
            </VCol>

            <!-- 👉 Last Name -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="sinarjoUserData.fullName.split(' ')[1]"
                label="Last Name"
              />
            </VCol>

            <!-- 👉 Billing Email -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="sinarjoUserData.email"
                label="Billing Email"
              />
            </VCol>

            <!-- 👉 Status -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="sinarjoUserData.status"
                label="Status"
              />
            </VCol>

            <!-- 👉 Tax Id -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="sinarjoUserData.taxId"
                label="Tax Id"
              />
            </VCol>

            <!-- 👉 Contact -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="sinarjoUserData.contact"
                label="Contact"
              />
            </VCol>

            <!-- 👉 Language -->
            <VCol
              cols="12"
              md="6"
            >
              <VSelect
                v-model="sinarjoUserData.language"
                chips
                multiple
                label="Language"
                :items="['English', 'Spanish', 'Portuguese', 'Russian', 'French', 'German']"
              />
            </VCol>

            <!-- 👉 Country -->
            <VCol
              cols="12"
              md="6"
            >
              <VSelect
                v-model="sinarjoUserData.country"
                label="Country"
                :items="['USA', 'UK', 'Spain', 'Russia', 'France', 'Germany']"
              />
            </VCol>

            <!-- 👉 Switch -->
            <VCol cols="12">
              <VSwitch
                v-model="isUseAsBillingAddress"
                density="compact"
                label="Use as a billing address?"
              />
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn type="submit">
                Submit
              </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                @click="onFormReset"
              >
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
