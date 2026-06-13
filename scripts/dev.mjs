import { spawn } from 'child_process'
import { resolve } from 'path'

const root = process.cwd()

function run(name, cwd, command, args) {
  const child = spawn(command, args, {
    cwd: resolve(root, cwd),
    stdio: 'pipe',
    shell: true
  })

  const prefix = name === 'API' ? '\x1b[34m[API]\x1b[0m' : '\x1b[32m[UI]\x1b[0m'

  child.stdout.on('data', (data) => {
    process.stdout.write(`${prefix} ${data}`)
  })

  child.stderr.on('data', (data) => {
    process.stderr.write(`${prefix} ${data}`)
  })

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${prefix} exited with code ${code}`)
    }
  })

  return child
}

const api = run('API', 'backend', 'npm', ['run', 'dev'])
const ui = run('UI', 'frontend', 'npm', ['run', 'dev'])

function shutdown() {
  api.kill('SIGINT')
  ui.kill('SIGINT')
  setTimeout(() => {
    api.kill('SIGTERM')
    ui.kill('SIGTERM')
    setTimeout(() => process.exit(0), 500)
  }, 1000)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
