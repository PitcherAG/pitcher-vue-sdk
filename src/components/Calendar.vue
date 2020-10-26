<template>
    <div class="pitcher-calendar">
        <DatePicker v-bind="calendarAttr" @input="onChange">
            <div class="ui input left icon" v-bind="inputAttr">
                <i class="calendar icon" />
                <input type="text" :value="valueToShow" :placeholder="defaultText" @keydown.prevent />
            </div>
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
            required: true
        },
        minDate: [String, Date],
        maxDate: [String, Date],
        defaultText: {
            type: String,
            default: () => $gettext('Date/Time')
        },
        firstDayOfWeek: {
            type: Number,
            default: 2
        },
        disabledDates: Array,
        availableDates: Array,
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
        },
        color: {
            type: String,
            validator: value => {
                return [
                    'blue',
                    'gray',
                    'red',
                    'orange',
                    'yellow',
                    'green',
                    'teal',
                    'indigo',
                    'purple',
                    'pink'
                ].includes(value)
            }
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
            firstDayOfWeek: props.firstDayOfWeek,
            disabledDates: props.disabledDates ? props.disabledDates : undefined,
            availableDates: props.availableDates ? props.availableDates : undefined,
            popover: {
                visibility: 'focus',
                keepVisibleOnInput: true
            },
            color: props.color ? props.color : undefined,
            theme: {
                navPopoverContainer: {
                    light: 'vc-rounded text-style--dark vc-bg-white vc-shadow'
                }
            }
        }))

        const valueToShow = computed(() => {
            if (props.disableInputFormatting) {
                return props.value
            }
            return props.inputFormatter(props.value)
        })

        const onChange = date => {
            if (!date) return

            let result = date
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

            const regex = /\+\d{4}/g
            let date = dateString

            if (date.match(regex)) {
                date = date.replace(regex, '')
            }

            if (new Date(date).toString() !== 'Invalid Date') {
                return new Date(date)
            }

            console.error(`[ERROR]: Calendar value is not valid! value: ${dateString} type: ${typeof dateString}`)
        }

        return { valueToShow, inputAttr, calendarAttr, onChange }
    }
}
</script>

<style lang="scss" scoped>
.pitcher-calendar {
    input:hover {
        cursor: pointer;
    }

    ::v-deep {
        .vc-bg-blue-600 {
            background-color: #2185d0 !important;
        }
        .vc-text-blue-100 {
            color: #1a202c;

            &:hover {
                color: #fff;
            }
        }
    }
}
</style>
