const DEPLOYED_API_URL = 'https://pfe-hnfl.onrender.com'

// Resolve local backend port from .env (REACT_APP_LOCAL_PORT), with Vite compatibility and 3000 fallback.
const localPort =
	import.meta.env.REACT_APP_LOCAL_PORT ||
	import.meta.env.VITE_LOCAL_PORT ||
	'3000'

const isDevelopment = import.meta.env.DEV

// Centralized API base URL: deployed backend in production, local backend in development.
export const API_URL = isDevelopment
	? `http://localhost:${localPort}`
	: DEPLOYED_API_URL

// Build absolute API endpoints from one source of truth so fetch/axios calls stay consistent.
export const apiEndpoint = (path) => `${API_URL}${path}`

const AUTH_TOKEN_KEY = 'hotel_token'

// Centralize token persistence so all authenticated calls share one source of truth.
export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY)
export const setAuthToken = (token) => localStorage.setItem(AUTH_TOKEN_KEY, token)
export const clearAuthToken = () => localStorage.removeItem(AUTH_TOKEN_KEY)

// Reusable JSON request helper used by auth/rooms/bookings/users integrations.
export const apiRequest = async (path, options = {}) => {
	const { withAuth = false, headers, body, ...rest } = options
	const token = getAuthToken()

	const response = await fetch(apiEndpoint(path), {
		...rest,
		headers: {
			'Content-Type': 'application/json',
			...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
			...(headers || {}),
		},
		body: body !== undefined ? JSON.stringify(body) : undefined,
	})

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
