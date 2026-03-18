export {}

declare const self: ServiceWorkerGlobalScope

const serverAddr = 'http://localhost:8080'
const refreshToken = 'rt_8f3b9e5c2d4a7b1e6f9c0a3d5e7b2c4a9f6d1e8b3c5a7d2e4f9b1c6a8d3e5f'
let accessToken = ''
let refreshPromise: Promise<string> | null = null

self.addEventListener('install', event => {
    console.log('[better-image sw] installed')
    self.skipWaiting()
})

self.addEventListener('activate', event => {
    console.log('[better-image sw] activated')
    event.waitUntil(self.clients.claim())
})

self.addEventListener('message', event => {
    if (event.data?.type !== 'better-image:reload') {
        return
    }

    const port = event.ports?.[0]

    event.waitUntil(
        (async () => {
            try {
                const url = event.data.url

                if (!url) {
                    throw new Error('Missing url')
                }

                await reloadImage(url)

                port?.postMessage({ ok: true })
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'
                port?.postMessage({ ok: false, error: message })
            }
        })()
    )
})

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url)

    if (!shouldHandleRequest(url)) {
        return
    }

    event.respondWith(handleAuthorizedRequest(event.request))
})

async function reloadImage(urlPath: string): Promise<void> {
    const originalUrl = new URL(urlPath, self.location.origin)
    const originalRequest = new Request(originalUrl.toString(), {
        method: 'GET'
    })

    const token = await ensureAccessToken()

    let response = await fetch(buildAuthorizedRequest(originalRequest, token), {
        cache: 'reload'
    })

    if (response.status !== 401) {
        if (!response.ok) {
            throw new Error(`Reload failed: ${response.status}`)
        }

        return
    }

    const newToken = await refreshAccessToken()

    response = await fetch(buildAuthorizedRequest(originalRequest, newToken), {
        cache: 'reload'
    })

    if (!response.ok) {
        throw new Error(`Reload failed: ${response.status}`)
    }
}

function shouldHandleRequest(url: URL): boolean {
    return url.pathname.startsWith('/api/')
}

async function handleAuthorizedRequest(request: Request): Promise<Response> {
    const token = await ensureAccessToken()

    let response = await dispatchRequest(buildAuthorizedRequest(request, token), request)

    if (response.status !== 401) {
        return response
    }

    const newToken = await refreshAccessToken()

    response = await dispatchRequest(buildAuthorizedRequest(request, newToken), request)

    return response
}

async function dispatchRequest(authorizedRequest: Request, originalRequest: Request): Promise<Response> {
    const response = await fetch(authorizedRequest)
    const url = new URL(originalRequest.url)

    if (!url.pathname.startsWith('/api/better-image')) {
        return response
    }

    return rewriteBrowserCacheHeaders(response, 'no-cache')
}

function rewriteBrowserCacheHeaders(response: Response, cacheControl: string): Response {
    const headers = new Headers(response.headers)

    headers.set('Cache-Control', cacheControl)

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    })
}

async function ensureAccessToken(): Promise<string> {
    if (accessToken) {
        return accessToken
    }

    return refreshAccessToken()
}

function buildAuthorizedRequest(request: Request, token: string): Request {
    const sourceUrl = new URL(request.url)
    sourceUrl.searchParams.delete('_bi_refresh')

    const targetUrl = new URL(sourceUrl.pathname + sourceUrl.search, serverAddr)
    const headers = new Headers(request.headers)

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    return new Request(targetUrl.toString(), {
        method: request.method,
        headers,
        body: request.body,
        mode: 'cors',
        credentials: 'omit'
    } as RequestInit)
}

async function refreshAccessToken(): Promise<string> {
    if (refreshPromise) {
        return refreshPromise
    }

    refreshPromise = (async () => {
        const response = await fetch(`${serverAddr}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken
            })
        })

        if (!response.ok) {
            throw new Error(`Refresh failed: ${response.status}`)
        }

        const data = await response.json()

        if (!data?.accessToken) {
            throw new Error('Missing accessToken in refresh response')
        }

        accessToken = data.accessToken

        return accessToken
    })()

    try {
        return await refreshPromise
    } finally {
        refreshPromise = null
    }
}
