export const basic = { ts: `<script setup lang="ts">
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Default"
  />
</template>

`, js: `<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Default"
  />
</template>

` }

export const dateAndTime = { ts: `<script setup lang="ts">
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Date & TIme"
    :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }"
  />
</template>
`, js: `<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Date & TIme"
    :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }"
  />
</template>
` }

export const disabledRange = { ts: `<script setup lang="ts">
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const now = new Date()
const currentMonth = now.toLocaleString('default', { month: '2-digit' })
const currentYear = now.getFullYear()
const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Disabled Range"
    :config="{ dateFormat: 'Y-m-d', disable: [{ from: \`\${currentYear}-\${currentMonth}-20\`, to: \`\${currentYear}-\${currentMonth}-25\` }] }"
  />
</template>
`, js: `<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const now = new Date()
const currentMonth = now.toLocaleString('default', { month: '2-digit' })
const currentYear = now.getFullYear()
const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Disabled Range"
    :config="{ dateFormat: 'Y-m-d', disable: [{ from: \`\${currentYear}-\${currentMonth}-20\`, to: \`\${currentYear}-\${currentMonth}-25\` }] }"
  />
</template>
` }

export const humanFriendly = { ts: `<script setup lang="ts">
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Human Friendly"
    :config="{ altInput: true, altFormat: 'F j, Y', dateFormat: 'Y-m-d' }"
  />
</template>
`, js: `<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Human Friendly"
    :config="{ altInput: true, altFormat: 'F j, Y', dateFormat: 'Y-m-d' }"
  />
</template>
` }

export const inline = { ts: `<script setup lang="ts">
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Inline"
    :config="{ inline: true }"
  />
</template>
`, js: `<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const date = ref('')
</script>

<template>
  <VDateInput
    v-model="date"
    label="Inline"
    :config="{ inline: true }"
  />
</template>
` }

export const multipleDates = { ts: `<script setup lang="ts">
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const multipleDate = ref('')
</script>

<template>
  <VDateInput
    v-model="multipleDate"
    label="Multiple Dates"
    :config="{ mode: 'multiple', dateFormat: 'Y-m-d' }"
  />
</template>
`, js: `<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const multipleDate = ref('')
</script>

<template>
  <VDateInput
    v-model="multipleDate"
    label="Multiple Dates"
    :config="{ mode: 'multiple', dateFormat: 'Y-m-d' }"
  />
</template>
` }

export const range = { ts: `<script setup lang="ts">
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const dateRange = ref('')
</script>

<template>
  <VDateInput
    v-model="dateRange"
    label="Range"
    :config="{ mode: 'range' }"
  />
</template>
`, js: `<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const dateRange = ref('')
</script>

<template>
  <VDateInput
    v-model="dateRange"
    label="Range"
    :config="{ mode: 'range' }"
  />
</template>
` }

export const timePicker = { ts: `<script setup lang="ts">
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const time = ref('')
</script>

<template>
  <VDateInput
    v-model="time"
    label="Time picker"
    :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
  />
</template>
`, js: `<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'

const time = ref('')
</script>

<template>
  <VDateInput
    v-model="time"
    label="Time picker"
    :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
  />
</template>
` }

