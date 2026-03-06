import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('side-menu')
export class SideMenu extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
    `

    render() {
        return html`
            <h1 id="title"></h1>
            <button id="menuBtn">Menu</button>
        `
    }
}
