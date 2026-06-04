import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('better-calendar')
class BetterCalenar extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
    `

    @property({ type: String })
    name = 'better-calendar'

    @state()
    private open = false

    render() {
        return html`
            <input type="hidden" />

            ${this.open ? this.renderCalendar() : nothing}
        `
    }

    private renderCalendar() {
        return html`
            <div></div>
        `
    }
}
