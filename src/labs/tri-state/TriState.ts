import { css, html, LitElement, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('tri-state')
class TriState extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 240px;
        }

        .checkbox-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            padding: 0;
            border: none;
            background: transparent;
            color: currentColor;
            cursor: pointer;
        }

        .checkbox-button svg {
            display: block;
        }

        .switch-button {
            position: relative;
            width: 54px;
            height: 22px;
            padding: 0;
            border: 1px solid #d0d4da;
            border-radius: 999px;
            background: #e1e4e8;
            cursor: pointer;
        }

        .switch-button[data-value='1'] {
            background: #4a90e2;
        }

        .switch-button[data-value='0'] {
            background: #ffffff;
        }

        .switch-thumb {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ffffff;
            box-shadow: 0 1px 3px rgb(0 0 0 / 25%);
            transition: left 120ms ease;
        }

        .switch-button[data-value='-1'] .switch-thumb {
            left: 2px;
            background: #cfd3d7;
        }

        .switch-button[data-value='0'] .switch-thumb {
            left: 18px;
            background: #4a90e2;
        }

        .switch-button[data-value='1'] .switch-thumb {
            left: 34px;
            background: #ffffff;
        }
    `

    @property({ type: String })
    name = 'tri-state'

    @property({ type: String })
    mode: TriStateMode = 'select'

    @state()
    private value: TriStateOptionValue = 0

    @property({ type: Array })
    options: TriStateOption[] = [
        {
            label: 'No',
            value: -1
        },
        {
            label: 'Yes',
            value: 1
        },
        {
            label: 'None',
            value: 0
        }
    ]

    render() {
        return html`
            <div class="tri-state">
                <input hidden name=${this.name} value=${this.getFormValue()} />
                ${this.renderInput()}
            </div>
        `
    }

    private renderInput(): TemplateResult {
        const renderers: Record<TriStateMode, () => TemplateResult> = {
            select: () => this.renderSelect(),
            switch: () => this.renderSwitch(),
            checkbox: () => this.renderCheckbox()
        }

        return renderers[this.mode]()
    }

    private renderSelect(): TemplateResult {
        return html`
            <select
                @change=${(event: Event) => {
                    const target = event.target as HTMLSelectElement

                    this.value = Number(target.value) as TriStateOptionValue
                    this.dispatchChangeEvent()
                }}
            >
                ${this.options.map(
                    option => html`
                        <option value=${String(option.value)} ?selected=${option.value === this.value}>${option.label}</option>
                    `
                )}
            </select>
        `
    }

    private renderCheckbox(): TemplateResult {
        return html`
            <button
                type="button"
                class="checkbox-button"
                @click=${() => {
                    this.value = this.getNextCheckboxValue()
                    this.dispatchChangeEvent()
                }}
            >
                ${this.renderCheckboxIcon()}
            </button>
        `
    }

    private renderSwitch(): TemplateResult {
        return html`
            <button
                type="button"
                class="switch-button"
                data-value=${String(this.value)}
                @click=${() => {
                    this.value = this.getNextSwitchValue()
                    this.dispatchChangeEvent()
                }}
            >
                <span class="switch-thumb"></span>
            </button>
        `
    }

    private getNextCheckboxValue(): TriStateOptionValue {
        if (this.value === 0) {
            return 1
        }

        if (this.value === 1) {
            return -1
        }

        return 0
    }

    private renderCheckboxIcon(): TemplateResult {
        if (this.value === 1) {
            return html`
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"></rect>
                    <path
                        d="M7 12.5L10.5 16L17 8"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    ></path>
                </svg>
            `
        }

        if (this.value === -1) {
            return html`
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"></rect>
                    <path d="M8 8L16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
                    <path d="M16 8L8 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
                </svg>
            `
        }

        return html`
            <svg viewBox="0 0 24 24" width="20" height="20">
                <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"></rect>
            </svg>
        `
    }

    private getNextSwitchValue(): TriStateOptionValue {
        if (this.value === -1) {
            return 0
        }

        if (this.value === 0) {
            return 1
        }

        return -1
    }

    private getFormValue(): string {
        return this.value === null ? '' : String(this.value)
    }

    private dispatchChangeEvent() {
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.value
                },
                bubbles: true,
                composed: true
            })
        )
    }
}
