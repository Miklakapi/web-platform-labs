import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('better-image-page')
export class BetterImagePage extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
    `

    render() {
        return html`
            <p>Better Image</p>
        `
    }
}
