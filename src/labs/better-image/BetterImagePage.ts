import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@/labs/better-image/BetterImage'

@customElement('better-image-page')
export class BetterImagePage extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .top-row {
            display: flex;
            gap: 16px;
        }
    `

    render() {
        const count = 3000
        return html`
            <p>Better Image</p>
            <div class="top-row">
                <div class="section">
                    <h3>Blur</h3>
                    <better-image src="http://localhost:8080/api/better-image/photo1/blur"></better-image>
                </div>
                <div class="section">
                    <h3>Random</h3>
                    <better-image src="http://localhost:8080/api/better-image-random/full"></better-image>
                </div>
                <div class="section">
                    <h3>Target width</h3>
                    <better-image
                        sources="50:http://localhost:8080/api/better-image/photo1/blur 400:http://localhost:8080/api/better-image/photo1/small 1000:http://localhost:8080/api/better-image/photo1/full"
                        target-width="1000"
                    ></better-image>
                </div>
            </div>
            <br />
            <better-image
                sources="50:http://localhost:8080/api/better-image/photo2/blur 400:http://localhost:8080/api/better-image/photo2/small 1000:http://localhost:8080/api/better-image/photo2/full"
            ></better-image>
            <br />
            <better-image
                sources="50:http://localhost:8080/api/better-image/photo3/blur 400:http://localhost:8080/api/better-image/photo3/small 1000:http://localhost:8080/api/better-image/photo3/full"
                target-width="1000"
            ></better-image>
            <br />
            ${Array.from(
                { length: count },
                (_, i) => html`
                    <better-image
                        sources="
                    50:http://localhost:8080/api/better-image/photo${(i % 3) + 1}/blur
                    400:http://localhost:8080/api/better-image/photo${(i % 3) + 1}/small
                    1000:http://localhost:8080/api/better-image/photo${(i % 3) + 1}/full
                "
                    ></better-image>
                    <br />
                `
            )}
        `
    }
}
