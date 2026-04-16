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
            <better-image-page></better-image-page>
        `
    },
    {
        path: '/better-table',
        title: 'Better Table',
        loader: () => import('@/labs/better-table/BetterTablePage'),
        render: () => html`
            <better-table-page></better-table-page>
        `
    }
]

export function getCurrentPath(): string {
    return window.location.pathname
}

export function isKnownRoute(path: string): boolean {
    return routes.some(route => route.path === path)
}

export function getCurrentRoute(): RouteItem {
    const currentPath = getCurrentPath()
    return routes.find(route => route.path === currentPath) || routes[0]
}

export function navigate(path: string) {
    const targetPath = isKnownRoute(path) ? path : '/'

    window.history.pushState({}, '', targetPath)
    window.dispatchEvent(new Event('popstate'))
}
