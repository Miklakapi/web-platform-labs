import { html, TemplateResult } from 'lit'

export type RouteItem = {
    path: string
    title: string
    loader: () => Promise<unknown>
    render: () => TemplateResult
}

export const routes: RouteItem[] = [
    {
        path: '/',
        title: 'Start',
        loader: () => import('@/labs/home/HomePage'),
        render: () => html`
            <home-page></home-page>
        `
    },
    {
        path: '/better-image',
        title: 'Better Image',
        loader: () => import('@/labs/better-image/BetterImagePage'),
        render: () => html`
            <better-image-page></-page>
        `
    }
]

export function getCurrentPath(): string {
    return window.location.pathname
}

export function getCurrentRoute(): RouteItem {
    const currentPath = getCurrentPath()
    return routes.find(route => route.path === currentPath) || routes[0]
}

export function navigate(path: string) {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new Event('popstate'))
}
