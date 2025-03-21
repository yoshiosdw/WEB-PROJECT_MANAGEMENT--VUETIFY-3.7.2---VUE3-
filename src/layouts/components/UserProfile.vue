<script setup>
import { initialAbility } from '@/plugins/casl/ability'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useBioPanelStore } from '@/store/biopanelStore'
import { useRouter } from 'vue-router'

const emit = defineEmits(['profile'])
const biopanelStore = useBioPanelStore() 
const showUserBioPanel = ref(biopanelStore.showUserBioPanel)

const router = useRouter()
const ability = useAppAbility()
const sinarjoUserData = JSON.parse(localStorage.getItem('sinarjoUserData') || 'null')


const emitSwitchChange = () => {
  emit('profile', showUserBioPanel.value)
  biopanelStore.showUserBioPanel = showUserBioPanel.value 
}

watch(showUserBioPanel, newValue => {
  localStorage.setItem('showUserBioPanel', JSON.stringify(newValue))
  biopanelStore.showUserBioPanel = newValue 
})

const toggleUserBioPanel = () => {
  showUserBioPanel.value = !showUserBioPanel.value
  emit('profile', showUserBioPanel.value)
  biopanelStore.showUserBioPanel = showUserBioPanel.value 
}

const logout = () => {

  // Remove "sinarjoUserData" from localStorage
  localStorage.removeItem('sinarjoUserData')

  // Remove "sinarjoAccessToken" from localStorage
  localStorage.removeItem('sinarjoAccessToken')
  router.push('/login').then(() => {

    // Remove "sinarjoUserAbilities" from localStorage
    localStorage.removeItem('sinarjoUserAbilities')

    // Reset ability to initial ability
    ability.update(initialAbility)
  })
}
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg
        v-if="sinarjoUserData && sinarjoUserData.avatar"
        :src="sinarjoUserData.avatar"
      />
      <VIcon
        v-else
        icon="tabler-user"
      />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg
                      v-if="sinarjoUserData && sinarjoUserData.avatar"
                      :src="sinarjoUserData.avatar"
                    />
                    <VIcon
                      v-else
                      icon="tabler-user"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>
            <VListItemTitle class="font-weight-semibold">
              {{ sinarjoUserData.person.name }}
            </VListItemTitle>
            <VListItemSubtitle class="grey--text">
              {{ sinarjoUserData.username }} | {{ sinarjoUserData.role }}
            </VListItemSubtitle>
            <!-- <VListItemSubtitle>{{ sinarjoUserData.role }}</VListItemSubtitle> -->
          </VListItem>
          <VDivider />
          
          <VListItem
            @click="toggleUserBioPanel"
          >
            <template #prepend>
              <VIcon
                size="22"
                class="me-3"
                :icon="showUserBioPanel ? 'tabler:eye-off' : 'tabler:eye'"
              />
            </template>
            <VListItemSubtitle>
              {{ showUserBioPanel ? 'Hide Profile' : 'Show Profile' }}
            </VListItemSubtitle>
          </VListItem>

          <VListItem
            value="user"
            :to="{ name: 'home-user' }"
          >
            <template #prepend>
              <VIcon
                size="22"
                class="me-3"
                icon="tabler:key"
              />
            </template>
            <VListItemSubtitle>Change Password</VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem
            link
            @click="logout"
          >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-logout"
                size="22"
              />
            </template>

            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
