import { create } from 'zustand'
import {
  WORKSPACE_SESSION_KEY,
  PANE_RATIO_KEY,
  DEFAULT_PANE_RATIO,
  clampPaneRatio,
  parseWorkspaceSession
} from '../workspaceState'

const STORAGE_KEY   = 'opentrans_settings'
const PROFILES_KEY  = 'opentrans_profiles'
const THEME_KEY     = 'opentrans_theme'

function loadWorkspaceSession() {
  try {
    return parseWorkspaceSession(localStorage.getItem(WORKSPACE_SESSION_KEY))
  } catch {
    return null
  }
}

function saveWorkspaceSession(session) {
  if (!session?.srcDir || !session?.translatorDir) {
    localStorage.removeItem(WORKSPACE_SESSION_KEY)
    return
  }
  localStorage.setItem(WORKSPACE_SESSION_KEY, JSON.stringify(session))
}

function loadPaneRatio() {
  const raw = localStorage.getItem(PANE_RATIO_KEY)
  if (!raw) return DEFAULT_PANE_RATIO
  return clampPaneRatio(Number(raw))
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark'
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_KEY, theme)
}

const initialSession = loadWorkspaceSession()

const useStore = create((set, get) => ({
  srcDir: initialSession?.srcDir || null,
  translatorDir: initialSession?.translatorDir || null,
  fileTree: [],
  selectedFile: null,
  progressMap: {},
  errorMap: {},
  paneRatio: loadPaneRatio(),

  settings: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o-mini',
    concurrency: 3,
    chunkSize: 12000,
    outputMode: 'project',
    customOutputDir: '',
    ...loadSettings()
  },

  // 多配置档案
  profiles: loadProfiles(),

  settingsOpen: false,
  theme: loadTheme(),

  setSrcDir: (dir) => set((state) => {
    saveWorkspaceSession({ srcDir: dir, translatorDir: state.translatorDir })
    return { srcDir: dir }
  }),
  setTranslatorDir: (dir) => set((state) => {
    saveWorkspaceSession({ srcDir: state.srcDir, translatorDir: dir })
    return { translatorDir: dir }
  }),
  setFileTree: (tree) => set({ fileTree: tree }),
  setSelectedFile: (file) => set({ selectedFile: file }),
  clearWorkspace: () => set(() => {
    saveWorkspaceSession(null)
    return {
      srcDir: null,
      translatorDir: null,
      fileTree: [],
      selectedFile: null,
      progressMap: {},
      errorMap: {}
    }
  }),
  setPaneRatio: (ratio) => set(() => {
    const nextRatio = clampPaneRatio(ratio)
    localStorage.setItem(PANE_RATIO_KEY, String(nextRatio))
    return { paneRatio: nextRatio }
  }),

  updateProgress: (relPath, status, error = '') =>
    set((state) => ({
      progressMap: { ...state.progressMap, [relPath]: status },
      errorMap: {
        ...state.errorMap,
        ...(error ? { [relPath]: error } : status === 'translated' || status === 'translating' ? { [relPath]: '' } : {})
      },
      fileTree: updateTreeStatus(state.fileTree, relPath, status)
    })),

  setSettings: (settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    set({ settings })
  },

  // 保存当前配置为档案
  saveProfile: (name) => set((state) => {
    const profile = { name, ...state.settings }
    const existing = state.profiles.findIndex(p => p.name === name)
    const profiles = existing >= 0
      ? state.profiles.map((p, i) => i === existing ? profile : p)
      : [...state.profiles, profile]
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
    return { profiles }
  }),

  // 应用某个档案
  applyProfile: (name) => set((state) => {
    const profile = state.profiles.find(p => p.name === name)
    if (!profile) return {}
    const { name: _, ...settings } = profile
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    return { settings }
  }),

  // 删除档案
  deleteProfile: (name) => set((state) => {
    const profiles = state.profiles.filter(p => p.name !== name)
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
    return { profiles }
  }),

  openSettings:  () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    return { theme: next }
  }),
}))

function updateTreeStatus(tree, relPath, status) {
  return tree.map((node) => {
    if (node.type === 'file' && node.relPath === relPath) return { ...node, status }
    if (node.type === 'dir' && node.children) return { ...node, children: updateTreeStatus(node.children, relPath, status) }
    return node
  })
}

export default useStore
