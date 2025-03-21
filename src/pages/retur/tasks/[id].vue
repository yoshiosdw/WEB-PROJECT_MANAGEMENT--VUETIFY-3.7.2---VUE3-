<script setup>
import axiosIns from '@/plugins/axios'
import ability from '@/plugins/casl/ability'
import router from '@/router'
import { themeConfig } from '@themeConfig'
import { saveAs } from 'file-saver'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import { useReturStore } from '../useReturStore'
import AttachDialog from './attachDialog.vue'
import TaskDialog from './taskDialog.vue'

const route = useRoute()
const returId =  route.params.id
const retur = ref()
const returStore = useReturStore()
const statusTaskFormProcess = ref()
const isLoading = ref(false)
const tasks = ref()

// const fileName = ref()
const items = ref()
const activeTab = ref('handling')

const tabs = [
  {
    title: "Items",
    icon: "tabler-building",
    tab: "item",
  },
  {
    title: "Handling",
    icon: "tabler-building",
    tab: "handling",
  },
]

const fetchTask = async returId => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/return/takses`, {
     
      params: {
        'retur_id': returId,
      },
    })

    tasks.value = ret.data.data
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    Swal.fire({
      text: 'Failed to load task',
      title: 'LBG',
      icon: 'error',
    })
    console.log(error)
  }
}

const reloadTaskData = () => {
  fetchTask(returId)
}

const handleTaskUpdated = isUpdated => {
  if (isUpdated) {
    reloadTaskData()
  }
}

const fetchRetur = async id => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`returns/${id}` )

    retur.value = ret.data.data[0]
    returStore.retur = ret.data.data
    fetchTask(id)
    isLoading.value = false
  } catch (error) {
    Swal.fire({
      text: 'Failed to load retur',
      title: 'LBG',
      icon: 'error',
    })
    router.push({ name: 'retur' })
    console.log(error)
  }
}

const fetchReturItem = async returId  => {
  try {
    const ret = await axiosIns.get(`return/items/${returId}`, {
      headers: {
        'Authorization':'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
      },
    })

    items.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Get item data Failed',
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchRetur(returId),
  fetchReturItem(returId)
})

const deleteData = async itemId => {
  isLoading.value = true
  try{
    const ret = await axiosIns.delete(`return/items/${itemId}` )

    isLoading.value = false
    fetchReturItem(returId)
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Delete data failed.',
      icon: 'error',
    })
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: themeConfig.app.title,
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonColor: 'primary',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

onBeforeUnmount(() => {
  returStore.retur = null
})

const downloadFile = async returId => {
  isLoading.value = true
  try {

    const attach = await axiosIns.get(`/return/takses/${returId}` )

    const fileName = attach.data.data[0].attachment

    const response = await axiosIns.get(`/return/takses/download/${returId}`, {
      responseType: 'blob',
      
    })

    isLoading.value = false

    // Menggunakan file-saver untuk menyimpan file ke sistem file pengguna
    saveAs(response.data, fileName)
  } catch (error) {
    console.error('Error downloading file:', error)
  }
}


const skipTask = async id => {
  try {
    const ret = await axiosIns.patch(`/return/takses/skip/${id}`, {
      status: 9,
    } )

    reloadTaskData()
  } catch(error) {
    Swal.fire({
      title: 'Manufacture',
      text: 'Skip data failed',
      icon: 'error',
    })
  }
}

const btnSkipHandler = id => {
  Swal.fire({
    title: themeConfig.app.title,
    text: 'Sure skip data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    confirmButtonText: 'Yes, skip it!',
    cancelButtonColor: 'primary',
  }).then(ret => {
    if(ret.isConfirmed) {
      skipTask(id)
    }
  })
}

const getFileExtension = contentType => {
  // Mendapatkan ekstensi file dari jenis konten
  const extensionMatch = contentType.match(/\/(.+)$/)
  
  return extensionMatch ? extensionMatch[1] : 'unknown'
}

const truncateText = text => {
  
  return `${text.substring(0, 6)}...`
}

const resolveAttachVariant = attachment => {
  if (attachment !== null)
    return {
      text: attachment,
      color: 'success',
    }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="isLoading" />
      <VCard>
        <VCardTitle>Task Return</VCardTitle>
        <VSpacer />
        <VCardText v-if="retur">
          <VRow>
            <VCol cols="3">
              <VTextField 
                v-model="retur.document_number"
                label="Document Number"
                :readonly="true"
              />
            </VCol>
            <VCol cols="6">
              <VTextField 
                v-model="retur.customer_name"
                label="Customer"
                :readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField 
                v-model="retur.document_date"
                label="Document Date"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="4">
              <VTextField 
                v-model="retur.return_types.name"
                label="Type"
                :readonly="true"
              />
            </VCol>
            <VCol cols="4">
              <VTextField 
                v-model="retur.return_categories.name"
                label="Category"
                :readonly="true"
              />
            </VCol>
            <VCol cols="4">
              <VTextField 
                v-model="retur.return_sub_categories.name"
                label="Sub Category"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea
                v-model="retur.retur_note"
                label="Complain"
                rows="2"
                :readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea
                v-model="retur.settlement"
                label="Requested Solution"
                rows="2"
                :readonly="true"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
      <VSpacer class="mt-6" />

      <VCard>
        <VCardText>
          <VTabs
            v-model="activeTab"
            class="v-tab-pill"
          >
            <VTab
              v-for="item in tabs"
              :key="item.icon.tab"
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

          <VRow v-show="activeTab === 'item'">
            <VCol cols="12">
              <VTable>
                <thead
                  class="text-uppercase"
                  style="background-color: #efefef"
                >
                  <tr>
                    <th scope="col">
                      Item Code
                    </th>
                    <th scope="col">
                      Item Name
                    </th>
                    <th scope="col">
                      Family Product
                    </th>
                    <th scope="col">
                      Qty in Ball
                    </th>
                    <th scope="col">
                      Quantity
                    </th>
                    <!-- <th scope="col">Action</th> -->
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="data in items"
                    :key="data.id"
                  >
                    <td>
                      {{ data.item_code }}
                    </td>
                    <td>
                      {{ data.item_name }}
                    </td>
                    <td>
                      {{ data.item_family_product }}
                    </td>
                    <td style="text-align: right;">
                      {{ data.return_qty_in_ball }}
                    </td>
                    <td style="text-align: right;">
                      {{ data.return_quantity }}
                    </td>
                    <!--
                      <td>
                      <VBtn @click="btnDeleteClickHandler(data.id)" icon="tabler-trash" variant="none" size="24"/>
                      </td> 
                    -->
                  </tr>
                </tbody>
              </VTable>
            </VCol>
          </VRow>
          
          <VRow>
            <VCol
              v-show="activeTab === 'handling'"
              cols="12"
            >
              <VTable>
                <thead
                  class="text-uppercase"
                  style="background-color: #efefef"
                >
                  <tr>
                    <th scope="col">
                      #
                    </th>
                    <th scope="col">
                      Handling
                    </th>
                    <th scope="col">
                      PIC
                    </th>
                    <th scope="col">
                      Required
                    </th>
                    <th scope="col">
                      ACTION DATE
                    </th>
                    <th scope="col">
                      Due Date
                    </th>
                    <th scope="col">
                      Note
                    </th>
                    <th
                      scope="col"
                      style="width:30px"
                    >
                      Attachment
                    </th>
                    <th scope="col">
                      Status
                    </th>
                    <th scope="col">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="data in tasks"
                    :key="data.id"
                  >
                    <td>
                      <div class="d-flex flex-column">
                        <p>{{ data.sequence }}</p>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column text-no-wrap">
                        <p>{{ data.handling_retur }}</p>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column">
                        <p>{{ data.department_in_charge }}</p>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column">
                        <p>{{ data.detail_description }}</p>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column">
                        <p class="text-no-wrap">
                          {{ data.trans_date }}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column">
                        <p class="text-no-wrap">
                          {{ data.due_date }}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column">
                        <p>{{ data.note }}</p>
                      </div>
                    </td>
                    <td
                      style="word-wrap: break-word;"
                      class="text-wrap"
                    >
                      <div
                        class="d-flex flex-column text-wrap"
                        @click="downloadFile(data.id)"
                      >
                        <VChip 
                          v-if="data.attachment !== null"
                          :color="resolveAttachVariant(data.attachment).color"
                          size="small"
                        >
                          {{ truncateText(data.attachment) }}
                        </VChip>
                        <template v-else>
                          {{ data.attachment }}
                        </template>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column">
                        <p>{{ data.status }}</p>
                      </div>
                    </td>
                    <td style="width: 8rem;">
                      <div class="d-flex justify-start">
                        <VBtn
                          icon
                          variant="text"
                          color="default"
                          size="x-small"
                        >
                          <VIcon
                            :size="22"
                            icon="tabler-dots-vertical"
                          />
        
                          <VMenu activator="parent">
                            <VList>
                              <VListItem
                                v-if="data.description === 'NOT REQUIRED' && ability.can('Manage', 'Skip Task') && data.status !== 'SKIP'"
                                @click="btnSkipHandler(data.id)"
                              >
                                <VIcon
                                  color="error"
                                  size="24"
                                  class="me-3"
                                  icon="tabler:circle-half-vertical"
                                />
                                Skip
                              </VListItem>

                              <VListItem
                                v-if="data.status === 'OPEN' && ability.can( data.permissions.split(' - ')[1], data.permissions.split(' - ')[0] ) "
                                value="user"
                              >
                                <!--
                                  <template #prepend >
                                  <VIcon
                                  color="primary"
                                  size="24"
                                  class="me-3"
                                  icon="tabler-check"
                                  />
                                  </template> 
                                -->
                                <TaskDialog
                                  :data="data"
                                  @task-updated="handleTaskUpdated"
                                />
                              </VListItem>

                              <VListItem
                                v-if="data.status === 'CLOSE'"
                                value="user"
                              >  
                                <AttachDialog
                                  :data="data"
                                  @attach-updated="handleTaskUpdated"
                                />
                              </VListItem>

                              <!--
                                <VListItem value="user" v-if="data.status === 'CLOSE'" @click="downloadFile(data.id)">
                                <template #prepend>
                                <VIcon
                                color="warning"
                                size="24"
                                class="me-3"
                                icon="tabler-download"
                                />

                                </template>

                                <VListItemTitle >Download</VListItemTitle>

                                </VListItem>
                              -->
                              
                              <VListItem
                                v-if="data.status === 'OPEN' && ability.can('Delete - Task')"
                                value="duplicate"
                              >
                                <template #prepend>
                                  <VIcon
                                    color="error"
                                    size="24"
                                    class="me-3"
                                    icon="tabler-trash"
                                  />
                                </template>
        
                                <VListItemTitle>Delete</VListItemTitle>
                              </VListItem>
                            </VList>
                          </VMenu>
                        </VBtn>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCol>
          </VRow>
          <VDivider class="mb-4" />
          <VRow>
            <VCol class="d-flex justify-end gap-4">
              <VBtn
                color="warning"
                :to="{ name: 'retur'}"
              >
                Close
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Return
  redirectIfLoggedIn: false
</route>
