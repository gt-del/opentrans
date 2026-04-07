function normalizeBaseUrl(baseUrl) {
  const trimmed = typeof baseUrl === 'string' ? baseUrl.trim() : ''
  if (!trimmed) {
    throw new Error('未配置 API Base URL')
  }

  const normalized = trimmed.replace(/\/$/, '')
  if (normalized.endsWith('/chat/completions')) {
    return normalized
  }

  return `${normalized}/chat/completions`
}

function validateApiConfig(apiConfig = {}) {
  if (!apiConfig.apiKey || !String(apiConfig.apiKey).trim()) {
    throw new Error('未配置 API Key')
  }

  normalizeBaseUrl(apiConfig.baseUrl)
}

module.exports = {
  normalizeBaseUrl,
  validateApiConfig
}
