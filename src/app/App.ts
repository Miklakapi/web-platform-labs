import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import '@/app/layout/AppHeader'
import '@/app/layout/SideMenu'

import { getCurrentPath, getCurrentRoute, isKnownRoute } from '@/app/router'

@customElement('app-view')
export class AppView extends LitElement {
    @state()
    private route = getCurrentRoute()

    @state()
    private pageLoaded = false

    private handleRouteChange = async () => {
        const path = getCurrentPath()

        if (!isKnownRoute(path)) {
            window.history.replaceState({}, '', '/')
        }

        this.route = getCurrentRoute()
        this.pageLoaded = false

        await this.route.loader()
        this.pageLoaded = true
    }

    async connectedCallback() {
        super.connectedCallback()
        window.addEventListener('popstate', this.handleRouteChange)

        const path = getCurrentPath()

        if (!isKnownRoute(path)) {
            window.history.replaceState({}, '', '/')
        }

        this.route = getCurrentRoute()
        await this.route.loader()
        this.pageLoaded = true
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.handleRouteChange)
        super.disconnectedCallback()
    }

    static styles = css`
        :host {
            display: block;
            min-height: 100vh;
        }

        .layout {
            display: grid;
            grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
            min-height: 100vh;
        }

        .main {
            min-width: 0;
            display: grid;
            grid-template-rows: var(--header-height) minmax(0, 1fr);
        }

        .content {
            min-width: 0;
            padding: var(--page-padding);
        }

        .loading {
            color: var(--color-text-muted);
        }

        .box {
            min-width: 0;
            width: 100%;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius);
            padding: 24px;
            max-height: calc(100vh - var(--header-height) - 2 * var(--page-padding));
            overflow: auto;
            box-sizing: border-box;
        }
    `

    private renderPage() {
        if (!this.pageLoaded) {
            return html`
                <div class="loading">Loading...</div>
            `
        }

        return this.route.render()
    }

    render() {
        return html`
            <div class="layout">
                <side-menu></side-menu>

                <div class="main">
                    <app-header .title=${this.route.title}></app-header>

                    <main class="content">
                        <section class="box">${this.renderPage()}</section>
                    </main>
                </div>
            </div>
        `
    }
}
