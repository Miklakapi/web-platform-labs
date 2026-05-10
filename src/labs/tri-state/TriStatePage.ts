import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@/labs/tri-state/TriState'

@customElement('tri-state-page')
export class TriStatePage extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .top-row {
            display: flex;
            gap: 16px;
        }

        .section {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .input-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .value {
            font-family: monospace;
        }
    `

    @state()
    private selectValue = ''

    @state()
    private checkboxValue = ''

    @state()
    private switchValue = ''

    render() {
        return html`
            <p>Tri State</p>

            <div class="top-row">
                <div class="section">
                    <div class="input-row">
                        <tri-state
                            name="example-select"
                            mode="select"
                            @change=${(event: CustomEvent) => {
                                this.selectValue = String(event.detail.value)
                            }}
                        ></tri-state>

                        <span class="value">selectValue: ${this.selectValue}</span>
                    </div>

                    <div class="input-row">
                        <tri-state
                            name="example-checkbox"
                            mode="checkbox"
                            @change=${(event: CustomEvent) => {
                                this.checkboxValue = String(event.detail.value)
                            }}
                        ></tri-state>

                        <span class="value">checkboxValue: ${this.checkboxValue}</span>
                    </div>

                    <div class="input-row">
                        <tri-state
                            name="example-switch"
                            mode="switch"
                            @change=${(event: CustomEvent) => {
                                this.switchValue = String(event.detail.value)
                            }}
                        ></tri-state>

                        <span class="value">switchValue: ${this.switchValue}</span>
                    </div>
                </div>
            </div>
        `
    }
}
