const path = require('path');

module.exports = {
    stories: ['../stories/**/*.stories.vue'],
    addons: ['@storybook/addon-actions', '@storybook/addon-links'],

    webpackFinal: async (config, { configType }) => {
        config.module.rules.push(
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
                include: path.resolve(__dirname, '../src/components')
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
                include: path.resolve(__dirname, '../stories')
            }
        );
        return config;
    }
}
