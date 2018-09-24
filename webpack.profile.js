const nodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    target: 'node',
    entry: './benchmark.js',
    output: {
        filename: './profile.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },
            }
        ]
    },
    externals: [nodeExternals()],
    plugins: [],
    optimization: {
	minimize:false
    }
};
