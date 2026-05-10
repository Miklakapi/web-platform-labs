import { LitElement, html, css } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import '@/labs/better-dialog/BetterDialog'

type BetterDialogElement = HTMLElement & {
    open: () => void
    close: () => void
}

@customElement('better-dialog-page')
export class BetterDialogPage extends LitElement {
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

        .buttons {
            display: flex;
            gap: 8px;
        }

        .dialog-content {
            min-width: 240px;
        }

        .custom-header {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .custom-header-title {
            font-weight: 600;
        }

        .custom-header-subtitle {
            font-size: 12px;
            opacity: 0.7;
        }
    `

    @state()
    private firstDialogOpened = false

    @state()
    private secondDialogOpened = false

    @state()
    private criticalDialogOpened = false

    @query('#method-dialog')
    private methodDialog!: BetterDialogElement

    render() {
        return html`
            <p>Better Dialog</p>

            <div class="top-row">
                <div class="section">
                    <div class="buttons">
                        <button @click=${this.openMethodDialog}>Open method dialog</button>
                        <button @click=${this.closeMethodDialog}>Close method dialog</button>
                    </div>

                    <div class="buttons">
                        <button @click=${this.openFirstDialogByState}>Open state dialog</button>
                        <button @click=${this.closeFirstDialogByState}>Close state dialog</button>
                    </div>

                    <div class="buttons">
                        <button @click=${this.openCriticalDialogByState}>Open critical dialog</button>
                        <button @click=${this.closeCriticalDialogByState}>Close critical dialog</button>
                    </div>

                    <div class="buttons">
                        <button @click=${this.toggleSecondDialogByState}>Toggle draggable non-modal dialog</button>
                    </div>

                    <better-dialog id="method-dialog" title="Method dialog" modal>
                        <div class="dialog-content">
                            <p>Modal dialog opened by open() method</p>
                            <button @click=${this.closeMethodDialog}>Close</button>
                        </div>
                    </better-dialog>

                    <better-dialog
                        title="State dialog"
                        modal
                        .opened=${this.firstDialogOpened}
                        @close=${() => {
                            this.firstDialogOpened = false
                        }}
                    >
                        <div slot="header" class="custom-header">
                            <span class="custom-header-title">Custom state dialog header</span>
                            <span class="custom-header-subtitle">This modal dialog is not draggable</span>
                        </div>

                        <div class="dialog-content">
                            <p>Modal dialog controlled by firstDialogOpened state</p>
                            <button @click=${this.closeFirstDialogByState}>Close</button>
                        </div>
                    </better-dialog>

                    <better-dialog
                        title="Draggable non-modal dialog"
                        draggable
                        .opened=${this.secondDialogOpened}
                        @close=${() => {
                            this.secondDialogOpened = false
                        }}
                    >
                        <div class="dialog-content">
                            <p>Non-modal dialog controlled by secondDialogOpened state</p>
                            <p>This one can be dragged because it does not block the screen.</p>
                            <button @click=${this.closeSecondDialogByState}>Close</button>
                        </div>
                    </better-dialog>

                    <better-dialog
                        title="Critical modal dialog"
                        modal
                        shakeOnBackdropClick
                        .opened=${this.criticalDialogOpened}
                        @close=${() => {
                            this.criticalDialogOpened = false
                        }}
                    >
                        <div class="dialog-content">
                            <p>This dialog requires your attention first.</p>

                            <button @click=${this.closeCriticalDialogByState}>Close</button>
                        </div>
                    </better-dialog>
                </div>
            </div>
        `
    }

    private openMethodDialog() {
        this.methodDialog.open()
    }

    private closeMethodDialog() {
        this.methodDialog.close()
    }

    private openFirstDialogByState() {
        this.firstDialogOpened = true
    }

    private closeFirstDialogByState() {
        this.firstDialogOpened = false
    }

    private toggleSecondDialogByState() {
        this.secondDialogOpened = !this.secondDialogOpened
    }

    private closeSecondDialogByState() {
        this.secondDialogOpened = false
    }

    private openCriticalDialogByState() {
        this.criticalDialogOpened = true
    }
    private closeCriticalDialogByState() {
        this.criticalDialogOpened = false
    }
}
