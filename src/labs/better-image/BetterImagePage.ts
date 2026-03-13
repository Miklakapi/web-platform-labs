import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@/labs/better-image/BetterImage'

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
            <better-image src="http://localhost:8080/api/better-image/photo1/small"></better-image>
            <br />
            <better-image src="http://localhost:8080/api/better-image/photo2/small"></better-image>
            <br />
            <better-image src="http://localhost:8080/api/better-image/photo3/small"></better-image>
            <br />
        `
    }
}
