const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/app.ts',
    target: 'node', 
    externals: [
        {bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate"},
        // dbus-next only uses usocket (a native addon) to pass file descriptors, and x11 to find a session bus.
        // Bluetooth needs neither, the system bus is reached through a plain socket.
        {usocket: "usocket", x11: "x11"},
        // Exclude Bun-specific modules (we're targeting Node.js, not Bun)
        function({ request }, callback) {
            if (request && (request.startsWith('bun:') || request === 'bun')) {
                return callback(null, 'commonjs ' + request);
            }
            callback();
        }
    ],
    plugins: [
        // Ignore Bun-specific platform files since we're targeting Node.js
        new webpack.IgnorePlugin({
            resourceRegExp: /BunSqlite\.js$/,
            contextRegExp: /@matter\/nodejs\/dist\/cjs\/storage\/sqlite\/platform/
        }),
        // noble's raw HCI, macOS and Windows bindings are native addons that cannot be bundled. Bluetooth runs over
        // BlueZ's D-Bus API instead (see ControllerNode.ts)
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/(hci-socket|mac|win)\/bindings$/,
            contextRegExp: /@stoprocent[\\/]noble[\\/]lib$/
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            }
        ]
    },
    resolve: {
        // noble loads a JSON file without its extension
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
            // matter.js loads its Bluetooth libraries through a require() that is only resolved at runtime, which
            // webpack cannot follow
            '@matter/nodejs-ble/require': path.resolve(__dirname, 'ble-require.js')
        }
    },
    output: {
        filename: 'matter.js', // single output JS file
        path: path.resolve(__dirname, 'dist')
    }
};
