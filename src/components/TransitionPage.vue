<template>
  <Transition :name="transitionName" :mode="transitionMode" :enterActiveClass="transitionEnterActiveClass">
    <slot />
  </Transition>
</template>

<script>
const DEFAULT_TRANSITION = 'fade'
const DEFAULT_TRANSITION_MODE = 'out-in'

export default {
  name: 'TransitionPage',
  data() {
    return {
      prevHeight: 0,
      transitionName: DEFAULT_TRANSITION,
      transitionMode: DEFAULT_TRANSITION_MODE,
      transitionEnterActiveClass: '',
    }
  },
  created() {
    this.$router.beforeEach((to, from, next) => {
      let transitionName = to.meta.transitionName || from.meta.transitionName || DEFAULT_TRANSITION

      if (transitionName === 'slide') {
        const toDepth = to.path.split('/').length
        const fromDepth = from.path.split('/').length

        transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
      }

      this.transitionMode = DEFAULT_TRANSITION_MODE
      this.transitionEnterActiveClass = `${transitionName}-enter-active`

      if (to.meta.transitionName === 'zoom') {
        this.transitionMode = 'in-out'
        this.transitionEnterActiveClass = 'zoom-enter-active'
        document.body.style.overflow = 'hidden'
      }

      if (from.meta.transitionName === 'zoom') {
        this.transitionMode = null
        this.transitionEnterActiveClass = null
        document.body.style.overflow = null
      }

      this.transitionName = transitionName

      next()
    })
  },
  /*methods: {
            beforeLeave(element) {
                this.prevHeight = getComputedStyle(element).height
            },
            enter(element) {
                const { height } = getComputedStyle(element)

                element.style.height = this.prevHeight

                setTimeout(() => {
                    element.style.height = height
                })
            },
            afterEnter(element) {
                element.style.height = 'auto'
            },
        },*/
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.4s;
  transition-property: height, opacity;
  transition-timing-function: ease;
  /*  overflow: hidden;*/
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.4s;
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.15, 0.03, 0.64, 0.99);
  overflow: hidden;
}

.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(4rem);
}

.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-4rem);
}

.zoom-enter-active,
.zoom-leave-active {
  animation-duration: 0.8s;
  animation-fill-mode: both;
  animation-name: zoom;
}

.zoom-leave-active {
  animation-direction: reverse;
}

@keyframes zoom {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }

  100% {
    opacity: 1;
  }
}
</style>
