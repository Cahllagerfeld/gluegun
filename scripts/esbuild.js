import esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import glob from 'tiny-glob'

/**
 * @type {Object.<string, esbuild.BuildOptions>}
 */

const config = {
  shared: {
    format: 'esm',
    target: 'esnext',
    plugins: [nodeExternalsPlugin()],
    entryPoints: await glob('src/**/*.ts'),
    logLevel: 'info',
    bundle: true,
    minify: true,
    outdir: 'build',
    platform: 'node',
  },
  build: {},
  dev: {
    watch: true,
  },
}

const mode = process.argv[2]
if (!mode) {
  console.error('Usage: node ./scripts/esbuild.js build|dev')
  process.exit(1)
}

esbuild
  .build({
    ...config.shared,
    ...(config[mode] || {}),
  })
  .catch(() => process.exit(1))
