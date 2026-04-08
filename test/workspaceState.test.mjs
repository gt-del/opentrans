import test from 'node:test'
import assert from 'node:assert/strict'

import { clampPaneRatio, parseWorkspaceSession } from '../src/renderer/workspaceState.js'

test('clampPaneRatio limits values into allowed range', () => {
  assert.equal(clampPaneRatio(0.1), 0.3)
  assert.equal(clampPaneRatio(0.5), 0.5)
  assert.equal(clampPaneRatio(0.9), 0.7)
})

test('parseWorkspaceSession returns null for invalid payload', () => {
  assert.equal(parseWorkspaceSession(''), null)
  assert.equal(parseWorkspaceSession('{'), null)
  assert.equal(parseWorkspaceSession(JSON.stringify({ srcDir: '/tmp/a' })), null)
})

test('parseWorkspaceSession returns session for valid payload', () => {
  const raw = JSON.stringify({ srcDir: '/tmp/a', translatorDir: '/tmp/b' })
  assert.deepEqual(parseWorkspaceSession(raw), { srcDir: '/tmp/a', translatorDir: '/tmp/b' })
})
