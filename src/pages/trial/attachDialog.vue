<script setup>
import axiosIns from "@/plugins/axios";
import Swal from "sweetalert2";

const isVisible = ref(false);
const attachment = ref();
const attachFile = ref();
const attachForm = ref();

const props = defineProps({
  data: {
    type: Object,
  },
});

const uploadAttach = async () => {
  try {
    const ret = await axiosIns.post(
      `trial/items/${props.data.id}`,
      {
        attachment: attachFile.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    Swal.fire({
      title: "Manufacture",
      text: "File Uploaded",
      icon: "success",
    });
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: error.response.data.errors.attachment[0],
      icon: "error",
    });
  }
};

const handleFileChange = (event) => {
  attachFile.value = event.target.files[0];
};

const onSubmit = () => {
  attachForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      uploadAttach();
      isVisible.value = false;
    }
  });
};

const cancelClickHandler = () => {
  isVisible.value = false;
};
</script>

<template>
  <VDialog v-model="isVisible" :width="900" persistent>
    <template #activator="{ props }">
      <VListItemTitle v-bind="props">Attach</VListItemTitle>
    </template>
    <VCard>
      <VCardText title="Attachment">
        <VForm ref="attachForm" @submit.prevent="onSubmit" style="height: auto">
          <VRow>
            <VCol cols="12">
              <div class="mt4">
                <VFileInput
                  label="Attach file"
                  v-model="attachment"
                  @change="handleFileChange"
                  accept=".pdf"
                />
              </div>
              <div class="d-flex mt-6 gap-4 justify-end">
                <VBtn color="success" type="submit">Save</VBtn>
                <VBtn color="warning" @click="cancelClickHandler">Cancel</VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
meta:
  action: Manage
  subject: Trial Attach Lab Result 
</route>
