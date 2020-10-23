<template>
    <div class="pt-4 fill-height">
        <h3>Calendar</h3>
        <div class="ui divider" />
        <div class="d-flex">
            <div class="pr-15" style="border-right: 1px solid #ccc">
                <div class="mb-4">Date value: {{ oldStringDate }}</div>
                <div class="mb-4">minDate: {{ oldAttrs.minDate }}</div>
                <OldCalendar v-model="oldStringDate" v-bind="oldAttrs" @input="val => log('input', val)" />
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
            <div class="pl-4">
                <Calendar />
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'
import OldCalendar from '@/components/OldCalendar.vue'
import Calendar from '@/components/Calendar.vue'

export default defineComponent({
    components: {
        Calendar,
        OldCalendar
    },
    setup() {
        const state = reactive({
            // oldStringDate: '',
            oldStringDate: '2020-08-05T11:20:00.000+0000',
            oldAttrs: {
                type: 'date',
                showToday: true,
                // disabledDaysOfWeek: [0, 3],
                // eventClass: 'red',
                // eventDates: [{
                //     date: new Date('2020-08-12T11:20:00.000'),
                //     message:'test event',
                // }],
                minDate: '2020-08-07T11:20:00.000'
            }
        })

        const setDate = () => {
            const newDate = '2020-06-12T11:20:00.000+0000'
            console.log('----------------------------------------')
            console.log('SET DATE')
            console.log(state.oldStringDate)
            state.oldStringDate = newDate
            console.log(state.oldStringDate)
        }

        const setMinDate = () => {
            const newDate = '2020-08-02T11:20:00.000'
            console.log('----------------------------------------')
            console.log('SET MINDATE', newDate)
            state.oldAttrs.minDate = newDate
        }

        const toggleToday = () => {
            console.log('HIDE TODAY')
            state.oldAttrs.showToday = !state.oldAttrs.showToday
        }

        const log = (type, val) => {
            console.warn(type, val)
        }

        return { ...toRefs(state), setDate, setMinDate, toggleToday, log }
    }
})
</script>
