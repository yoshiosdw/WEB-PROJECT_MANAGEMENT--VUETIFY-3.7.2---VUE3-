<script setup>
import axiosIns from '@/plugins/axios';
import Swal from 'sweetalert2';
import TableView from './tableView.vue';
import { useOrganizationStore } from './useOrganizationStore';
const organizationStore = useOrganizationStore()

const tabs = [
  {
    title: 'Chart View',
    icon: 'ri:organization-chart',
    tab:'chartview'
  },
  {
    title: 'Table View',
    icon: 'tabler-table',
    tab:'tableview'
  }
]

const treeOrientation = ref("0");

let treeData = ref()
const organization = ref()

const fetchOrganizationsTree = async () => {
  try {
    const ret = await axiosIns('/organizations/tree', {
      headers: {
        'Authorization': 'Bearer '+ localStorage.getItem('sinarjoAccessToken')
      }
    })
    organization.value = ret.data.data[0]
    organizationStore.organizations = ret.data.data
    treeData.value = organization.value
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Fail to load data organization',
      icon: 'error'
    })
    console.log(error);
  }
}

const activeTab = ref('chartview')

watchEffect(() => {
  fetchOrganizationsTree()

})

</script>
<template>
  <VRow>
    <VCol cols="12" v-if="organization">

      <VTabs v-model="activeTab" grow>
        <VTab v-for="item in tabs" :key="item.icon" :value="item.tab">
          <VIcon size="20" start :icon="item.icon"/>
          {{ item.title }}
        </VTab>
      </VTabs>
      <VCard class="my-card">
        <VCardText>
          <VWindow v-model="activeTab"
            class="mt-6 disable-tab-transition"
            :touch="false"
          >
            <VWindowItem value="chartview">
              <div class="text-center">
                <!-- ✍️ treeOrientation: 1 = Horizontal, 0 = Vertical -->
                <blocks-tree 
                  :data="treeData" 
                  :props="{label: 'name',  children: 'children',  key:'id', expand: 'expand'}"
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
  subject: Organization
  redirectIfLoggedIn: false
</route>

<style scoped>
  .my-card {
    overflow-x: auto;
  }
</style>
