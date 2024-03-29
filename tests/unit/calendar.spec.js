import Calendar from '@/components/Calendar'
import CompositionApi from '@vue/composition-api'
import { TranslationPlugin } from '@/'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { useParamsStore } from '@/params'

const localVue = createLocalVue()

localVue.use(CompositionApi)
localVue.use(TranslationPlugin)

const dateValue = '2020-06-12T14:20:00.000+0000'
const minDate = '2020-08-02T00:00:00.000'

const params = useParamsStore()

params.state.user = { LocaleSidKey: 'en-US' }

describe('Calendar.vue', () => {
  const wrapper = shallowMount(Calendar, {
    localVue,
    propsData: {
      value: '',
      type: 'date',
    },
  })

  // Helper function
  async function updateValue(key, value) {
    wrapper.setProps({
      [key]: value,
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
    expect(wrapper.find('td.active').text()).toBe('12')
  })

  it('Setting minDate after the currentDate is not changing input value', async () => {
    await updateValue('minDate', minDate)

    expect(wrapper.vm.$props.value).toBe(dateValue)
    expect(wrapper.find('input').element.value).toBe('')

    // revert mindate
    await updateValue('minDate', undefined)
  })

  it('Calendar menu is showing & emitting', async () => {
    wrapper.find('input').trigger('click')
    expect(wrapper.emitted().onShow).toBeTruthy()
    expect(wrapper.find('.today').exists()).toBe(true)
  })

  // Fomantic Calendar does not work when simulating click
  // When simulating a calendar date click, it does not fire the click event
})
