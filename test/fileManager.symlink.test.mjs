import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync, realpathSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { cloneProject, getFileTree } from '../src/main/fileManager.js'

async function withTempDir(run) {
  const root = mkdtempSync(join(tmpdir(), 'opentrans-test-'))
  try {
    return await run(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

function flattenFiles(nodes, result = []) {
  for (const node of nodes) {
    if (node.type === 'file') {
      result.push(node.relPath)
      continue
    }
    if (node.children) flattenFiles(node.children, result)
  }
  return result.sort()
}

test('cloneProject resolves a symlinked root repository and scans markdown files', async () => {
  await withTempDir(async (root) => {
    const realRepo = join(root, 'real-repo')
    const symlinkRepo = join(root, 'repo-link')

    mkdirSync(join(realRepo, 'docs'), { recursive: true })
    writeFileSync(join(realRepo, 'README.md'), '# hello\n')
    writeFileSync(join(realRepo, 'docs', 'guide.md'), '# guide\n')
    symlinkSync(realRepo, symlinkRepo, 'dir')

    const result = await cloneProject(symlinkRepo, { skipSpecialFiles: true })

    assert.equal(result.srcDir, realpathSync(realRepo))
    assert.equal(result.selectedDir, symlinkRepo)
    assert.equal(result.isSymlinkRoot, true)
    assert.equal(result.translatorDir, join(dirname(realpathSync(realRepo)), 'real-repo-translator'))
    assert.deepEqual(result.mdFiles.sort(), ['README.md', 'docs/guide.md'])

    const tree = getFileTree(result.srcDir, result.translatorDir)
    assert.deepEqual(flattenFiles(tree), ['README.md', 'docs/guide.md'])
  })
})

test('cloneProject includes markdown files inside symlinked directories and files', async () => {
  await withTempDir(async (root) => {
    const repo = join(root, 'repo')
    const externalDocs = join(root, 'external-docs')
    const externalFile = join(root, 'external.md')

    mkdirSync(join(repo, 'docs'), { recursive: true })
    mkdirSync(externalDocs, { recursive: true })
    writeFileSync(join(repo, 'docs', 'local.md'), '# local\n')
    writeFileSync(join(externalDocs, 'linked.md'), '# linked dir\n')
    writeFileSync(externalFile, '# linked file\n')
    symlinkSync(externalDocs, join(repo, 'linked-docs'), 'dir')
    symlinkSync(externalFile, join(repo, 'linked-file.md'), 'file')

    const result = await cloneProject(repo, { skipSpecialFiles: true })

    assert.deepEqual(
      result.mdFiles.sort(),
      ['docs/local.md', 'linked-docs/linked.md', 'linked-file.md']
    )

    const tree = getFileTree(result.srcDir, result.translatorDir)
    assert.deepEqual(
      flattenFiles(tree),
      ['docs/local.md', 'linked-docs/linked.md', 'linked-file.md']
    )
  })
})
