import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

import '../../components/AppHeader/main.js'
import '../../components/SideMenu/main.js'

@customElement('app-view')
export class AppView extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
    `

    render() {
        return html`
            <app-header title="Test SPA"></app-header>

            <div class="body">
                <side-menu></side-menu>
                <main class="content"></main>
            </div>
        `
    }
}
