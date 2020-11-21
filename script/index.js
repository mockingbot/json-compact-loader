import { resolve } from 'path'
import { execSync } from 'child_process'

import { initOutput, packOutput, clearOutput, verifyNoGitignore, verifyGitStatusClean, publishOutput } from '@dr-js/dev/module/output'
import { runMain, argvFlag } from '@dr-js/dev/module/main'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execShell = (command) => execSync(command, { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' })

const buildOutput = async ({ logger }) => {
  logger.padLog('build library')
  execShell('npm run build-library')
}

runMain(async (logger) => {
  await verifyNoGitignore({ path: fromRoot('source'), logger })
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return
  await buildOutput({ logger })
  const isTest = argvFlag('test', 'publish', 'publish-dev')
  isTest && logger.padLog('lint source')
  isTest && execShell('npm run lint')
  isTest && logger.padLog('test verify')
  isTest && execShell('npm run test-verify')
  await clearOutput({ fromOutput, logger })
  isTest && await verifyGitStatusClean({ fromRoot, logger })
  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
})
