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
        loader: () => import('@/views/HomePage'),
        render: () => html`
            <home-page></home-page>
        `
    },
    {
        path: '/buttons',
        title: 'Buttons',
        loader: () => import('@/views/ButtonsPage'),
        render: () => html`
            <buttons-page></buttons-page>
        `
    },
    {
        path: '/forms',
        title: 'Forms',
        loader: () => import('@/views/FormsPage'),
        render: () => html`
            <forms-page></forms-page>
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
