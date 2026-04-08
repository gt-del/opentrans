import React, { useEffect, useRef, useState } from 'react'
import useStore from './stores/useStore'
import Toolbar from './components/Toolbar'
import FileTree from './components/FileTree'
import MarkdownPanel from './components/MarkdownPanel'
import EditorPanel from './components/EditorPanel'
import SettingsModal from './components/SettingsModal'
import { clampPaneRatio } from './workspaceState'

export default function App() {
  const { settingsOpen, srcDir, translatorDir, setFileTree, clearWorkspace, updateProgress, theme, paneRatio, setPaneRatio } = useStore()
  const cleanupRef = useRef(null)
  const markdownPanelRef = useRef(null)
  const editorPanelRef = useRef(null)
  const mainRef = useRef(null)
  const [isResizing, setIsResizing] = useState(false)

  // Apply saved theme on first render
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  useEffect(() => {
    if (window.electronAPI) {
      cleanupRef.current = window.electronAPI.onTranslationProgress((data) => {
        updateProgress(data.relPath, data.status, data.error || '')
      })
    }
    return () => { if (cleanupRef.current) cleanupRef.current() }
  }, [updateProgress])

  useEffect(() => {
    if (!srcDir || !translatorDir || !window.electronAPI) return

    let cancelled = false
    window.electronAPI.getFileTree(srcDir, translatorDir).then((result) => {
      if (cancelled) return
      if (result.success) {
        setFileTree(result.tree)
      } else {
        clearWorkspace()
      }
    }).catch(() => {
      if (!cancelled) clearWorkspace()
    })

    return () => { cancelled = true }
  }, [srcDir, translatorDir, setFileTree, clearWorkspace])

  function handleMarkdownScroll(ratio) {
    const el = editorPanelRef.current
    if (el && el._syncScroll) el._syncScroll(ratio)
  }
  function handleEditorScroll(ratio) {
    const el = markdownPanelRef.current
    if (el && el._syncScroll) el._syncScroll(ratio)
  }

  useEffect(() => {
    if (!isResizing) return

    function handlePointerMove(event) {
      const host = mainRef.current
      if (!host) return
      const rect = host.getBoundingClientRect()
      const fileTreeWidth = rect.width * 0.2
      const contentWidth = rect.width - fileTreeWidth
      const nextRatio = clampPaneRatio((event.clientX - rect.left - fileTreeWidth) / contentWidth)
      setPaneRatio(nextRatio)
    }

    function handlePointerUp() {
      setIsResizing(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isResizing, setPaneRatio])

  const markdownWidth = `${paneRatio * 80}%`
  const editorWidth = `${(1 - paneRatio) * 80}%`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <Toolbar />
      <main ref={mainRef} style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', cursor: isResizing ? 'col-resize' : 'default', userSelect: isResizing ? 'none' : 'auto' }}>
        {/* subtle center glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
          transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 0,
        }} />

        <aside style={{ width: '20%', minWidth: 200, background: 'var(--file-tree-bg)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 1, overflowY: 'auto' }}>
          <FileTree />
        </aside>

        <div style={{ width: markdownWidth, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
          <MarkdownPanel ref={markdownPanelRef} onScroll={handleMarkdownScroll} />
        </div>

        <div
          onPointerDown={() => setIsResizing(true)}
          style={{
            width: 8,
            cursor: 'col-resize',
            background: isResizing ? 'rgba(59,130,246,0.18)' : 'transparent',
            borderLeft: '1px solid var(--border)',
            borderRight: '1px solid var(--border)',
            zIndex: 2,
            flexShrink: 0
          }}
        />

        <div style={{ width: editorWidth, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
          <EditorPanel ref={editorPanelRef} onScroll={handleEditorScroll} />
        </div>
      </main>

      {settingsOpen && <SettingsModal />}
    </div>
  )
}
