import { shallowMount, createLocalVue } from '@vue/test-utils'
import CompositionApi from '@vue/composition-api'
import Calendar from '@/components/Calendar'
import { TranslationPlugin, formatDate } from '@/'

const localVue = createLocalVue()
localVue.use(CompositionApi)
localVue.use(TranslationPlugin)

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const dateValue = '2002-01-15T12:00:00.000+0000'
const minDate = '2002-01-17T12:00:00.000+0000'

describe('Calendar.vue', () => {
    const wrapper = shallowMount(Calendar, {
        localVue,
        propsData: {
            value: '',
            type: 'date'
        }
    })

    // Helper function
    async function updateValue(key, value) {
        wrapper.setProps({
            [key]: value
        })
        await wrapper.vm.$nextTick()
    }

    it('DataTable mounts properly', async () => {
        expect(wrapper.find('input').element.value).toBe(wrapper.vm.$props.value)
        expect(wrapper.find('input').element.placeholder).toBe(wrapper.vm.$props.defaultText)
        expect(wrapper.find('td.today').exists()).toBe(true)
    })

    it('Setting value externally & input formatting works', async () => {
        await updateValue('value', dateValue)

        expect(wrapper.vm.$props.value).toBe(dateValue)
        expect(wrapper.find('input').element.value).toBe(wrapper.vm.$props.inputFormatter(dateValue))
        expect(wrapper.find('td.active').text()).toBe('15')
    })

    it('Setting minDate after the currentDate is not changing input value', async () => {
        await updateValue('minDate', minDate)

        expect(wrapper.vm.$props.value).toBe(dateValue)
        expect(wrapper.find('input').element.value).toBe(wrapper.vm.$props.inputFormatter(dateValue))

        // revert mindate
        await updateValue('minDate', undefined)
    })

    it('Calendar menu is showing & emitting', async () => {
        wrapper.find('input').trigger('click')
        expect(wrapper.emitted().onShow).toBeTruthy()
    })

    // Fomantic Calendar does not work when simulating click
    // When simulating a calendar date click, it does not fire the click event
})
