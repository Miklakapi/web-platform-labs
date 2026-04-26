export class BetterTable<T = any> extends HTMLElement {
    private shadow!: ShadowRoot

    private viewport!: HTMLDivElement
    private spacer!: HTMLDivElement
    private bodyLayer!: HTMLDivElement

    private header!: HTMLDivElement

    private columnsInternal: BetterTableInternalColumn<T>[] = []
    private rowsInternal: T[] = []
    private renderedRows: T[] = []

    private rowHeight = 40
    private headerHeight = 40
    private buffer = 8

    private viewportHeight = 600

    private rowClassName: BetterTableRowClassName<T> = ''
    private rowStyle: BetterTableRowStyle<T> = ''

    private scheduled = false

    static get observedAttributes() {
        return ['row-height', 'header-height', 'viewport-height']
    }

    constructor() {
        super()
        this.attach()
    }

    connectedCallback() {
        this.renderStructure()
        this.renderAll()
    }

    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
        if (!newValue) return

        const numericValue = Number(newValue)

        if (Number.isNaN(numericValue)) return

        if (name === 'row-height') {
            this.rowHeight = numericValue
        }

        if (name === 'header-height') {
            this.headerHeight = numericValue
        }

        if (name === 'viewport-height') {
            this.viewportHeight = numericValue
        }

        this.renderAll()
    }

    public setData(options: BetterTableSetDataOptions<T>) {
        if (options.columns) {
            this.columnsInternal = options.columns.map((column, index) => ({
                ...column,
                _id: `${column.key}-${index}`,
                width: column.width ?? 160
            }))
        }

        if (options.rows) {
            this.rowsInternal = [...options.rows]
        }

        this.renderAll()
    }

    public setColumns(columns: BetterTableColumn<T>[]) {
        this.setData({ columns })
    }

    public setRows(rows: T[]) {
        this.setData({ rows })
    }

    public setRowClassName(value: BetterTableRowClassName<T>) {
        this.rowClassName = value
        this.renderVisibleRows()
    }

    public setRowStyle(value: BetterTableRowStyle<T>) {
        this.rowStyle = value
        this.renderVisibleRows()
    }

    private attach() {
        this.shadow = this.attachShadow({ mode: 'open' })
        this.shadow.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    min-width: 0;
                    box-sizing: border-box;
                    --bt-border-color: #e5e7eb;
                    --bt-header-bg: #f8fafc;
                    --bt-row-bg: #ffffff;
                    --bt-row-alt-bg: #fafafa;
                    --bt-row-hover-bg: #f3f4f6;
                    --bt-cell-color: #111827;
                    --bt-header-color: #111827;
                    --bt-shadow-sticky: 4px 0 10px rgba(0, 0, 0, 0.06);
                    --bt-font-size: 14px;
                    --bt-font-family: Arial, sans-serif;
                }

                .root {
                    position: relative;
                    border: 1px solid var(--bt-border-color);
                    border-radius: 8px;
                    overflow: hidden;
                    background: white;
                    font-family: var(--bt-font-family);
                    font-size: var(--bt-font-size);
                    color: var(--bt-cell-color);
                }

                .header {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    display: flex;
                    width: max-content;
                    min-width: 100%;
                    background: var(--bt-header-bg);
                    border-bottom: 1px solid var(--bt-border-color);
                    height: var(--header-height);
                }

                .viewport {
                    position: relative;
                    overflow: auto;
                    height: var(--viewport-height);
                }

                .spacer {
                    position: relative;
                    width: 100%;
                    height: 0;
                }

                .body-layer {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .row {
                    position: absolute;
                    left: 0;
                    display: flex;
                    width: max-content;
                    min-width: 100%;
                    height: var(--row-height);
                    box-sizing: border-box;
                    pointer-events: auto;
                }

                .row.is-alt {
                    background: var(--bt-row-alt-bg);
                }

                .row:hover {
                    background: var(--bt-row-hover-bg);
                }

                .cell,
                .header-cell {
                    position: relative;
                    display: flex;
                    align-items: center;
                    box-sizing: border-box;
                    border-right: 1px solid var(--bt-border-color);
                    border-bottom: 1px solid var(--bt-border-color);
                    padding: 0 12px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .header-cell {
                    height: var(--header-height);
                    font-weight: 600;
                    color: var(--bt-header-color);
                    user-select: none;
                    background: var(--bt-header-bg);
                }

                .cell {
                    height: var(--row-height);
                    background: transparent;
                }

                .header-label {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    flex: 1;
                }

                .empty {
                    padding: 24px;
                    color: #6b7280;
                }

                .content-node {
                    display: inline-flex;
                    align-items: center;
                    min-width: 0;
                }
            </style>

            <div class="root">
                <div class="header"></div>

                <div class="viewport">
                    <div class="spacer"></div>
                    <div class="body-layer"></div>
                </div>
            </div>
        `

        this.viewport = this.shadow.querySelector('.viewport') as HTMLDivElement
        this.spacer = this.shadow.querySelector('.spacer') as HTMLDivElement
        this.bodyLayer = this.shadow.querySelector('.body-layer') as HTMLDivElement
        this.header = this.shadow.querySelector('.header') as HTMLDivElement
    }

    disconnectedCallback() {
        this.viewport?.removeEventListener('scroll', this.onScroll)
    }

    private renderStructure() {
        this.style.setProperty('--row-height', `${this.rowHeight}px`)
        this.style.setProperty('--header-height', `${this.headerHeight}px`)
        this.style.setProperty('--viewport-height', `${this.viewportHeight}px`)

        this.viewport.removeEventListener('scroll', this.onScroll)
        this.viewport.addEventListener('scroll', this.onScroll)
    }

    private renderAll() {
        this.renderStructure()

        this.renderedRows = this.rowsInternal

        const totalHeight = this.renderedRows.length * this.rowHeight

        this.spacer.style.height = `${totalHeight}px`
        this.bodyLayer.style.height = '100%'
        this.bodyLayer.style.transform = ''

        this.renderHeader()
        this.renderVisibleRows()
    }

    private renderHeader() {
        this.header.replaceChildren()

        const fragment = document.createDocumentFragment()

        this.columnsInternal.forEach(column => {
            fragment.appendChild(this.createHeaderCell(column))
        })

        this.header.appendChild(fragment)

        this.syncHorizontalScroll()
    }

    private createHeaderCell(column: BetterTableInternalColumn<T>) {
        const cell = document.createElement('div')
        cell.className = 'header-cell'
        cell.style.width = `${column.width}px`
        cell.style.minWidth = `${column.width}px`
        cell.style.maxWidth = `${column.width}px`

        if (column.headerClassName) {
            cell.classList.add(...column.headerClassName.split(' ').filter(Boolean))
        }

        if (column.headerStyle) {
            cell.style.cssText += `;${column.headerStyle}`
        }

        const label = document.createElement('div')
        label.className = 'header-label'
        label.textContent = column.title
        cell.appendChild(label)

        return cell
    }

    private renderVisibleRows() {
        this.bodyLayer.replaceChildren()

        if (!this.columnsInternal.length) {
            const empty = document.createElement('div')
            empty.className = 'empty'
            empty.textContent = 'No columns defined'
            this.bodyLayer.appendChild(empty)

            this.bodyLayer.style.transform = ''
            return
        }

        if (!this.renderedRows.length) {
            const empty = document.createElement('div')
            empty.className = 'empty'
            empty.textContent = 'No data'
            this.bodyLayer.appendChild(empty)

            this.bodyLayer.style.transform = ''
            return
        }

        const scrollTop = this.viewport.scrollTop
        const viewportHeight = this.viewport.clientHeight

        const firstVisibleIndex = Math.floor(scrollTop / this.rowHeight)
        const renderStart = Math.max(0, firstVisibleIndex - this.buffer)
        const renderEnd = Math.min(this.renderedRows.length, Math.ceil((scrollTop + viewportHeight) / this.rowHeight) + this.buffer)

        const offsetY = firstVisibleIndex * this.rowHeight

        this.bodyLayer.style.transform = `translateY(${offsetY}px)`

        const fragment = document.createDocumentFragment()

        for (let rowIndex = renderStart; rowIndex < renderEnd; rowIndex++) {
            const row = this.renderedRows[rowIndex]
            fragment.appendChild(this.createRow(row, rowIndex, firstVisibleIndex, this.columnsInternal))
        }

        this.bodyLayer.appendChild(fragment)

        this.syncHorizontalScroll()
    }

    private createRow(row: T, rowIndex: number, anchorIndex: number, columns: BetterTableInternalColumn<T>[]) {
        const rowElement = document.createElement('div')
        rowElement.className = 'row'
        rowElement.style.top = `${(rowIndex - anchorIndex) * this.rowHeight}px`
        rowElement.style.transform = `translateX(${-this.viewport.scrollLeft}px)`

        if (rowIndex % 2 === 1) {
            rowElement.classList.add('is-alt')
        }

        const rowClassName = typeof this.rowClassName === 'function' ? this.rowClassName(row, rowIndex) : this.rowClassName

        if (rowClassName) {
            rowElement.classList.add(...rowClassName.split(' ').filter(Boolean))
        }

        const rowStyle = typeof this.rowStyle === 'function' ? this.rowStyle(row, rowIndex) : this.rowStyle

        if (rowStyle) {
            rowElement.style.cssText += `;${rowStyle}`
        }

        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
            const column = columns[columnIndex]
            const value = this.getCellValue(row, rowIndex, column)

            const ctx: BetterTableCellContext<T> = {
                row,
                rowIndex,
                column,
                columnIndex,
                value
            }

            const cell = document.createElement('div')
            cell.className = 'cell'
            cell.style.width = `${column.width}px`
            cell.style.minWidth = `${column.width}px`
            cell.style.maxWidth = `${column.width}px`

            if (typeof column.className === 'string' && column.className) {
                cell.classList.add(...column.className.split(' ').filter(Boolean))
            }

            if (typeof column.className === 'function') {
                const className = column.className(ctx)
                if (className) {
                    cell.classList.add(...className.split(' ').filter(Boolean))
                }
            }

            if (typeof column.style === 'string' && column.style) {
                cell.style.cssText += `;${column.style}`
            }

            if (typeof column.style === 'function') {
                const style = column.style(ctx)
                if (style) {
                    cell.style.cssText += `;${style}`
                }
            }

            const contentWrapper = document.createElement('div')
            contentWrapper.className = 'content-node'

            if (column.renderer) {
                const result = column.renderer(ctx)

                if (result instanceof HTMLElement) {
                    contentWrapper.appendChild(result)
                } else if (result != null) {
                    contentWrapper.textContent = String(result)
                }
            } else {
                contentWrapper.textContent = value == null ? '' : String(value)
            }

            cell.appendChild(contentWrapper)
            rowElement.appendChild(cell)
        }

        return rowElement
    }

    private syncHorizontalScroll() {
        this.header.style.transform = `translateX(${-this.viewport.scrollLeft}px)`
    }

    private onScroll = () => {
        if (this.scheduled) return

        this.scheduled = true

        requestAnimationFrame(() => {
            this.scheduled = false
            this.syncHorizontalScroll()
            this.renderVisibleRows()
        })
    }

    private getCellValue<T>(row: T, rowIndex: number, column: BetterTableInternalColumn<T>) {
        if (column.valueGetter) {
            return column.valueGetter(row, rowIndex)
        }

        return (row as Record<string, unknown>)?.[column.key]
    }
}

customElements.define('better-table', BetterTable)
