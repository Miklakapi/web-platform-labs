import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@/labs/better-table/BetterTable'
import { BetterTable } from '@/labs/better-table/BetterTable'

@customElement('better-table-page')
export class BetterTablePage extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .top-row {
            display: flex;
            gap: 16px;
        }

        .bt {
            flex: 1;
            min-width: 0;
        }
    `

    render() {
        return html`
            <p>Better Table</p>
            <button @click="${this.generateData}">Generate</button>
            <div class="top-row">
                <better-table class="bt"></better-table>
            </div>
        `
    }

    private generateData() {
        const betterTable = this.renderRoot.querySelector('.bt') as BetterTable

        const rows = 5000
        const cols = 20

        const data = Array.from({ length: rows }, (_, rowIndex) => Array.from({ length: cols }, (_, colIndex) => `R${rowIndex + 1}C${colIndex + 1}`))

        betterTable.setData(data)
    }
}
