<script setup>
import miscComingSoon from '@images/pages/misc-coming-soon.png'
import miscMaskDark from '@images/pages/misc-mask-dark.png'
import miscMaskLight from '@images/pages/misc-mask-light.png'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'

const email = ref('')
const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)
</script>

<template>
  <div class="misc-wrapper">
    <div>
      <!-- 👉 Title and subtitle -->
      <div class="text-center mb-4">
        <h4 class="text-h4 font-weight-medium mb-1">
          We are launching soon 🚀
        </h4>
        <p>Our website is opening soon. Please register to get notified when it's ready!</p>
      </div>

      <!-- 👉 Email input -->
      <VForm @submit.prevent="() => {}">
        <VTextField
          v-model="email"
          placeholder="Enter your email"
          class="misc-email-input"
        >
          <template #append>
            <VBtn
              type="submit"
              class="mt-n2"
            >
              Notify
            </VBtn>
          </template>
        </VTextField>
      </VForm>
    </div>

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 mt-10">
      <VImg
        :src="miscComingSoon"
        alt="Coming Soon"
        :max-width="263"
        class="mx-auto"
      />
    </div>

    <VImg
      :src="authThemeMask"
      class="misc-footer-img d-none d-md-block"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";

.misc-email-input {
  margin-inline: auto;
  max-inline-size: 21.875rem;
  min-inline-size: 12.5rem;
}
</style>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
