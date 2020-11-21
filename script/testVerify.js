import { resolve } from 'path'
import { strictEqual } from 'assert'
import { execSync } from 'child_process'

import { run, describeRunOutcome } from '@dr-js/core/module/node/system/Run'
import { runMain, argvFlag } from '@dr-js/dev/module/main'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const execShell = (command) => execSync(command, { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' })

runMain(async (logger) => {
  const runNodeForStdout = async (...argList) => {
    const { promise, stdoutPromise } = run({ quiet: true, command: process.execPath, argList, option: { cwd: fromRoot() } })
    await promise.catch(async (error) => {
      console.error('[runNodeForStdout] failed')
      console.error(await describeRunOutcome(error))
      throw error
    })
    const stdoutString = String(await stdoutPromise)
    logger.log(stdoutString)
    return stdoutString
  }

  logger.padLog('run test')
  execShell('npm run test-webpack')

  logger.padLog('run test output')
  const testOutputString = await runNodeForStdout('-p', 'JSON.stringify(require("./test-output-gitignore/index.js"))')

  logger.padLog('run test source')
  const testSourceString = await runNodeForStdout('-r', '@babel/register', '-p', 'JSON.stringify(require("./test/source/index.js"))')

  strictEqual(testOutputString, testSourceString, 'the data should be the same through webpack')
}, 'test-verify')
