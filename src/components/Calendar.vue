<template>
    <div class="pitcher-calendar">
        <DatePicker v-bind="calendarAttr" @input="onChange">
            <template #default="{ inputValue }">
                <div class="ui input left icon" v-bind="inputAttr">
                    <i class="calendar icon" />
                    <input type="text" :value="inputValue" :placeholder="defaultText" />
                </div>
            </template>
        </DatePicker>
    </div>
</template>
<script>
import { computed } from '@vue/composition-api'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'
import { parsePxStyle, validateSize } from './mixins'
import { formatDate } from '../i18n/date.js'

export default {
    components: {
        DatePicker
    },
    props: {
        value: {
            type: [String, Date],
            required: false
        },
        minDate: [String, Date],
        maxDate: [String, Date],
        defaultText: {
            type: String,
            default: () => $gettext('Date/Time')
        },
        disabledDaysOfWeek: Array,
        disabledDates: Array,
        enabledDates: Array,
        eventDates: Array,
        eventClass: String,
        disableYear: Boolean,
        disableMonth: Boolean,
        disableMinute: Boolean,
        disableValueFormatting: {
            type: Boolean,
            default: false
        },
        valueFormatter: {
            type: Function,
            required: false,
            // must be function instead of array function to be able to reach component instance
            default: function(date) {
                // if date format
                const yyyy = date.getFullYear().toString()
                const mm = (date.getMonth() + 1).toString()
                const dd = date.getDate().toString()
                return `${yyyy}-${mm[1] ? mm : '0' + mm[0]}-${dd[1] ? dd : '0' + dd[0]}`
            }
        },
        disableInputFormatting: {
            type: Boolean,
            default: false
        },
        inputFormatter: {
            type: Function,
            required: false,
            default: date => formatDate(date)
        },
        action: {
            type: String,
            default: 'activate'
        },
        fluid: Boolean,
        disabled: Boolean,
        loading: {
            type: Boolean,
            default: false
        },
        error: Boolean,
        minWidth: {
            type: [Number, String]
        },
        maxWidth: {
            type: [Number, String],
            default: '100%'
        },
        size: {
            type: String,
            validator: val => validateSize(val, 'Calendar.vue')
        }
    },
    emits: ['input', 'onBeforeChange', 'onShow', 'onVisible', 'onHide', 'onHidden', 'onSelect'],

    setup(props, { emit }) {
        const inputAttr = computed(() => ({
            class: {
                fluid: props.fluid,
                loading: props.loading,
                disabled: props.disabled || props.loading,
                error: props.error,
                [props.size]: !!props.size
            },
            style: {
                minWidth: props.minWidth ? parsePxStyle(props.minWidth) : undefined,
                maxWidth: parsePxStyle(props.maxWidth)
            }
        }))

        const calendarAttr = computed(() => ({
            value: parseDate(props.value),
            minDate: props.minDate ? parseDate(props.minDate) : undefined,
            maxDate: props.maxDate ? parseDate(props.maxDate) : undefined,
            popover: {
                visibility: 'focus',
                keepVisibleOnInput: true
            },
            color: props.color ? props.color : undefined
        }))

        const onChange = date => {
            let result = date
            console.log('ON_CHANGE', date)

            if (!result) return ''

            // if formatting disabled, emit raw value
            if (props.disableValueFormatting) {
                emit('input', result)
                return
            }

            // format
            result = props.valueFormatter(result)
            console.log('value change:', result)
            emit('input', result)
        }

        const parseDate = dateString => {
            if (dateString === '') {
                return dateString
            }

            if (new Date(dateString).toString() !== 'Invalid Date') {
                return new Date(dateString)
            }

            console.error(`[ERROR]: Calendar value is not valid! value: ${dateString} type: ${typeof dateString}`)
        }

        const initCalendar = () => {
            const settings = {
                type: props.type,
                minDate: parseDate(props.minDate),
                maxDate: parseDate(props.maxDate),
                initialDate: props.value,
                today: props.showToday,
                ampm: props.showAmPm,
                showWeekNumbers: props.showWeekNumbers,
                disabledDaysOfWeek: props.disabledDaysOfWeek,
                disabledDates: props.disabledDates,
                enabledDates: props.enabledDates,
                eventDates: props.eventDates,
                eventClass: props.eventClass,
                disableYear: props.disableYear,
                disableMonth: props.disableMonth,
                disableMinute: props.disableMinute,
                text: {
                    days: $gettext('S,M,T,W,T,F,S').split(','),
                    months: [
                        $gettext('January'),
                        $gettext('February'),
                        $gettext('March'),
                        $gettext('April'),
                        $gettext('May'),
                        $gettext('June'),
                        $gettext('July'),
                        $gettext('August'),
                        $gettext('September'),
                        $gettext('October'),
                        $gettext('November'),
                        $gettext('December')
                    ],
                    monthsShort: [
                        $gettext('Jan'),
                        $gettext('Feb'),
                        $gettext('Mar'),
                        $gettext('Apr'),
                        $gettext('May'),
                        $gettext('Jun'),
                        $gettext('Jul'),
                        $gettext('Aug'),
                        $gettext('Sep'),
                        $gettext('Oct'),
                        $gettext('Nov'),
                        $gettext('Dec')
                    ],
                    today: $gettext('Today'),
                    now: $gettext('Now'),
                    am: $gettext('AM'),
                    pm: $gettext('PM')
                },
                formatter: {
                    date: internalDate => {
                        const date = props.value
                        if (!internalDate) return ''
                        if (props.disableInputFormatting) return date

                        return props.inputFormatter(date)
                    }
                }
            }

            // if (props.defaultText === 'Date/Time') {
            //     placeholder.value = $gettext('Date/Time')
            // } else {
            //     placeholder.value = props.defaultText
            // }

            // $(refs.calendar).calendar(settings)
        }

        return { inputAttr, calendarAttr, onChange }
    }
}
</script>

<style lang="scss" scoped>
.pitcher-calendar {
    input:hover {
        cursor: pointer;
    }
}
</style>
