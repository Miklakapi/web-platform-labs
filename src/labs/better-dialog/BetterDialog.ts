import { css, html, LitElement, PropertyValues } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

@customElement('better-dialog')
class BetterDialog extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        dialog {
            padding: 0;
            border: 1px solid #d0d4da;
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0 8px 24px rgb(0 0 0 / 20%);
        }

        dialog.draggable {
            position: fixed;
            margin: 0;
        }

        dialog.shake {
            animation: dialog-shake 180ms ease-in-out 0s 2;
        }

        .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 16px;
            border-bottom: 1px solid #e5e7eb;
            user-select: none;
        }

        .dialog-header.draggable {
            cursor: move;
        }

        .dialog-title {
            flex: 1;
            font-weight: 600;
        }

        .close-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            padding: 0;
            border: 0;
            border-radius: 4px;
            background: transparent;
            cursor: pointer;
            font-size: 20px;
            line-height: 1;
        }

        .dialog-body {
            padding: 16px;
        }

        @keyframes dialog-shake {
            0% {
                transform: translateX(0);
            }

            25% {
                transform: translateX(-8px);
            }

            50% {
                transform: translateX(8px);
            }

            75% {
                transform: translateX(-5px);
            }

            100% {
                transform: translateX(0);
            }
        }
    `

    @property({ type: Boolean })
    modal = false

    @property({ type: Boolean })
    draggable = false

    @property({ type: Boolean, reflect: true })
    opened = false

    @property({ type: String })
    title = ''

    @state()
    private dragStartX = 0

    @state()
    private dragStartY = 0

    @state()
    private dialogStartLeft = 0

    @state()
    private dialogStartTop = 0

    @state()
    private dragging = false

    @property({ type: Boolean })
    shakeOnBackdropClick = false

    @query('dialog')
    private dialogElement!: HTMLDialogElement

    render() {
        return html`
            <dialog
                class=${this.getDialogClasses()}
                @close=${this.handleDialogClose}
                @click=${this.handleDialogClick}
                @animationend=${this.handleShakeAnimationEnd}
            >
                <div class=${this.draggable ? 'dialog-header draggable' : 'dialog-header'} @pointerdown=${this.handleDragStart}>
                    <div class="dialog-title">
                        <slot name="header">${this.title}</slot>
                    </div>

                    <button type="button" class="close-button" @pointerdown=${(event: PointerEvent) => event.stopPropagation()} @click=${this.close}>
                        ×
                    </button>
                </div>

                <div class="dialog-body">
                    <slot></slot>
                </div>
            </dialog>
        `
    }

    protected updated(changedProperties: PropertyValues) {
        this.validateConfiguration()

        if (changedProperties.has('opened')) {
            this.syncDialogState()
        }
    }

    open() {
        this.opened = true
    }

    close() {
        this.opened = false
    }

    private validateConfiguration() {
        if (this.draggable && this.modal) {
            throw new Error('BetterDialog: draggable cannot be used with modal dialog')
        }

        if (this.shakeOnBackdropClick && !this.modal) {
            throw new Error('BetterDialog: shakeOnBackdropClick can be used only with modal dialog')
        }
    }

    private getDialogClasses(): string {
        const classes: string[] = []

        if (this.draggable) {
            classes.push('draggable')
        }

        return classes.join(' ')
    }

    private handleDialogClick(event: MouseEvent) {
        if (!this.shakeOnBackdropClick) {
            return
        }

        if (!this.modal) {
            return
        }

        if (event.target !== this.dialogElement) {
            return
        }

        this.shakeDialog()
    }

    private shakeDialog() {
        this.dialogElement.classList.remove('shake')

        void this.dialogElement.offsetWidth

        this.dialogElement.classList.add('shake')
    }

    private syncDialogState() {
        if (!this.dialogElement) {
            return
        }

        if (this.opened && !this.dialogElement.open) {
            if (this.modal) {
                this.dialogElement.showModal()
                this.centerDialog()
                return
            }

            this.dialogElement.show()
            return
        }

        if (!this.opened && this.dialogElement.open) {
            this.dialogElement.close()
        }
    }

    private centerDialog() {
        if (!this.draggable) {
            return
        }

        const rect = this.dialogElement.getBoundingClientRect()

        this.dialogElement.style.left = `${(window.innerWidth - rect.width) / 2}px`
        this.dialogElement.style.top = `${(window.innerHeight - rect.height) / 2}px`
    }

    private handleDragStart(event: PointerEvent) {
        if (!this.draggable) {
            return
        }

        this.dragging = true
        this.dragStartX = event.clientX
        this.dragStartY = event.clientY

        const rect = this.dialogElement.getBoundingClientRect()

        this.dialogStartLeft = rect.left
        this.dialogStartTop = rect.top

        window.addEventListener('pointermove', this.handleDragMove)
        window.addEventListener('pointerup', this.handleDragEnd)
    }

    private handleDragMove = (event: PointerEvent) => {
        if (!this.dragging) {
            return
        }

        const moveX = event.clientX - this.dragStartX
        const moveY = event.clientY - this.dragStartY

        this.dialogElement.style.left = `${this.dialogStartLeft + moveX}px`
        this.dialogElement.style.top = `${this.dialogStartTop + moveY}px`
    }

    private handleDragEnd = () => {
        this.dragging = false

        window.removeEventListener('pointermove', this.handleDragMove)
        window.removeEventListener('pointerup', this.handleDragEnd)
    }

    private handleShakeAnimationEnd = (event: AnimationEvent) => {
        if (event.target !== this.dialogElement) {
            return
        }

        this.dialogElement.classList.remove('shake')
    }

    private handleDialogClose() {
        this.opened = false
    }
}
