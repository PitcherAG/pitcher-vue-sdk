<template>
    <div
        ref="progress"
        class="ui progress pitcher-progress"
        v-bind="progressBarAttr"
        :data-value="value"
        :data-total="total"
    >
        <div class="bar">
            <div v-if="showProgress" class="progress" :class="{ centered: progressCenter }" />
        </div>

        <div v-if="showLabel || hasLabelSlot" class="label mt-2">
            <!-- custom label slot -->
            <template v-if="hasLabelSlot">
                <slot name="label" :percent="percent" :value="value" :total="total" />
            </template>
            <!-- default label -->
            <template v-else>{{ percent }}% completed</template>
        </div>
    </div>
</template>
<script>
import { computed, reactive, toRefs, watch, onMounted } from '@vue/composition-api'
import { parsePxStyle, validateSize } from './mixins'

export default {
    props: {
        value: {
            type: [String, Number],
            required: true
        },
        total: {
            type: [String, Number],
            default: 100
        },
        showProgress: {
            type: Boolean,
            default: true
        },
        progressCenter: Boolean,
        showLabel: {
            type: Boolean,
            default: false
        },
        indicating: Boolean,
        autoSuccess: {
            type: Boolean,
            default: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        disabled: Boolean,
        animate: {
            type: Boolean,
            default: false
        },
        color: String,
        maxWidth: {
            type: [Number, String],
            default: '100%'
        },
        settings: {
            type: Object,
            default: () => {}
        },
        attached: {
            type: String,
            validator: val => {
                const valid = val === 'top' || val === 'bottom'
                if (!valid) {
                    console.error('[Vue warn]: Validation error in ProgressBar.vue!')
                    console.error('[Vue warn]: prop.attached is not valid!')
                    throw `Accepted values: top | bottom`
                }
                return valid
            }
        },
        size: {
            type: String,
            validator: val => validateSize(val, 'ProgressBar.vue')
        }
    },

    setup(props, { refs, slots, emit }) {
        // local state
        const state = reactive({
            hasLabelSlot: !!slots.label,
            percent: 0
        })

        const progressBarAttr = computed(() => ({
            class: {
                indicating: props.indicating,
                loading: props.loading,
                disabled: props.disabled,
                [props.attached]: !!props.attached,
                attached: !!props.attached,
                [props.state]: !!props.state,
                [props.color]: !!props.color,
                [props.size]: !!props.size
            },
            style: {
                maxWidth: parsePxStyle(props.maxWidth)
            }
        }))

        // execute command with jquery on fomantic
        function exec(comm, arg) {
            if (!arg) {
                return $(refs.progress).progress(comm)
            }
            return $(refs.progress).progress(comm, arg)
        }

        // set progress state
        function setProgressState(state, text, keep = false) {
            $(refs.progress).progress(`set ${state}`, text, keep)
        }

        // watch value & total
        watch([() => props.value, () => props.total], ([value, total]) => {
            // update values
            exec('set total', total)
            exec('set progress', value)
            // save percent on each update
            state.percent = exec('get percent')
        })

        onMounted(() => {
            // initialize progress bar
            $(refs.progress).progress({
                value: props.value,
                total: props.total,
                showActivity: props.animate,
                autoSuccess: props.autoSuccess,
                onChange: (percent, value, total) => emit('onChange', { percent, value, total }),
                onSuccess: total => emit('onSuccess', total),
                onActive: (value, total) => emit('onActive', { value, total }),
                onError: (value, total) => emit('onError', { value, total }),
                onWarning: (value, total) => emit('onWarning', { value, total }),
                ...props.settings
            })
            // save percent on init
            state.percent = exec('get percent')
        })

        return {
            ...toRefs(state),
            progressBarAttr,
            setProgressState,
            exec
        }
    }
}
</script>
<style lang="scss" scoped>
.ui.progress.pitcher-progress {
    &:first-child {
        margin-bottom: 0;
    }
}
</style>
