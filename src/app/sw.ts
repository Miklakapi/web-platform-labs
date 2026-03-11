import { sayHello } from '@/labs/better-image/sw'

declare const self: ServiceWorkerGlobalScope

self.addEventListener('install', event => {
    console.log('[better-image sw] installed')
    self.skipWaiting()
})

self.addEventListener('activate', event => {
    console.log('[better-image sw] activated')
    event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url)
    console.log(url)
    sayHello()
    // if (url.pathname.startsWith('/api/better-image')) {
    //     event.respondWith(todo(event.request))
    //     return
    // }
})
