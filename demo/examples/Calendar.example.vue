<template>
  <div class="pt-4 fill-height">
    <h3>Calendar</h3>
    <div class="ui divider" />
    <div class="mb-4">Date value: {{ stringDate }}</div>
    <div class="mb-4">minDate: {{ attrs.minDate }}</div>
    <Calendar v-model="stringDate" v-bind="attrs" @input="(val) => log('input', val)" />
    <br />
    <div class="ui button" @click="setDate">
      Update value
    </div>
    <div class="ui button" @click="setMinDate">
      Set minDate
    </div>
    <div class="ui button" @click="toggleToday">
      Toggle today
    </div>
  </div>
</template>

<script>
import Calendar from '@/components/Calendar.vue'
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'CalendarEx',
  components: {
    Calendar,
  },
  setup() {
    const state = reactive({
      // stringDate: '',
      stringDate: '2020-08-05T11:20:00.000+0000',
      attrs: {
        type: 'datetime',
        showToday: true,
        clearable: true,
        // disabledDaysOfWeek: [0, 3],
        // eventClass: 'red',
        // eventDates: [{
        //     date: new Date('2020-08-12T11:20:00.000'),
        //     message:'test event',
        // }],
        minDate: '2020-08-07T11:20:00.000',
      },
    })

    const setDate = () => {
      const newDate = '2020-06-12T14:20:00.000+0000'

      console.log('----------------------------------------')
      console.log('SET DATE')
      console.log('BEFORE', state.stringDate)
      state.stringDate = newDate
      console.log('AFTER', state.stringDate)
    }

    const setMinDate = () => {
      const newDate = '2020-08-02T00:00:00.000'

      console.log('----------------------------------------')
      console.log('SET MINDATE', newDate)
      state.attrs.minDate = newDate
    }

    const toggleToday = () => {
      console.log('HIDE TODAY')
      state.attrs.showToday = !state.attrs.showToday
    }

    const log = (type, val) => {
      console.warn(type, val)
    }

    return { ...toRefs(state), setDate, setMinDate, toggleToday, log }
  },
})
</script>
