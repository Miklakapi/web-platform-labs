import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@/labs/tool-tip/ToolTip'
import { tooltip } from './ToolTipDirective'

@customElement('tool-tip-page')
export class ToolTipPage extends LitElement {
    static styles = css`
        :host {
            display: block;
            min-height: 100vh;
            box-sizing: border-box;
            position: relative;
            padding: 24px;
        }

        .top-row {
            display: flex;
            gap: 16px;
        }

        .viewport-test {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 1;
        }

        .edge-button {
            position: fixed;
            pointer-events: auto;
        }

        .top-left {
            top: 8px;
            left: 8px;
        }

        .top-center {
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
        }

        .top-right {
            top: 8px;
            right: 8px;
        }

        .middle-left {
            top: 50%;
            left: 8px;
            transform: translateY(-50%);
        }

        .middle-center {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .middle-right {
            top: 50%;
            right: 8px;
            transform: translateY(-50%);
        }

        .bottom-left {
            bottom: 8px;
            left: 8px;
        }

        .bottom-center {
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
        }

        .bottom-right {
            right: 8px;
            bottom: 8px;
        }
    `

    render() {
        return html`
            <p>Tool tip</p>

            <div class="top-row">
                <div class="section">
                    <button ${tooltip('First test')}>First test</button>
                </div>
            </div>

            <div class="viewport-test">
                <button class="edge-button top-left" ${tooltip('Top left — should shift right and/or flip to bottom', { placement: 'top' })}>
                    Top left
                </button>

                <button class="edge-button top-center" ${tooltip('Top center — should flip to bottom', { placement: 'top' })}>Top center</button>

                <button class="edge-button top-right" ${tooltip('Top right — should shift left and/or flip to bottom', { placement: 'top' })}>
                    Top right
                </button>

                <button
                    class="edge-button middle-left"
                    ${tooltip('Middle left — left placement should stay inside the viewport', {
                        placement: 'left'
                    })}
                >
                    Left
                </button>

                <button class="edge-button middle-center" ${tooltip('Middle center — regular tooltip above the button', { placement: 'top' })}>
                    Center
                </button>

                <button
                    class="edge-button middle-right"
                    ${tooltip('Middle right — right placement should stay inside the viewport', {
                        placement: 'right'
                    })}
                >
                    Right
                </button>

                <button class="edge-button bottom-left" ${tooltip('Bottom left — should shift right and/or flip to top', { placement: 'bottom' })}>
                    Bottom left
                </button>

                <button class="edge-button bottom-center" ${tooltip('Bottom center — should flip to top', { placement: 'bottom' })}>
                    Bottom center
                </button>

                <button class="edge-button bottom-right" ${tooltip('Bottom right — should shift left and/or flip to top', { placement: 'bottom' })}>
                    Bottom right
                </button>
            </div>
        `
    }
}
