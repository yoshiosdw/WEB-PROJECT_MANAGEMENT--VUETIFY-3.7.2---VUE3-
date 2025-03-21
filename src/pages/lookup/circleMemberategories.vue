<script setup>
import axiosIns from '@/plugins/axios'
import { useToast } from 'vue-toastification'

const emits = defineEmits(['categories'])
const toast = useToast()
const isVisible = ref(false)
const categories = ref([])
const total = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const from = ref()
const to = ref()
const find = ref('')
const findText = ref('')

const sendData = val => {
  emits('categories', val)
  isVisible.value = false
}

const fetchMemberCategories = async (page, perPage, find) => {
  try {
    const response = await axiosIns.get('/qcc/circle/member/categories', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    categories.value = response.data.data
    total.value = response.data.meta.total
    last.value = response.data.meta.last
    from.value = response.data.meta.from
    to.value = response.data.meta.to
  } catch (error) {
    toast.error('Gagal memuat kategori')
    console.log(error)
  }
}

const findCategory = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchMemberCategories(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  return `Showing ${from.value} to ${to.value} of ${total.value}`
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
                @keydown.enter="findCategory"
              />
              
              <div class="d-flex justify-end gap-4">
                <VBtn
                  icon="tabler-search"
                  :size="40"
                  variant="outlined"
                  color="warning"
                  @click="findCategory"
                />
              </div>
            </div>     
          </VCol>
        </VRow>
      </VCardText>
      <VCardText />
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
