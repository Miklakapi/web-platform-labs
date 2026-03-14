import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@/labs/better-image/BetterImage'

@customElement('better-image-page')
export class BetterImagePage extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        better-image {
            width: 400px;
        }
    `

    render() {
        const count = 3000
        return html`
            <p>Better Image</p>
            <better-image src="http://localhost:8080/api/better-image/photo1/blur"></better-image>
            <better-image
                sources="50:http://localhost:8080/api/better-image/photo1/blur 400:http://localhost:8080/api/better-image/photo1/small 1000:http://localhost:8080/api/better-image/photo1/full"
                target-width="1000"
            ></better-image>
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
