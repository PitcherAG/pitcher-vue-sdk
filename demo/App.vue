<template>
  <div id="app" class="px-4 fill-height">
    <Demo />
  </div>
</template>

<script>
import Demo from './Demo'

export default {
  name: 'App',
  components: {
    Demo,
  },
}
</script>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  width: 100%;
  max-width: 100%;
}

body {
  background-color: rgb(249, 249, 250);
}
</style>
