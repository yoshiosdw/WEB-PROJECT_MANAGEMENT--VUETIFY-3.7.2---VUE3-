<script setup>
import userImg from '@/assets/images/logolbpersegi.png'

const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const resolveUserStatusVariant = status => {
  if (status === 'Active')
    return {
      color: 'error',
      icon: 'tabler-alert-circle',
    }
  
  return {
    color: 'success',
    icon: 'tabler-checkbox',
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="text-center pt-10">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded
            :size="120"
            color="primary"
            variant="none"
          >
            <VImg 
              max-width="100"
              :src="userImg"
            />
          </VAvatar>

          <!-- 👉 User fullName -->
          <h6 class="text-h6 mt-2">
            {{ props.userData[0].person.name }}
          </h6>
          <VChip
            label
            :color="resolveUserStatusVariant(props.userData.statusName).color"
            size="small"
            class="text-capitalize mt-4"
          >
            {{ props.userData[0].statusName }}
          </VChip>
        </VCardText>
        <VDivider />
        <VCardText>
          <VText class=" d-flex justify-center">
            Details
          </VText>
          <VList class="card-list mt-2">
            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  Name :
                  <span class="text-body-2">
                    {{ props.userData[0].person.name }}
                  </span>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  Username :
                  <span class="text-body-2">{{ props.userData[0].username }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>
            
            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  NIK :
                  <span class="text-body-2">{{ props.userData[0].person.nik }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>
            
            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  Email :
                  <span class="text-body-2">{{ props.userData[0].person.email }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>
            
            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  Address :
                  <span class="text-body-2">{{ props.userData[0].person.address }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>
            
            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  City :
                  <span class="text-body-2">{{ props.userData[0].person.city }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
