import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { routes, getCurrentPath, navigate } from '@/app/router'

@customElement('side-menu')
export class SideMenu extends LitElement {
    @state()
    private currentPath = getCurrentPath()

    private handleRouteChange = () => {
        this.currentPath = getCurrentPath()
    }

    connectedCallback() {
        super.connectedCallback()
        window.addEventListener('popstate', this.handleRouteChange)
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.handleRouteChange)
        super.disconnectedCallback()
    }

    private handleNavigate(path: string) {
        navigate(path)
    }

    static styles = css`
        :host {
            display: block;
            width: var(--sidebar-width);
            height: 100vh;
            background: var(--color-sidebar-bg);
            color: var(--color-sidebar-text);
        }

        .sidebar {
            height: calc(100% - 17px);
            padding: 17px 8px 0px 8px;
        }

        .title {
            margin-bottom: 24px;
            font-size: 14px;
            font-weight: 700;
            text-align: center;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            opacity: 0.75;
        }

        nav {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        button {
            width: 100%;
            border: 0;
            background: transparent;
            color: inherit;
            text-align: left;
            padding: 10px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        button:hover {
            background: var(--color-sidebar-hover);
        }

        button.active {
            background: var(--color-primary);
            color: #fff;
        }
    `

    render() {
        return html`
            <aside class="sidebar">
                <div class="title">Sandboxes</div>

                <nav>
                    ${routes.map(
                        route => html`
                            <button class=${this.currentPath === route.path ? 'active' : ''} @click=${() => this.handleNavigate(route.path)}>
                                ${route.title}
                            </button>
                        `
                    )}
                </nav>
            </aside>
        `
    }
}
