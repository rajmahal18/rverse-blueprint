import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-persistence-test-build')
const localTsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
const hasLocalTsc = existsSync(localTsc)
const compilerCommand = hasLocalTsc ? process.execPath : (process.platform === 'win32' ? 'tsc.cmd' : 'tsc')
const compilerPrefix = hasLocalTsc ? [localTsc] : []

rmSync(buildDir, { recursive: true, force: true })
execFileSync(compilerCommand, [
  ...compilerPrefix,
  'src/data/persistence.ts',
  '--target', 'ES2022',
  '--module', 'commonjs',
  '--moduleResolution', 'node',
  '--lib', 'ES2022,DOM,DOM.Iterable',
  '--skipLibCheck',
  '--strict',
  '--outDir', buildDir,
], { cwd: root, stdio: 'inherit', shell: !hasLocalTsc && process.platform === 'win32' })
writeFileSync(join(buildDir, 'package.json'), '{"type":"commonjs"}\n')

const require = createRequire(import.meta.url)
const { collectReferencedAssetIds, collectWorkspaceAssetIds, stripInlineImageData } = require(join(buildDir, 'persistence.js'))

let passed = 0
const check = (name, fn) => {
  fn()
  passed += 1
  console.log(`✓ ${name}`)
}

console.log('\nBlueprint persistence regression suite (introduced v0.20)\n')

check('asset references are collected across live references and checkpoints without duplicates', () => {
  const projects = [{
    references: [{ imageAssetId: 'asset-a' }, { imageAssetId: 'asset-b' }, {}],
    snapshots: [
      { references: [{ imageAssetId: 'asset-a' }, { imageAssetId: 'asset-c' }] },
      { references: [{ imageAssetId: 'asset-c' }] },
    ],
  }]
  assert.deepEqual(new Set(collectReferencedAssetIds(projects)), new Set(['asset-a', 'asset-b', 'asset-c']))
})

check('recovery workspace assets remain protected from orphan cleanup', () => {
  const current = {
    id: 'current', schemaVersion: 1, savedAt: '2026-09-03T00:00:00.000Z',
    data: { projects: [{ references: [{ imageAssetId: 'asset-current' }], snapshots: [] }] },
  }
  const recovery = {
    id: 'recovery', schemaVersion: 1, savedAt: '2026-09-02T00:00:00.000Z',
    data: { projects: [{ references: [{ imageAssetId: 'asset-recovery' }], snapshots: [{ references: [{ imageAssetId: 'asset-checkpoint' }] }] }] },
  }
  assert.deepEqual(
    new Set(collectWorkspaceAssetIds(current, recovery)),
    new Set(['asset-current', 'asset-recovery', 'asset-checkpoint']),
  )
})

check('inline image payloads are stripped from live references before IndexedDB workspace saves', () => {
  const original = [{
    id: 'project-1',
    references: [{ id: 'ref-1', imageAssetId: 'asset-a', imageData: 'data:image/jpeg;base64,abc' }],
    snapshots: [],
  }]
  const stripped = stripInlineImageData(original)
  assert.equal('imageData' in stripped[0].references[0], false)
  assert.equal(stripped[0].references[0].imageAssetId, 'asset-a')
  assert.equal(original[0].references[0].imageData, 'data:image/jpeg;base64,abc', 'helper must not mutate live React state')
})

check('inline image payloads are stripped from checkpoint references too', () => {
  const stripped = stripInlineImageData([{
    references: [],
    snapshots: [{ references: [{ imageAssetId: 'asset-z', imageData: 'data:image/jpeg;base64,xyz' }] }],
  }])
  assert.equal('imageData' in stripped[0].snapshots[0].references[0], false)
  assert.equal(stripped[0].snapshots[0].references[0].imageAssetId, 'asset-z')
})

check('projects with no image assets remain structurally intact', () => {
  const original = [{ id: 'p', name: 'Plain', references: [{ id: 'r', title: 'Link only' }], snapshots: [] }]
  assert.deepEqual(stripInlineImageData(original), original)
  assert.deepEqual(collectReferencedAssetIds(original), [])
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} persistence regression checks passed.\n`)
