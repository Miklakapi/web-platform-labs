export class BetterTable extends HTMLElement {
    private data: string[][] = []
    private rowHeight = 35
    private buffer = 10

    private viewport!: HTMLDivElement
    private spacer!: HTMLDivElement
    private table!: HTMLTableElement
    private tbody!: HTMLTableSectionElement

    constructor() {
        super()

        this.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    border: 1px solid #dcdcdc;
                    border-radius: 8px;
                    background: white;
                    box-sizing: border-box;
                }

                .viewport {
                    overflow: auto;
                    height: 600px;
                    position: relative;
                }

                .spacer {
                    height: 0;
                }

                table {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    border-collapse: collapse;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    background: white;
                }

                td {
                    border: 1px solid #e5e7eb;
                    padding: 8px 12px;
                    text-align: left;
                    white-space: nowrap;
                    box-sizing: border-box;
                    height: 35px;
                }

                tr:nth-child(even) {
                    background: #f9fafb;
                }

                tr:hover {
                    background: #f3f4f6;
                }
            </style>

            <div class="viewport">
                <div class="spacer"></div>
                <table>
                    <tbody></tbody>
                </table>
            </div>
        `

        this.viewport = this.querySelector('.viewport') as HTMLDivElement
        this.spacer = this.querySelector('.spacer') as HTMLDivElement
        this.table = this.querySelector('table') as HTMLTableElement
        this.tbody = this.querySelector('tbody') as HTMLTableSectionElement

        this.viewport.addEventListener('scroll', this.renderVisibleRows)
    }

    public setData(data: string[][]) {
        this.data = data
        this.spacer.style.height = `${this.data.length * this.rowHeight}px`
        this.renderVisibleRows()
    }

    private renderVisibleRows = () => {
        const scrollTop = this.viewport.scrollTop
        const viewportHeight = this.viewport.clientHeight

        const start = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.buffer)
        const end = Math.min(this.data.length, Math.ceil((scrollTop + viewportHeight) / this.rowHeight) + this.buffer)

        this.table.style.transform = `translateY(${start * this.rowHeight}px)`
        this.tbody.innerHTML = ''

        for (let i = start; i < end; i++) {
            const tr = document.createElement('tr')

            for (const column of this.data[i]) {
                const td = document.createElement('td')
                td.textContent = column
                tr.appendChild(td)
            }

            this.tbody.appendChild(tr)
        }
    }
}

customElements.define('better-table', BetterTable)
