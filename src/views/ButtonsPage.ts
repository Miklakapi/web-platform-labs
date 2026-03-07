import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('buttons-page')
export class ButtonsPage extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
    `

    render() {
        return html`
            <p>Buttons page</p>
        `
    }
}
