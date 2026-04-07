import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, lstatSync, readlinkSync, realpathSync, unlinkSync } from 'fs'
import { join, relative, dirname, basename } from 'path'
import { createHash } from 'crypto'

const STATE_FILE = '.trans-state.json'

export function computeHash(filePath) {
  const content = readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

export function loadState(translatorDir) {
  const statePath = join(translatorDir, STATE_FILE)
  if (!existsSync(statePath)) return {}
  try {
    return JSON.parse(readFileSync(statePath, 'utf8'))
  } catch {
    return {}
  }
}

export function saveState(translatorDir, state) {
  const statePath = join(translatorDir, STATE_FILE)
  writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8')
}

function resolveProjectDir(inputDir) {
  let resolvedSrcDir
  let isSymlinkRoot = false

  try {
    const stats = lstatSync(inputDir)
    isSymlinkRoot = stats.isSymbolicLink()
    resolvedSrcDir = realpathSync(inputDir)
    if (!lstatSync(resolvedSrcDir).isDirectory()) {
      throw new Error('not-directory')
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`项目路径不存在或软链接已失效：${inputDir}`)
    }
    if (error.message === 'not-directory' || error.code === 'ENOTDIR') {
      throw new Error(`所选路径不是目录：${inputDir}`)
    }
    throw new Error(`无法访问项目目录：${inputDir}\n${error.message}`)
  }

  return {
    selectedDir: inputDir,
    srcDir: resolvedSrcDir,
    isSymlinkRoot
  }
}

function copyDirSync(src, dest, options = {}) {
  const { skipSpecialFiles = false, followSymlinks = false } = options

  try {
    mkdirSync(dest, { recursive: true })
  } catch (error) {
    throw new Error(`无法创建目录 ${dest}: ${error.message}\n提示：请检查目录权限`)
  }

  // 跳过这些目录：对翻译文档来说不需要
  const SKIP_DIRS = [
    '.git',           // Git 仓库
    'node_modules',   // Node.js 依赖
    '.vscode',        // VS Code 配置
    '.idea',          // JetBrains IDE
    'dist',           // 构建输出
    'build',          // 构建输出
    '.next',          // Next.js
    '.nuxt',          // Nuxt.js
    'coverage',       // 测试覆盖率
    '.cache',         // 缓存
    'tmp',            // 临时文件
    'temp'            // 临时文件
  ]

  // 跳过这些文件
  const SKIP_FILES = [
    '.DS_Store',      // macOS
    'Thumbs.db',      // Windows
    '.gitkeep',
    '.gitignore',
    '.npmrc',
    '.yarnrc'
  ]

  const entries = readdirSync(src, { withFileTypes: true })
  const skippedFiles = []

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    // 跳过不需要的目录和文件
    if (SKIP_DIRS.includes(entry.name) || SKIP_FILES.includes(entry.name)) {
      continue
    }

    try {
      // 检查是否是特殊文件（符号链接、socket、FIFO等）
      const stats = lstatSync(srcPath)

      if (stats.isSymbolicLink()) {
        if (skipSpecialFiles) {
          skippedFiles.push({ path: srcPath, type: 'symlink', target: readlinkSync(srcPath) })
          continue
        } else if (followSymlinks) {
          // 深度复制：复制符号链接指向的实际内容
          try {
            const realPath = realpathSync(srcPath)
            const realStats = lstatSync(realPath)
            if (realStats.isDirectory()) {
              copyDirSync(realPath, destPath, options)
            } else if (!entry.name.endsWith('.md')) {
              copyFileSync(realPath, destPath)
            }
          } catch (err) {
            // 符号链接失效或无法访问，跳过
            skippedFiles.push({ path: srcPath, type: 'symlink-broken' })
          }
          continue
        } else {
          // 默认跳过符号链接
          skippedFiles.push({ path: srcPath, type: 'symlink' })
          continue
        }
      }

      if (stats.isSocket() || stats.isFIFO()) {
        // Socket 和 FIFO 文件总是跳过
        skippedFiles.push({ path: srcPath, type: stats.isSocket() ? 'socket' : 'fifo' })
        continue
      }

      if (entry.isDirectory()) {
        const result = copyDirSync(srcPath, destPath, options)
        skippedFiles.push(...result.skippedFiles)
      } else if (!entry.name.endsWith('.md')) {
        copyFileSync(srcPath, destPath)
      }
    } catch (error) {
      // 任何无法复制的文件都跳过，不中断整个流程
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        skippedFiles.push({ path: srcPath, type: 'permission-denied' })
        continue
      } else if (error.code === 'ENOENT') {
        skippedFiles.push({ path: srcPath, type: 'not-found' })
        continue
      } else if (error.code === 'ENOTSUP') {
        skippedFiles.push({ path: srcPath, type: 'unsupported' })
        continue
      } else {
        // 其他未知错误也跳过
        skippedFiles.push({ path: srcPath, type: 'error', error: error.message })
        continue
      }
    }
  }

  return { skippedFiles }
}

function walkMarkdownEntries(dir, relBase = '', result = [], ancestors = new Set()) {
  const realDir = realpathSync(dir)
  if (ancestors.has(realDir)) return result

  const nextAncestors = new Set(ancestors)
  nextAncestors.add(realDir)
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const displayRelPath = relBase ? `${relBase}/${entry.name}` : entry.name
    const fullPath = join(dir, entry.name)

    try {
      const stats = lstatSync(fullPath)
      if (stats.isSymbolicLink()) {
        let realPath
        try {
          realPath = realpathSync(fullPath)
        } catch {
          continue
        }

        const realStats = lstatSync(realPath)
        if (realStats.isDirectory()) {
          walkMarkdownEntries(realPath, displayRelPath, result, nextAncestors)
        } else if (entry.name.endsWith('.md') || basename(realPath).endsWith('.md')) {
          result.push(displayRelPath)
        }
      } else if (stats.isDirectory()) {
        walkMarkdownEntries(fullPath, displayRelPath, result, nextAncestors)
      } else if (entry.name.endsWith('.md')) {
        result.push(displayRelPath)
      }
    } catch {
      continue
    }
  }

  return result
}

function buildTreeFromMdFiles(mdFiles, state) {
  const root = []

  function ensureDir(children, name, relPath) {
    let dirNode = children.find(node => node.type === 'dir' && node.relPath === relPath)
    if (!dirNode) {
      dirNode = { name, type: 'dir', relPath, children: [] }
      children.push(dirNode)
    }
    return dirNode
  }

  for (const relPath of [...mdFiles].sort()) {
    const parts = relPath.split('/')
    let children = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const currentRelPath = parts.slice(0, i + 1).join('/')
      const isFile = i === parts.length - 1

      if (isFile) {
        const fileState = state[relPath] || { status: 'pending' }
        children.push({ name: part, type: 'file', relPath, status: fileState.status })
      } else {
        const dirNode = ensureDir(children, part, currentRelPath)
        children = dirNode.children
      }
    }
  }

  return root
}

export async function cloneProject(srcDir, copyOptions) {
  const project = resolveProjectDir(srcDir)
  const parentDir = dirname(project.srcDir)
  const baseName = basename(project.srcDir)
  const translatorDir = join(parentDir, `${baseName}-translator`)

  // Check write permission for parent directory
  try {
    const testFile = join(parentDir, '.opentrans-permission-test')
    writeFileSync(testFile, 'test')
    unlinkSync(testFile)
  } catch (error) {
    throw new Error(`目标目录没有写入权限：${parentDir}\n提示：请选择一个有写入权限的目录，或修改当前目录的权限`)
  }

  const alreadyExists = existsSync(join(translatorDir, '.trans-state.json'))

  if (alreadyExists) {
    // Project was previously cloned — skip copying, just sync new/changed md files
    const mdFiles = walkMarkdownEntries(project.srcDir)
    const state = loadState(translatorDir)
    let changed = false
    for (const relPath of mdFiles) {
      const srcFilePath = join(project.srcDir, relPath)
      const hash = computeHash(srcFilePath)
      if (!state[relPath]) {
        state[relPath] = { status: 'pending', srcHash: hash }
        changed = true
      }
    }
    if (changed) saveState(translatorDir, state)
    return { ...project, translatorDir, mdFiles, resumed: true, skippedFiles: [] }
  }

  // First time: copy all non-md files and initialize state
  const { skippedFiles } = copyDirSync(project.srcDir, translatorDir, copyOptions || {})

  const mdFiles = walkMarkdownEntries(project.srcDir)
  const state = {}
  for (const relPath of mdFiles) {
    const srcFilePath = join(project.srcDir, relPath)
    const hash = computeHash(srcFilePath)
    state[relPath] = { status: 'pending', srcHash: hash }
  }

  saveState(translatorDir, state)
  return { ...project, translatorDir, mdFiles, resumed: false, skippedFiles }
}

export function diffScan(srcDir, translatorDir) {
  const state = loadState(translatorDir)
  const mdFiles = walkMarkdownEntries(srcDir)
  let changed = false

  for (const relPath of mdFiles) {
    const srcFilePath = join(srcDir, relPath)
    const currentHash = computeHash(srcFilePath)
    const entry = state[relPath]

    if (!entry) {
      state[relPath] = { status: 'pending', srcHash: currentHash }
      changed = true
    } else if (entry.srcHash !== currentHash) {
      state[relPath] = { ...entry, status: 'updated', srcHash: currentHash }
      changed = true
    }
  }

  if (changed) saveState(translatorDir, state)
  return state
}

export function getFileTree(srcDir, translatorDir) {
  const state = loadState(translatorDir)
  const mdFiles = walkMarkdownEntries(srcDir)
  return buildTreeFromMdFiles(mdFiles, state)
}

export function updateFileStatus(translatorDir, relPath, status, srcHash) {
  const state = loadState(translatorDir)
  state[relPath] = { ...state[relPath], status, ...(srcHash ? { srcHash } : {}) }
  saveState(translatorDir, state)
}
