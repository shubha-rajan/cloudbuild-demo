module.exports = {
    entry: './src/js/app.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.min.js'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },

                ]
            },
            {
                test: /\.ttf$/,
                use: 'url-loader'
            },
            {
                test: /\.(svg|gif|png|eot|woff|ttf)$/,
                use: 'url-loader'

            },
        ]
    }
}