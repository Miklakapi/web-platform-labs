import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('color-picker')
class ColorPicker extends LitElement {
    static style = css`
        :host {
            display: block;
        }
    `

    @property({ type: String })
    name = 'color-picker'

    @state()
    private open = false

    render() {
        return html`
            <div>hello</div>
        `
    }
}
