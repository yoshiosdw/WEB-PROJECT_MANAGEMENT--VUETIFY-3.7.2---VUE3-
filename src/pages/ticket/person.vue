<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import {defineProps} from 'vue'

const props = defineProps({
  ticket:{
    type: String,
    default: null,
  },
})
const emits = defineEmits(['person'])
const isVisible = ref(false)
const people = ref([])
const totalPeople = ref(0)
const perPage = ref(20)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const sendData = val => {
  emits('person', val)
  isVisible.value = false
}

const fetchPeople = async (page, perPage, find) => {
  try {
    if (props.ticket !== null){
      const response = await axiosIns.get(`/tickets/person/${props.ticket}`, {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    people.value = response.data.data
    totalPeople.value = response.data.meta.total
    last.value = response.data.meta.last

    }else{
      const response = await axiosIns.get(`/users`, {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    people.value = response.data.data
    totalPeople.value = response.data.meta.total
    last.value = response.data.meta.last
    }
    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load Person',
      icon: 'error',
    })
    console.log(error)
  }
}

const findPeople = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchPeople(page.value, perPage.value, find.value, props.ticket)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalPeople.value}`
})
</script>

<template>
  <VDialog
    v-model="isVisible"
    width="1024"
    transition="dialog-bottom-transition"
    persistent
  >
    <template #activator="{props}">
      <VBtn v-bind="props">
        Find
      </VBtn>
    </template>

    <DialogCloseBtn @click="isVisible = !isVisible" />

    <VCard title="Find People">
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex gap-3">
              <div style="min-width: 80px;">
                <VSelect 
                  v-model="perPage"
                  :items="[10, 20, 30, 50]"
                />
              </div>
              <VTextField
                v-model="findText"
                placeholder="Search Person"
                @keydown.enter="findPeople"
              />
              
              <div class="d-flex justify-end gap-4">
                <VBtn
                  icon="tabler-search"
                  :size="40"
                  variant="outlined"
                  color="warning"
                  @click="findPeople"
                />
              </div>
            </div>     
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
        <VTable>
          <thead class="text-uppercase">
            <tr>
              <th scope="col">
                Name
              </th>
              <th scope="col">
                Email
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="person in people"
              :key="person.id"
            >
              <td>
                <div class="d-flex flex-column">
                  <p>{{ person.person.name }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ person.person.email }}</p>
                </div>
              </td>
              <td>
                <VBtn
                  variant="none"
                  color="default"
                  icon
                  size="small"
                  @click="sendData(person)"
                >
                  <VIcon
                    size="24"
                    icon="tabler-check"
                  />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
      <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
        <span class="text-sm text-disabled">
          {{ paginationData }}
        </span>

        <VPagination
          v-model="page"
          size="small"
          :total-visible="5"
          :length="last"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Person
  redirectIfLoggedIn: false
</route>
