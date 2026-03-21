import '@/app/App.ts'
import '@/labs/better-image/BetterImageViewer'

if ('serviceWorker' in navigator) {
    try {
        await navigator.serviceWorker.register('/sw.js', {
            type: 'module'
        })
    } catch (error) {
        console.error('service worker registration failed', error)
    }
}
