import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('forms-page')
export class FormsPage extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
    `

    render() {
        return html`
            <p>Forms page</p>
        `
    }
}
