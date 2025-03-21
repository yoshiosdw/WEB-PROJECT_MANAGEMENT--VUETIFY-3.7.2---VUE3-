<script setup>
import Task from './dashboard/task.vue'
import Priority from './dashboard/priority.vue'
import Versus from './dashboard/versus.vue'
import ToDo from './dashboard/toDo.vue'
import Inprogress from './dashboard/progres.vue'
import Done from './dashboard/done.vue'
import Hold from './dashboard/hold.vue'
import Project from './dashboard/project.vue'
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'
import { watchEffect } from 'vue'
import Swal from 'sweetalert2'
import axiosIns from '@/plugins/axios'
import Monthly from './dashboard/monthly.vue'
import BiuCount from './dashboard/byBiu.vue'

const inprogress = ref([])
const todo = ref([])
const hold = ref([])
const done = ref([])
const priority = ref([])
const allTask = ref([])
const totalproject = ref([])
const overdueData = ref([])
const trackData = ref([])
const lastMonthFirst = ref([])
const lastMonthSecond = ref([])
const lastMonthThree = ref([])
const monthName = ref([])

const fetchData = async () => {

  try {
    const ret = await axiosIns.get(`/project/dashboard`)
    
    inprogress.value = ret.data[0].total_in_progress
    todo.value = ret.data[0].total_todo
    done.value = ret.data[0].total_done
    hold.value = ret.data[0].total_hold

    priority.value = ret.data[0]
    allTask.value = ret.data[0].total_task
    totalproject.value = ret.data[0].total_projects

    overdueData.value = ret.data[0].total_overdue
    trackData.value = ret.data[0].total_onTrack

    monthName.value = ret.data[0]

    lastMonthFirst.value = ret.data[0].last_month_1
    lastMonthSecond.value = ret.data[0].last_month_2
    lastMonthThree.value = ret.data[0].last_month_3

  } catch (error) {
    Swal.fire({
      title: 'LBG',
      icon: 'error',
      text: error,
    })
  } finally {
  }
}

watchEffect(() => {
  fetchData()
})
</script>

<template>
  <VRow>
    <VCol
      cols="4"
      md="4"
    >
      <VRow>
        <VCol
          cols="12"
          lg="6"
          md="3"
          sm="6"
        >
          <ToDo :todo="todo" />
        </VCol>

        <VCol
          cols="12"
          lg="6"
          md="3"
          sm="6"
        >
          <Inprogress :progress="inprogress" />
        </VCol>

        
        <VCol
          cols="12"
          lg="6"
          md="3"
          sm="6"
        >
          <Done :done="done" />
        </VCol>

        
        <VCol
          cols="12"
          lg="6"
          md="3"
          sm="6"
        >
          <Hold :hold="hold" />
        </VCol>

        <!--
          <VCol
          cols="12"
          md="6"
          >
          <AnalyticsSupportTracker />
          </VCol> 
        -->
      </VRow>
    </VCol>
    <VCol
      cols="8"
      md="8"
    >
      <Priority :priority="priority" />
    </VCol>
    <VCol
      cols="6"
      md="6"
    >
      <Task
        :task="allTask"
        :done="done"
        :project="totalproject"
      />
    </VCol> 
    <!--
      <VCol
      cols="4"
      md="4"
      >
      <Project :project="totalproject" />
      </VCol>  
    -->
    <VCol
      cols="6"
      md="6"
    >
      <Versus
        :track-data="trackData"
        :overdue-data="overdueData"
        :task-data="allTask"
      />
    </VCol> 
    <VCol
      cols="6"
      md="6"
    >
      <Monthly 
        :priority="priority"
        :month-name="monthName"
        :last-month-first="lastMonthFirst"
        :last-month-second="lastMonthSecond"
        :last-month-three="lastMonthThree"
      />
    </VCol> 
    <VCol
      cols="6"
      md="6"
    >
      <BiuCount />
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
