<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import TableView from './tableView.vue'

const jobFunctions = ref(null)
let treeData = ref()
const showLoading = ref(true)
const treeOrientation = ref("0")

const fetchJobFunctions = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/job/functions/show/tree' )

    console.log(ret.data.data[0])
    jobFunctions.value = ret.data.data
    treeData.value = ret.data.data[0]
    showLoading.value = false
  } catch (error) {
    showLoading.value = false
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Fail to load Records',
      icon: 'error',
    })
  }
}

const tabs = [
  {
    title: 'Chart View',
    icon: 'ri:organization-chart',
    tab:'chartview',
  },
  {
    title: 'Table View',
    icon: 'tabler-table',
    tab:'tableview',
  },
]

watchEffect(() => {
  fetchJobFunctions()
})

const activeTab = ref('chartview')
</script>

<template>
  <VRow>
    <VOverlay v-model="showLoading" />
    <VCol
      v-if="jobFunctions"
      cols="12"
    >
      <VTabs
        v-model="activeTab"
        grow
      >
        <VTab
          v-for="item in tabs"
          :key="item.icon"
          :value="item.tab"
        >
          <VIcon
            size="20"
            start
            :icon="item.icon"
          />
          {{ item.title }}
        </VTab>
      </VTabs>
      <VCard class="my-card">
        <VCardText>
          <VWindow
            v-model="activeTab"
            class="mt-6 disable-tab-transition"
            :touch="false"
          >
            <VWindowItem value="chartview">
              <div class="text-center">
                <!-- ✍️ treeOrientation: 1 = Horizontal, 0 = Vertical -->
                <BlocksTree 
                  :data="treeData" 
                  :props="{label: 'name', children: 'children', key:'id', expand: 'expand'}"
                  :horizontal="treeOrientation=='1'"  
                  :collapsable="true"
                />
              </div>
            </VWindowItem>
            <VWindowItem value="tableview">
              <div>
                <TableView />
              </div>
            </VWindowItem>
          </VWindow>
        </VCardText>
      </VCard>
      <!--
        <VCard :loading="showLoading">
        <VCardText>
          
        </VCardText>
        </VCard> 
      -->
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Return
  redirectIfLoggedIn: false
</route>

<style scoped>
  .my-card {
    overflow-x: auto;
  }
</style>
