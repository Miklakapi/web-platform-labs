type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

type TooltipPosition = {
    x: number
    y: number
}

type TooltipOptions = {
    placement?: TooltipPlacement
}

type TooltipShowEvent = CustomEvent<{
    anchor: HTMLElement
    text: string
    placement: TooltipPlacement
}>

type TooltipHideEvent = CustomEvent<{
    anchor: HTMLElement
}>
