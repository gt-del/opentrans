import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { normalizeBaseUrl, validateApiConfig } = require('../src/main/translationApi.cjs')

test('normalizeBaseUrl appends chat completions path for base root', () => {
  assert.equal(
    normalizeBaseUrl('https://api.openai.com/v1'),
    'https://api.openai.com/v1/chat/completions'
  )
})

test('normalizeBaseUrl accepts full chat completions endpoint', () => {
  assert.equal(
    normalizeBaseUrl('https://api.openai.com/v1/chat/completions'),
    'https://api.openai.com/v1/chat/completions'
  )
})

test('validateApiConfig rejects missing api key', () => {
  assert.throws(
    () => validateApiConfig({ baseUrl: 'https://api.openai.com/v1', apiKey: '' }),
    /未配置 API Key/
  )
})

test('validateApiConfig rejects missing base url', () => {
  assert.throws(
    () => validateApiConfig({ baseUrl: '', apiKey: 'sk-test' }),
    /未配置 API Base URL/
  )
})
