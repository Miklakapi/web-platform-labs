type BetterTableCellRendererResult = string | number | HTMLElement | null | undefined

type BetterTableColumn<T = any> = {
    key: string
    title: string
    width?: number
    minWidth?: number
    maxWidth?: number
    resizable?: boolean
    className?: string | ((ctx: BetterTableCellContext<T>) => string | undefined)
    style?: string | ((ctx: BetterTableCellContext<T>) => string | undefined)
    headerClassName?: string
    headerStyle?: string
    valueGetter?: (row: T, rowIndex: number) => unknown
    renderer?: (ctx: BetterTableCellContext<T>) => BetterTableCellRendererResult
}

type BetterTableCellContext<T = any> = {
    row: T
    rowIndex: number
    column: BetterTableColumn<T>
    columnIndex: number
    value: unknown
}

type BetterTableRowClassName<T = any> = string | ((row: T, rowIndex: number) => string | undefined)

type BetterTableRowStyle<T = any> = string | ((row: T, rowIndex: number) => string | undefined)

type BetterTableSetDataOptions<T = any> = {
    columns?: BetterTableColumn<T>[]
    rows?: T[]
}

type BetterTableInternalColumn<T = any> = BetterTableColumn<T> & {
    _id: string
    width: number
    minWidth: number
    maxWidth: number
    resizable: boolean
}

type ProductRow = {
    id: number
    name: string
    sku: string
    color: string
    stock: number
    price: number
    image: string
}
