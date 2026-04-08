export const WORKSPACE_SESSION_KEY = 'opentrans_workspace_session'
export const PANE_RATIO_KEY = 'opentrans_pane_ratio'
export const MIN_PANE_RATIO = 0.3
export const MAX_PANE_RATIO = 0.7
export const DEFAULT_PANE_RATIO = 0.5

export function clampPaneRatio(value) {
  if (!Number.isFinite(value)) return DEFAULT_PANE_RATIO
  return Math.min(MAX_PANE_RATIO, Math.max(MIN_PANE_RATIO, value))
}

export function parseWorkspaceSession(raw) {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed?.srcDir || !parsed?.translatorDir) return null
    return {
      srcDir: parsed.srcDir,
      translatorDir: parsed.translatorDir
    }
  } catch {
    return null
  }
}
