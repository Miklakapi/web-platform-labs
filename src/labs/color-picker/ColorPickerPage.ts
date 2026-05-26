import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@/labs/color-picker/ColorPicker'

@customElement('color-picker-page')
export class ColorPickerPage extends LitElement {
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
        return html`
            <p>Color Picker</p>
            <div class="top-row">
                <div class="section">
                    <color-picker name="example"></color-picker>
                </div>
            </div>
        `
    }
}
