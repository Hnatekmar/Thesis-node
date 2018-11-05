const nodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    target: 'node',
    entry: './client.js',
    output: {
        library: 'simulation',
        libraryTarget: 'umd',
        filename: 'client.js'
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
        minimizer: [
            new UglifyJsPlugin({ /* your config */ })
        ],
        mangleWasmImports: true
    }
};
