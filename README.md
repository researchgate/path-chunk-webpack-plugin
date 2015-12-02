# PathChunkPlugin for Webpack

This plugin will extract all modules that match into a new named chunk. This plugin can also be used multiple times to
create multiple chunks. It is based on the CommonsChunkPlugin from Webpack.

The main use case it is used in our company is splitting less frequent changed code into separate chunks. With this plugin we
are able to split our codebase into `vendor`(node_modules), `core-libraries`, `react-base-components` and more.

This plugin works by matching the supplied value against the full path of all modules. We also check all bundles and not only entry bundles as entry bundles in our configuration do not contain modules.

## Performance

One of our main concerns about Webpack plugins is performance. That's why we choose to have two operating modes in this plugin.
The mode is chosen based on what type of `value` is supplied as option. If a regex is supplied as `value` we obviously run a match
against the path. If on the other hand you supply a string `value` then we simply do an `indexOf` check.

## Example

```js
var PathChunkPlugin = require('path-chunk-webpack-plugin');
module.exports = {
  entry: {
    app: 'app.js'
  },
  output: {
    path: __dirname + '/public',
    filename: "[name]-[chunkhash].js",
    chunkFilename: "[name]-[chunkhash].js"
  },
  plugins: [
    new PathChunkPlugin({
      name: 'vendor',
      value: 'node_modules/'
    })
  ]
};
```

An an example structure of modules:

```
/lib
    /url.js
/node_modules
    jquery/jquery.js
    backbone/index.js
/app.js
```

The output would be three files:

- `app-[hash].js`, containing:
    - `app.js`
    - `lib/url.js`
- `vendor-[hash].js`, containing:
    - `node_modules/jquery/jquery.js`
    - `node_modules/backbone/index.js`
