import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@/labs/better-select/BetterSelect'

const OPTIONS_COUNT = 10000

@customElement('better-select-page')
export class BetterSelectPage extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .top-row {
            display: flex;
            gap: 16px;
        }
    `

    private options: BetterSelectOption[] = this.createOptions(OPTIONS_COUNT)

    render() {
        return html`
            <p>Better Select</p>
            <p>Options count: ${this.options.length}</p>

            <div class="top-row">
                <div class="section">
                    <better-select name="example" multiple .options=${this.options}></better-select>
                </div>
            </div>
        `
    }

    private createOptions(count: number): BetterSelectOption[] {
        return Array.from({ length: count }, (_, index) => {
            const optionNumber = index + 1

            return {
                label: `Option ${optionNumber}`,
                value: `option-${optionNumber}`
            }
        })
    }
}
