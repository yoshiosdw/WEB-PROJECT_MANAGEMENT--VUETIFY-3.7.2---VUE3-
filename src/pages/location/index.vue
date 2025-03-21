<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import BlocksTree from 'vue3-blocks-tree'
import TableView from './tableView.vue'
import { useLocationStore } from './useLocationStore'

const locationStore = useLocationStore()

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

const treeOrientation = ref("0")

let treeData = ref()
const location = ref()

const fetchLocationTree = async () => {
  try {
    const ret = await axiosIns.get('/locations/all/tree' )

    location.value = ret.data.data[0]
    locationStore.locations = ret.data.data
    treeData.value = location.value

    console.log(treeData.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Fail to load data Location',
      icon: 'error',
    })
    console.log(error)
  }
}

const activeTab = ref('chartview')

onMounted(() => {
  fetchLocationTree()
})
</script>

<template>
  <VRow>
    <VCol
      v-if="location"
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
              <div
                v-if="treeData"
                class="text-center"
              >
                <BlocksTree 
                  :data="treeData" 
                  :props="{label: 'name', children: 'children', key:'id'}"
                  :horizontal="treeOrientation=='1'"  
                  collapsable
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
  subject: Dashboard
  redirectIfLoggedIn: false
</route>

<style scoped>
  .my-card {
    overflow-x: auto;
  }
</style>
