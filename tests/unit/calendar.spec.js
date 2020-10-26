import { mount, createLocalVue } from '@vue/test-utils'
import CompositionApi from '@vue/composition-api'
import Calendar from '@/components/Calendar'
import { TranslationPlugin } from '@/'

// workaround for matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
    }))
})

const localVue = createLocalVue()
localVue.use(CompositionApi)
localVue.use(TranslationPlugin)

const dateValue = '2002-01-15T12:00:00.000+0000'
const minDate = '2002-01-17T12:00:00.000+0000'

describe('Calendar.vue', () => {
    const wrapper = mount(Calendar, {
        localVue,
        propsData: {
            value: ''
        }
    })

    // Helper function
    async function updateValue(key, value) {
        wrapper.setProps({
            [key]: value
        })
        await wrapper.vm.$nextTick()
    }

    it('Calendar mounts properly', async () => {
        expect(wrapper.find('input').element.value).toBe(wrapper.vm.$props.value)
        expect(wrapper.find('input').element.placeholder).toBe(wrapper.vm.$props.defaultText)
    })

    it('Setting value externally & input formatting works', async () => {
        await updateValue('value', dateValue)

        expect(wrapper.vm.$props.value).toBe(dateValue)
        expect(wrapper.find('input').element.value).toBe(wrapper.vm.$props.inputFormatter(dateValue))
    })

    it('Setting minDate after the currentDate is not changing input value', async () => {
        await updateValue('minDate', minDate)

        expect(wrapper.vm.$props.value).toBe(dateValue)
        expect(wrapper.find('input').element.value).toBe(wrapper.vm.$props.inputFormatter(dateValue))

        // revert mindate
        await updateValue('minDate', undefined)
    })
})
