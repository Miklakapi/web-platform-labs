import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('better-select')
class BetterSelect extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 240px;
        }

        .select {
            position: relative;
        }

        .trigger {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ccc;
            border-radius: 6px;
            background: white;
            cursor: pointer;
            text-align: left;

            display: flex;
            align-items: center;
            min-width: 0;
        }

        .trigger-label {
            display: block;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .dropdown {
            position: fixed;
            border: 1px solid #ccc;
            border-radius: 6px;
            background: white;
            overflow: auto;
            z-index: 1000;
            max-height: 200px;
        }

        .virtual-space {
            position: relative;
        }

        .virtual-items {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
        }

        .option {
            height: 38px;
            padding: 0 12px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            cursor: pointer;
        }

        .option:hover {
            background: #f2f2f2;
        }

        .option[data-selected='true'] {
            background: #e8f0ff;
            font-weight: 600;
        }
    `

    @property({ type: String })
    name = 'better-select'

    @property({ type: Boolean })
    multiple = false

    @property({ attribute: false })
    options: BetterSelectOption[] = []

    @state()
    private open = false

    @state()
    private dropdownTop = 0

    @state()
    private dropdownLeft = 0

    @state()
    private dropdownWidth = 0

    @state()
    private selectedValues: string[] = []

    @state()
    private topScroll = 0

    private optionHeight = 38
    private dropdownMaxHeight = 200
    private overscan = 2

    connectedCallback() {
        super.connectedCallback()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.stopListeningOutsideClick()
    }

    render() {
        return html`
            <div class="select">
                ${this.renderHiddenInputs()}

                <button class="trigger" type="button" @click=${this.toggleDropdown}>
                    <span class="trigger-label">${this.getTriggerLabel()}</span>
                </button>

                ${this.open ? this.renderDropdown() : nothing}
            </div>
        `
    }

    private renderHiddenInputs() {
        if (!this.name) {
            return nothing
        }

        return html`
            ${this.selectedValues.map(value => {
                return html`
                    <input type="hidden" name=${this.name} value=${value} />
                `
            })}
        `
    }

    private renderDropdown() {
        const totalHeight = this.options.length * this.optionHeight

        const visibleCount = Math.ceil(this.dropdownMaxHeight / this.optionHeight)
        const startIndex = Math.max(0, Math.floor(this.topScroll / this.optionHeight) - this.overscan)
        const endIndex = Math.min(this.options.length, startIndex + visibleCount + this.overscan * 2)

        const visibleOptions = this.options.slice(startIndex, endIndex)
        const offsetY = startIndex * this.optionHeight

        return html`
            <div
                class="dropdown"
                style="
                top: ${this.dropdownTop}px;
                left: ${this.dropdownLeft}px;
                width: ${this.dropdownWidth}px;
                max-height: ${this.dropdownMaxHeight}px;
            "
                @scroll=${this.handleDropdownScroll}
            >
                <div class="virtual-space" style="height: ${totalHeight}px;">
                    <div class="virtual-items" style="transform: translateY(${offsetY}px);">
                        ${visibleOptions.map(option => {
                            const selected = this.isSelected(option.value)

                            return html`
                                <div class="option" data-selected=${selected ? 'true' : 'false'} @click=${() => this.handleOptionClick(option)}>
                                    ${option.label}
                                </div>
                            `
                        })}
                    </div>
                </div>
            </div>
        `
    }

    private toggleDropdown() {
        this.open = !this.open

        if (this.open) {
            this.topScroll = 0
            this.updateDropdownPosition()
            this.startListeningOutsideClick()
            return
        }

        this.stopListeningOutsideClick()
    }

    private startListeningOutsideClick() {
        window.addEventListener('pointerdown', this.handleOutsidePointerDown)
    }

    private stopListeningOutsideClick() {
        window.removeEventListener('pointerdown', this.handleOutsidePointerDown)
    }

    private handleOutsidePointerDown = (event: PointerEvent) => {
        const path = event.composedPath()

        if (path.includes(this)) {
            return
        }

        this.open = false
        this.stopListeningOutsideClick()
    }

    private updateDropdownPosition() {
        const trigger = this.renderRoot.querySelector('.trigger')

        if (!(trigger instanceof HTMLElement)) {
            return
        }

        const rect = trigger.getBoundingClientRect()

        this.dropdownTop = rect.bottom + 4
        this.dropdownLeft = rect.left
        this.dropdownWidth = rect.width
    }

    private handleOptionClick(option: BetterSelectOption) {
        if (this.multiple) {
            this.toggleMultiValue(option.value)
        } else {
            this.toggleSingleValue(option.value)
            this.open = false
        }

        this.dispatchChangeEvent()
    }

    private toggleSingleValue(value: string) {
        if (this.selectedValues[0] === value) {
            this.selectedValues = []
            return
        }

        this.selectedValues = [value]
    }

    private toggleMultiValue(value: string) {
        if (this.selectedValues.includes(value)) {
            this.selectedValues = this.selectedValues.filter(selectedValue => {
                return selectedValue !== value
            })

            return
        }

        this.selectedValues = [...this.selectedValues, value]
    }

    private isSelected(value: string) {
        return this.selectedValues.includes(value)
    }

    private getTriggerLabel() {
        if (this.selectedValues.length === 0) {
            return 'Select option'
        }

        const selectedOptions = this.options.filter(option => {
            return this.selectedValues.includes(option.value)
        })

        return selectedOptions.map(option => option.label).join(', ')
    }

    private handleDropdownScroll(event: Event) {
        const dropdown = event.currentTarget

        if (!(dropdown instanceof HTMLElement)) {
            return
        }

        this.topScroll = dropdown.scrollTop
    }

    private dispatchChangeEvent() {
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.multiple ? this.selectedValues : (this.selectedValues[0] ?? null),
                    values: this.selectedValues
                },
                bubbles: true,
                composed: true
            })
        )
    }
}
