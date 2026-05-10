import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { useDemoStore } from './demoStore'
import { watchStore } from './storeController'
import { store } from './decorator'

const demoStore = useDemoStore()

@customElement('global-store-page')
export class GlobalStorePage extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .top-row {
            display: flex;
            gap: 16px;
        }

        .section {
            padding: 16px;
            border: 1px solid #ccc;
        }
    `

    // Method 1
    private readonly demoStore = demoStore
    private readonly storeSubscription = watchStore(this, this.demoStore)

    // Method 2
    @store(demoStore.counter)
    private readonly counter!: typeof demoStore.counter

    render() {
        return html`
            <p>Global Store</p>

            <div class="top-row">
                <div class="section">
                    <h3>Method 1: watchStore()</h3>
                    <p>Counter: ${this.demoStore.counter.value}</p>

                    <button @click=${() => this.demoStore.decrement()}>-</button>
                    <button @click=${() => this.demoStore.increment()}>+</button>
                </div>

                <div class="section">
                    <h3>Method 2: @store()</h3>
                    <p>Counter: ${this.counter.value}</p>

                    <button @click=${() => this.demoStore.decrement()}>-</button>
                    <button @click=${() => this.demoStore.increment()}>+</button>
                </div>
            </div>
        `
    }
}
