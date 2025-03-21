<script setup>
const perPage = ref(10);


</script>
<template>
  <VRow>
    <VCol cols="12">
      <VCard :loading="showloading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10,20,30,50]"
            />
          </div>
          <VTextField placeholder="Search data.." />
        </VCardText>
          <VTable>
            <thead class="text-uppercase" style="background-color: #efefef;">
              <tr>
                <th scope="col">Docomunet Number</th>
                <th scope="col">Docomunet Date</th>
                <th scope="col">Requestor</th>
                <th scope="col">Extention</th>
                <th scope="col">IP Number</th>
                <th scope="col">Status</th>
                <th scope="col">Category</th>
                <th scope="col">Type</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              
            </tbody>
          </VTable>
          <!-- <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">
            {{ paginationData }}
          </span>

          <VPagination v-model="page"
            size="small"
            :total-visible="5"
            :length="lastTickets"
          />
        </VCardText> -->
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Ticket
    redirectIfLoggedIn: false
  </route>
