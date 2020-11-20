# json-compact-loader

[![i:npm]][l:npm]
[![i:ci]][l:ci]
[![i:size]][l:size]
[![i:npm-dev]][l:npm]

Replace big named export value to 'JSON.parse(...)'

[i:npm]: https://img.shields.io/npm/v/json-compact-loader?colorB=blue
[i:npm-dev]: https://img.shields.io/npm/v/json-compact-loader/dev
[l:npm]: https://npm.im/json-compact-loader
[i:ci]: https://img.shields.io/github/workflow/status/mockingbot/json-compact-loader/ci-test
[l:ci]: https://github.com/mockingbot/json-compact-loader/actions?query=workflow:ci-test
[i:size]: https://packagephobia.now.sh/badge?p=json-compact-loader
[l:size]: https://packagephobia.now.sh/result?p=json-compact-loader

[//]: # (NON_PACKAGE_CONTENT)

- 📁 [source/](source/)
  - main source code, in output package will be: `json-compact-loader/library`


## Why a special JSON loader

Using [JSON](https://wikipedia.org/wiki/JSON) as data source in JS is quite common,
  but the JSON format is not flexible enough for development.
So often we unpack the JSON String to plain JS Objects,
  now we got comments, data-generate-functions, and best of all: 2 more quote to choose!

But there's a catch, a few actually:
- It's JS, so it's heavier to parse in code, check: https://www.youtube.com/watch?v=ff4fgQxPaO0
    and https://github.com/webpack/webpack/pull/9349
- When the package is prepared for bigger project, the "huge" JSON String actually cost far less performance problems,
    since the [AST](https://wikipedia.org/wiki/Abstract_syntax_tree)
    for a String is far simpler than a deep-nested Object.
  Common build tools like `babel`, `webpack/rollup`, `terser/uglifyjs`
    should also parse and repack your code faster.

This loader allows the JSON data in output as `JSON.parse(...)`,
  while keeping the source code easy to edit as JS.

This loader should support webpack v5 and v4 with nodejs 12+.

## The limitation

Sad, but there's some limit to what the code can do:
- the file naming should be `NAME_OF_JSON.@json.js`,
  and the `NAME_OF_JSON` should be basic `/[\w-]+/`,
  to also usable as variable name
- the file can only have single named export, should be `NAME_OF_JSON`,
  or the file should end with `export { NAME_OF_JSON }`
- data generation with code is supported,
  but only further `import` of `.js/json` is allowed, no `require` for now,
  this is because webpack need to know the related file,
  but `require` is hard to parse correctly

That's it, note the `.@json.js` is recommended, but not required,
  change it to something else if really needed.


## How to use

With source like:
```js
// file: `SAMPLE_JSON.@json.js`
import { a } from './a.js'
const SAMPLE_JSON = {
a,
b: 2, // with some more comment
c: 'a'.repeat(20) // allow simple compute
}
export { SAMPLE_JSON }

// file: `a.js`
const a = 1
export { a }
```

After the loader, output should be like:
```js
var SAMPLE_JSON = JSON.parse('{"a":1,"b":2,"c":"aaaaaaaaaaaaaaaaaaaa"}')
export { SAMPLE_JSON }
```

The webpack config:
```js
{
  test: /\.@json\.js$/, // also remember to add exclude from normal js loader
  use: { loader: 'json-compact-loader') }
}
```

The configurable option:
```js
{
  babelConfig: null, // default to only '@babel/plugin-transform-modules-commonjs'
  useConst: false // default to output ES5 code with import/export
}
```

There's a test setup can be used as example: [./test/](./test/)
