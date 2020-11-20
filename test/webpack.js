import { resolve } from 'path'

import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack'
import { getWebpackBabelConfig } from '@dr-js/dev/module/babel'
import { runMain } from '@dr-js/dev/module/main'

const PATH_ROOT = resolve(__dirname, './source')
const PATH_OUTPUT = resolve(__dirname, '../test-output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

runMain(async (logger) => {
  const { mode, isWatch, isProduction, profileOutput, getCommonWebpackConfig } = await commonFlag({ fromRoot, logger })

  const babelOption = getWebpackBabelConfig({ isProduction })

  const config = getCommonWebpackConfig({
    babelOption: null, // do not use default
    output: { path: fromOutput(), filename: '[name].js' },
    entry: { 'entry': fromRoot('entry') },
    extraModuleRuleList: [
      { test: /\.js$/, exclude: /\.@json\.js$/, use: { loader: 'babel-loader', options: babelOption } },
      { test: /\.@json\.js$/, use: { loader: resolve(__dirname, '../output-gitignore/library/index.js'), options: { useConst: true } } }
    ]
  })

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, logger })
}, 'webpack')
