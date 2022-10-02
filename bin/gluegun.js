#!/usr/bin/env node
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { run } from '../build/cli/cli.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// speed up `gluegun --version` et al
if (['v', 'version', '-v', '--v', '-version', '--version'].includes(process.argv[2])) {
  const fs = await import('fs')
  const contents = fs.readFileSync(__dirname + '/../package.json')
  const pkg = JSON.parse(contents)
  console.log(pkg.version)
  process.exit(0)
}

run(process.argv)
