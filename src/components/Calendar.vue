<template>
  <div ref="calendar" class="ui calendar pitcher-calendar">
    <div class="ui input left icon right" v-bind="inputAttr">
      <i class="calendar icon" />
      <input ref="input" v-model="dateStr" type="text" :placeholder="placeholder" />
      <i v-if="clearable" class="close icon outline link" style="left: auto; right: 0px" @click="clear" />
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-unused-properties, vue/no-deprecated-props-default-this */
import { computed, onMounted, reactive, toRefs, watch } from '@vue/composition-api'
import { formatDate, formatTime } from '../i18n/date.js'
import { parsePxStyle, validateSize } from './mixins'

const parseDate = (dateString) => {
  if (!dateString) return undefined
  // eslint-disable-next-line valid-typeof
  if (dateString instanceof Date) {
    return dateString
  }

  const regex = /\+\d{4}/g
  let date = dateString

  if (date.match(regex)) {
    date = date.replace(regex, '')
  }

  return new Date(date)
}

export default {
  name: 'Calendar',
  props: {
    value: {
      type: [String, Date],
    },
    type: {
      default: 'datetime',
      validator: (value) => {
        return ['datetime', 'date', 'time', 'month', 'year'].indexOf(value) !== -1
      },
    },
    minDate: [String, Date],
    maxDate: [String, Date],
    startMode: {
      default: 'day',
      validator: (value) => {
        return ['year', 'month', 'day', 'hour', 'minute'].indexOf(value) !== -1
      },
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    defaultText: {
      type: String,
      default: 'Date/Time',
    },
    showAmPm: {
      type: Boolean,
      default: false,
    },
    showToday: {
      type: Boolean,
      default: true,
    },
    showWeekNumbers: {
      type: Boolean,
      default: false,
    },
    minTimeGap: {
      type: Number,
      default: 10,
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
      default: false,
    },
    valueFormatter: {
      type: Function,
      required: false,
      // must be function instead of array function to be able to reach component instance
      default(date) {
        if (!date) return ''

        // if date time
        if (this.type.includes('time')) {
          return date.toISOString()
        }

        // if date format
        const yyyy = date.getFullYear().toString()
        const mm = (date.getMonth() + 1).toString()
        const dd = date.getDate().toString()

        return `${yyyy}-${mm[1] ? mm : `0${mm[0]}`}-${dd[1] ? dd : `0${dd[0]}`}`
      },
    },
    disableInputFormatting: {
      type: Boolean,
      default: false,
    },
    setting: Object,
    action: {
      type: String,
      default: 'activate',
    },
    fluid: Boolean,
    disabled: Boolean,
    loading: {
      type: Boolean,
      default: false,
    },
    error: Boolean,
    minWidth: {
      type: [Number, String],
    },
    maxWidth: {
      type: [Number, String],
      default: '100%',
    },
    size: {
      type: String,
      validator: (val) => validateSize(val, 'Calendar.vue'),
    },
    monthFirst: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['input', 'onBeforeChange', 'onShow', 'onVisible', 'onHide', 'onHidden', 'onSelect'],

  setup(props, { emit, refs, root }) {
    const state = reactive({
      placeholder: computed(() => (props.defaultText === 'Date/Time' ? $gettext('Date/Time') : props.defaultText)),
      dateStr: '',
      timeStr: '',
      date: '',
    })

    const inputAttr = computed(() => ({
      class: {
        fluid: props.fluid,
        loading: props.loading,
        disabled: props.disabled || props.loading,
        error: props.error,
        [props.size]: !!props.size,
      },
      style: {
        minWidth: props.minWidth ? parsePxStyle(props.minWidth) : undefined,
        maxWidth: parsePxStyle(props.maxWidth),
      },
    }))

    const handleInputEmit = () => {
      // if formatting disabled, emit raw value
      if (props.disableValueFormatting) {
        emit('input', state.date)
      }

      // format
      emit('input', props.valueFormatter(state.date))
    }

    const initCalendar = () => {
      const settings = {
        type: props.type,
        startMode: props.startMode,
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
        touchReadonly: true,
        action: props.action,
        minTimeGap: props.minTimeGap,
        monthFirst: props.monthFirst,
        on: 'click',
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
            $gettext('December'),
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
            $gettext('Dec'),
          ],
          today: $gettext('Today'),
          now: $gettext('Now'),
          am: $gettext('AM'),
          pm: $gettext('PM'),
        },
        // Events
        onChange: (date, text) => {
          // Starting point of selection
          state.date = date
          state.dateStr = text

          if (!date) emit('input', '')
        },
        onBeforeChange: () => emit('onBeforeChange'),
        onShow: () => emit('onShow'),
        onVisible: () => emit('onVisible'),
        onHide: () => emit('onHide'),
        onHidden: () => emit('onHidden'),
        onSelect: (date, mode) => {
          state.date = date
          handleInputEmit()
          emit('onSelect', { date, mode })
        },
        // merge with settings
        ...props.setting,
      }

      // add formatter conditionally
      if (!props.disableInputFormatting) {
        settings.formatter = {
          date: (internalDate) => (internalDate ? formatDate(internalDate) : ''),
          time: (internalDate) => (internalDate ? formatTime(internalDate) : ''),
        }
      }

      $(refs.calendar).calendar(settings)
    }

    const refreshCalendar = () => {
      $(refs.calendar).calendar('destroy')
      initCalendar()

      setTimeout(() => {
        $(refs.calendar).calendar('set date', parseDate(props.value), true, false)
      })
    }

    const clear = (e) => {
      e.preventDefault()
      e.stopPropagation()
      emit('input', '')
    }

    onMounted(() => {
      root.$nextTick(() => {
        initCalendar()
      })
    })

    // watch input changes
    watch(
      () => state.dateStr,
      () => handleInputEmit()
    )

    // watch value changes to update input string
    watch(
      () => props.value,
      (newVal) => {
        root.$nextTick(() => {
          // To load properly on init
          // if currentDate is before minDAte set minDate to current date
          if (parseDate(newVal) < parseDate(props.minDate)) {
            // set min hours to midnight first
            const newMinDate = parseDate(newVal)

            newMinDate.setHours(0, 0, 0, 0)
            $(refs.calendar).calendar('set minDate', newMinDate)
          }

          // update input but do not re-format actual value
          $(refs.calendar).calendar('set date', parseDate(newVal), true, false)
        })
      },
      { immediate: true }
    )

    // watch min/max date
    watch(
      [() => props.minDate, () => props.maxDate],
      ([newMinDate, newMaxDate]) => {
        root.$nextTick(() => {
          $(refs.calendar).calendar('set minDate', parseDate(newMinDate))
          $(refs.calendar).calendar('set maxDate', parseDate(newMaxDate))
        })
      },
      { immediate: true }
    )

    const watchList = [
      () => props.type,
      () => props.clearable,
      () => props.startMode,
      () => props.showAmPm,
      () => props.showToday,
      () => props.showWeekNumbers,
      () => props.disabledDaysOfWeek,
      () => props.disabledDates,
      () => props.enabledDates,
      () => props.eventDates,
      () => props.eventClass,
      () => props.disableYear,
      () => props.disableMonth,
      () => props.disableMinute,
      () => props.action,
      () => props.setting,
      () => props.disableValueFormatting,
      () => props.valueFormatter,
      () => props.disableInputFormatting,
    ]

    // watch everything else
    watch(watchList, () => refreshCalendar())

    return { ...toRefs(state), inputAttr, initCalendar, clear }
  },
}
</script>

<style lang="scss" scoped>
.pitcher-calendar {
  input:hover {
    cursor: pointer;
  }

  // hide clear button on windows
  ::v-deep {
    input::-ms-clear {
      display: none !important;
    }
  }
}
</style>
