<script setup>
import General from './general.vue';
import Security from './security.vue';

const showLoading = ref(true)

const tabs = [
  {
    title: 'General',
    icon: 'tabler-user',
    tab:'person'
  },
  // {
  //   title: 'Security',
  //   icon: 'tabler-lock',
  //   tab:'security'
  // }
]

const activeTab = ref('person')

const getStatusFromGeneralPage = val => {
  if(val){
    activeTab.value = 'general'
  }
}

</script>
<template>
  <VRow>
    <VCol cols="12">
      <VCard :loading="showLoading">
        <VCardText>
          <VTabs v-model="activeTab" class="v-tabs-pill">
            <VTab v-for="item in tabs" :key="item.icon" :value="item.tab">
              <VIcon size="20" start :icon="item.icon"/>
              {{ item.title }}
            </VTab>
          </VTabs>
          <VWindow v-model="activeTab"
            class="mt-6 disable-tab-transition"
            :touch="false"
          >
            <VWindowItem value="person">
              <General @status="getStatusFromGeneralPage"/>
            </VWindowItem>
            <VWindowItem value="security">
              <Security />
            </VWindowItem>
          </VWindow>
        </VCardText>
      </VCard>
      <!-- <VCard :loading="showLoading">
        <VCardText>
          
        </VCardText>
      </VCard> -->
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
