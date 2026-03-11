import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-header')
export class AppHeader extends LitElement {
    @property({ type: String })
    title = ''

    static styles = css`
        :host {
            display: block;
            height: var(--header-height);
            background: var(--color-surface);
            border-bottom: 1px solid var(--color-border);
        }

        .header {
            height: 100%;
            display: flex;
            align-items: center;
            padding: 0 var(--page-padding);
        }

        h1 {
            font-size: 20px;
            font-weight: 600;
            color: var(--color-text);
        }
    `

    render() {
        return html`
            <header class="header">
                <h1>${this.title}</h1>
            </header>
        `
    }
}
