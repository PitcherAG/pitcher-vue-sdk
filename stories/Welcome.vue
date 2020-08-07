<template>
    <div class="main">
        <h1>Welcome to Pitcher UI Components StoryBook</h1>
        <p>
            This is a UI component development environment for your app.
        </p>
        <p>
            We've added some basic stories inside the
            <code class="code">src/stories</code>
            directory.
            <br />
            A story is a single state of one or more UI components. You can have as many stories as you want.
            <br />
            (Basically a story is like a visual test case.)
        </p>
    </div>
</template>
<script>
const log = () => console.log('Welcome to storybook!')

import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    name: 'Welcome',
    props: {
        showApp: {
            type: Function,
            default: log
        }
    }
})
</script>

<style lang="scss">
.main {
    padding: 15px;
    line-height: 1.4;
    background-color: '#ffffff';
}

.logo {
    width: 200;
}

.link {
    color: '#1474f3';
    text-decoration: 'none';
    border-bottom: '1px solid #1474f3';
    padding-bottom: 2;
}

.code {
    font-size: 15;
    font-weight: 600;
    padding: '2px 5px';
    border: '1px solid #eae9e9';
    border-radius: 4;
    background-color: '#f3f2f2';
    color: '#3a3a3a';
}

.note {
    opacity: 0.5;
}
</style>
