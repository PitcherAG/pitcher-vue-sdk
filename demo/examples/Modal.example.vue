<template>
  <div>
    <h3>Modal</h3>
    <div class="ui divider" />
    <div class="ui button" @click="show = !show">Show modal</div>
    <Modal v-model="show" title="Register" titleIcon="user" approveText="Submit" denyText="Cancel" hideCloseIcon>
      <!-- <template #header>
                <i class="setting icon" />
                Settings
            </template> -->
      <form class="ui form">
        <div class="field">
          <label>First Name</label>
          <input type="text" name="first-name" placeholder="First Name" />
        </div>
        <div class="field">
          <label>Last Name</label>
          <input type="text" name="last-name" placeholder="Last Name" />
        </div>
        <div class="field">
          <div class="ui checkbox" @click="agreed = !agreed">
            <input type="checkbox" tabindex="0" class="hidden" :checked="agreed" />
            <label>I agree to the Terms and Conditions</label>
          </div>
        </div>
      </form>
      <!-- <template #actions>
                <button class="ui button primary">Submit</button>
            </template> -->
    </Modal>
    <br />
    <br />
  </div>
</template>

<script>
import Modal from '@/components/Modal'
import { reactive, toRefs } from '@vue/composition-api'

export default {
  name: 'ModalEx',
  components: {
    Modal,
  },
  props: {},
  setup() {
    const state = reactive({
      show: false,
      agreed: false,
    })

    return { ...toRefs(state) }
  },
}
</script>
