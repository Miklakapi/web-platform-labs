import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@/labs/better-table/BetterTable'
import { BetterTable } from '@/labs/better-table/BetterTable'

@customElement('better-table-page')
export class BetterTablePage extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 16px;
        }

        .top-row {
            display: flex;
            gap: 16px;
        }

        .bt {
            flex: 1;
            min-width: 0;
        }

        .actions {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }

        button {
            padding: 8px 12px;
        }
    `

    render() {
        return html`
            <div class="actions">
                <button @click="${this.generateData}">Generate</button>
            </div>

            <div class="top-row">
                <better-table class="bt" viewport-height="600" row-height="40"></better-table>
            </div>
        `
    }

    private generateData() {
        const betterTable = this.renderRoot.querySelector('.bt') as BetterTable<ProductRow>

        const rows = 5000

        const columns: BetterTableColumn<ProductRow>[] = [
            {
                key: 'id',
                title: 'ID',
                width: 80
            },
            {
                key: 'name',
                title: 'Name',
                width: 220
            },
            {
                key: 'sku',
                title: 'SKU',
                width: 180
            },
            {
                key: 'color',
                title: 'Color',
                width: 140,
                renderer: ({ value }) => {
                    const wrapper = document.createElement('div')
                    wrapper.style.display = 'flex'
                    wrapper.style.alignItems = 'center'
                    wrapper.style.gap = '8px'

                    const swatch = document.createElement('span')
                    swatch.style.width = '14px'
                    swatch.style.height = '14px'
                    swatch.style.borderRadius = '50%'
                    swatch.style.border = '1px solid #d1d5db'
                    swatch.style.background = String(value)

                    const label = document.createElement('span')
                    label.textContent = String(value)

                    wrapper.appendChild(swatch)
                    wrapper.appendChild(label)

                    return wrapper
                }
            },
            {
                key: 'stock',
                title: 'Stock',
                width: 120,
                className: ({ value }) => (Number(value) < 10 ? 'is-low-stock' : ''),
                style: ({ value }) => (Number(value) < 10 ? 'color:#b91c1c;font-weight:600;' : '')
            },
            {
                key: 'price',
                title: 'Price',
                width: 120,
                renderer: ({ value }) => `${Number(value).toFixed(2)} zł`
            },
            {
                key: 'image',
                title: 'Image',
                width: 100,
                renderer: ({ value }) => {
                    const img = document.createElement('img')
                    img.src = String(value)
                    img.alt = ''
                    img.width = 28
                    img.height = 28
                    img.style.objectFit = 'cover'
                    img.style.borderRadius = '6px'
                    return img
                }
            }
        ]

        const palette = ['#111827', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7']

        const data: ProductRow[] = Array.from({ length: rows }, (_, index) => ({
            id: index + 1,
            name: `Product ${index + 1}`,
            sku: `SKU-${1000 + index}`,
            color: palette[index % palette.length],
            stock: Math.floor(Math.random() * 30),
            price: Number((Math.random() * 100).toFixed(2)),
            image: 'http://localhost:8080/api/better-image/photo1/blur'
        }))

        betterTable.setData({
            columns,
            rows: data
        })

        betterTable.setRowStyle(row => (row.stock === 0 ? 'opacity:0.65;' : ''))
    }
}
