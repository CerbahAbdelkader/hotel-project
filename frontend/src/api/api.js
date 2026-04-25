const DEPLOYED_API_URL = 'https://pfe-hnfl.onrender.com'

// Resolve local backend port from .env (REACT_APP_LOCAL_PORT), with Vite compatibility and 3000 fallback.
const localPort =
	import.meta.env.REACT_APP_LOCAL_PORT ||
	import.meta.env.VITE_LOCAL_PORT ||
	'3000'

const isDevelopment = import.meta.env.DEV

const API_TIMEOUT_MS = 1500

let resolvedDevApiUrl = null
let resolvingDevApiUrlPromise = null

// Centralized API base URL: deployed backend in production, local backend in development.
export const API_URL = isDevelopment
	? `http://localhost:${localPort}`
	: DEPLOYED_API_URL

// Build absolute API endpoints from one source of truth so fetch/axios calls stay consistent.
export const apiEndpoint = (path) => `${API_URL}${path}`

const withTimeout = async (url, options = {}, timeoutMs = API_TIMEOUT_MS) => {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

	try {
		return await fetch(url, {
			...options,
			signal: controller.signal,
		})
	} finally {
		clearTimeout(timeoutId)
	}
}

const resolveDevApiUrl = async () => {
	if (!isDevelopment) return DEPLOYED_API_URL
	if (resolvedDevApiUrl) return resolvedDevApiUrl
	if (resolvingDevApiUrlPromise) return resolvingDevApiUrlPromise

	const explicitUrl =
		import.meta.env.VITE_API_URL ||
		import.meta.env.REACT_APP_API_URL

	const baseCandidates = [
		explicitUrl,
		`http://localhost:${localPort}`,
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:3002',
		'http://localhost:3003',
	].filter(Boolean)

	const candidates = [...new Set(baseCandidates)]

	resolvingDevApiUrlPromise = (async () => {
		for (const baseUrl of candidates) {
			try {
				const response = await withTimeout(`${baseUrl}/api/test`, { method: 'GET' })
				if (response.ok) {
					resolvedDevApiUrl = baseUrl
					return resolvedDevApiUrl
				}
			} catch {
				// Try next candidate.
			}
		}

		// Keep behavior predictable if backend is offline.
		resolvedDevApiUrl = `http://localhost:${localPort}`
		return resolvedDevApiUrl
	})()

	try {
		return await resolvingDevApiUrlPromise
	} finally {
		resolvingDevApiUrlPromise = null
	}
}

const AUTH_TOKEN_KEY = 'hotel_token'

// Centralize token persistence so all authenticated calls share one source of truth.
export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY)
export const setAuthToken = (token) => localStorage.setItem(AUTH_TOKEN_KEY, token)
export const clearAuthToken = () => localStorage.removeItem(AUTH_TOKEN_KEY)

// Reusable JSON request helper used by auth/rooms/bookings/users integrations.
export const apiRequest = async (path, options = {}) => {
	const { withAuth = false, headers, body, ...rest } = options
	const token = getAuthToken()
	const baseUrl = isDevelopment ? await resolveDevApiUrl() : API_URL
	const endpoint = `${baseUrl}${path}`

	let response
	try {
		response = await fetch(endpoint, {
			...rest,
			headers: {
				'Content-Type': 'application/json',
				...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
				...(headers || {}),
			},
			body: body !== undefined ? JSON.stringify(body) : undefined,
		})
	} catch {
		throw new Error(
			`Cannot reach backend (${baseUrl}). Start backend server and try again.`
		)
	}

	let data = null
	try {
		data = await response.json()
	} catch {
		data = null
	}

	if (!response.ok) {
		const details = data?.errors?.[0]?.msg || data?.message || data?.error || `HTTP ${response.status}`
		throw new Error(details)
	}

	return data
}
