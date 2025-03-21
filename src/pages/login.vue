<script setup>
import SjbImage from '@/assets/images/logo.svg'
import axiosIns from '@/plugins/axios'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { requiredValidator } from '@validators'
import Swal from 'sweetalert2'
import { VForm } from 'vuetify/components'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()
const ability = useAppAbility()
const loading = ref(false)

const errors = ref({
  username: undefined,
  password: undefined,
})

const refVForm = ref()
const username = ref('')
const password = ref('')

const login = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.post('/login', {
        username: username.value,
        password: password.value
    })
    console.log(ret);
    const sinarjoUserAbilities = ret.data.data.ability
    const sinarjoUserData = ret.data.data
    const sinarjoAccessToken = ret.data.meta.token
    loading.value = false
    localStorage.setItem('sinarjoUserAbilities', JSON.stringify(sinarjoUserAbilities))
    ability.update(sinarjoUserAbilities)
    localStorage.setItem('sinarjoUserData', JSON.stringify(sinarjoUserData))
    localStorage.setItem('sinarjoAccessToken', sinarjoAccessToken) 

    router.replace(route.query.to ? String(route.query.to) : '/')
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Username atau password Anda salah',
      icon: 'error'
    })
    loading.value = false
    console.log(error);
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper"
  >
    <VCol
      lg="8"
      class="d-none d-lg-flex"
    >
      <div class="position-relative auth-bg rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="325"
            :src="SjbImage"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          :src="authThemeMask"
          class="auth-footer-mask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      lg="4"
      class="d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <!-- <VNodeRenderer
            :nodes="themeConfig.app.logo"
            class="mb-6"
          /> -->

          <h5 class="text-h5 font-weight-semibold mb-1">
            Welcome to PROJECT MANAGEMENT! 👋🏻
          </h5>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="username"
                  label="Username"
                  :rules="[requiredValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="password"
                  label="Password"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between mt-2 mb-4">
                  <!-- <RouterLink
                    class="text-primary ms-2 mb-1"
                    :to="{ name: 'forgot-password' }"
                  >
                    Forgot Password?
                  </RouterLink> -->
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                  :disabled="loading"
                >
                  Login
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: Read
  subject: Auth
  redirectIfLoggedIn: true
</route>
