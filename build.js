// build.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: false,
  outdir: 'dist',
  platform: 'node',
  format: 'esm',
  sourcemap: true
}).catch(() => process.exit(1));
