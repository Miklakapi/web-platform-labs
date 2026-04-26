class ToolTipController {
    private host: HTMLDivElement
    private tooltip: HTMLDivElement
    private activeElement: HTMLElement | null = null
    private placement: TooltipPlacement = 'top'

    constructor() {
        this.host = document.createElement('div')
        this.host.setAttribute('data-tooltip-host', '')

        this.host.style.position = 'fixed'
        this.host.style.inset = '0'
        this.host.style.zIndex = '9999'
        this.host.style.pointerEvents = 'none'

        const shadowRoot = this.host.attachShadow({ mode: 'open' })

        this.tooltip = document.createElement('div')
        this.tooltip.className = 'tooltip'
        this.tooltip.hidden = true

        const style = this.createStyles()

        shadowRoot.append(style, this.tooltip)
        document.body.appendChild(this.host)

        document.addEventListener('tooltip-show', this.onTooltipShow as EventListener)
        document.addEventListener('tooltip-hide', this.onTooltipHide as EventListener)
        window.addEventListener('scroll', this.onScroll, true)
        window.addEventListener('resize', this.onResize)
    }

    private createStyles() {
        const style = document.createElement('style')

        style.textContent = `
            .tooltip {
                position: absolute;
                top: 0;
                left: 0;

                box-sizing: border-box;
                max-width: min(260px, calc(100vw - 16px));
                padding: 6px 8px;
                border-radius: 6px;

                background: #111;
                color: #fff;

                font-size: 12px;
                line-height: 1.3;
                font-family: system-ui, sans-serif;
                white-space: normal;
                overflow-wrap: break-word;

                pointer-events: none;
                user-select: none;

                opacity: 0;
                visibility: hidden;

                transform: translate3d(0, 0, 0);
                transition:
                    opacity 80ms ease,
                    visibility 80ms ease;

                will-change: transform, opacity;
            }

            .tooltip[data-visible="true"] {
                opacity: 1;
                visibility: visible;
            }

            .tooltip[hidden] {
                display: none;
            }
        `

        return style
    }

    private onTooltipShow = (event: TooltipShowEvent) => {
        const { anchor, text, placement } = event.detail

        this.show(anchor, text, placement)
    }

    private onTooltipHide = (event: TooltipHideEvent) => {
        if (event.detail.anchor !== this.activeElement) {
            return
        }

        this.hide()
    }

    private show(anchor: HTMLElement, text: string, placement: TooltipPlacement) {
        this.activeElement = anchor
        this.placement = placement
        this.tooltip.textContent = text
        this.tooltip.hidden = false

        requestAnimationFrame(() => {
            if (!this.activeElement) return

            this.position()
            this.tooltip.dataset.visible = 'true'
        })
    }

    private hide() {
        this.activeElement = null
        this.tooltip.dataset.visible = 'false'
        this.tooltip.hidden = true
    }

    private onScroll = () => {
        if (this.activeElement) {
            this.position()
        }
    }

    private onResize = () => {
        if (this.activeElement) {
            this.position()
        }
    }

    private position() {
        const anchor = this.activeElement
        if (!anchor) return

        const gap = 8
        const margin = 8

        const anchorRect = anchor.getBoundingClientRect()
        const tooltipRect = this.tooltip.getBoundingClientRect()

        let placement = this.placement
        let pos = this.getPosition(placement, anchorRect, tooltipRect, gap)

        const overflowsTop = pos.y < margin
        const overflowsBottom = pos.y + tooltipRect.height > window.innerHeight - margin
        const overflowsLeft = pos.x < margin
        const overflowsRight = pos.x + tooltipRect.width > window.innerWidth - margin

        if (placement === 'top' && overflowsTop) {
            placement = 'bottom'
            pos = this.getPosition(placement, anchorRect, tooltipRect, gap)
        } else if (placement === 'bottom' && overflowsBottom) {
            placement = 'top'
            pos = this.getPosition(placement, anchorRect, tooltipRect, gap)
        } else if (placement === 'left' && overflowsLeft) {
            placement = 'right'
            pos = this.getPosition(placement, anchorRect, tooltipRect, gap)
        } else if (placement === 'right' && overflowsRight) {
            placement = 'left'
            pos = this.getPosition(placement, anchorRect, tooltipRect, gap)
        }

        if (placement === 'top' || placement === 'bottom') {
            if (pos.x < margin) {
                pos.x = margin
            }

            if (pos.x + tooltipRect.width > window.innerWidth - margin) {
                pos.x = window.innerWidth - tooltipRect.width - margin
            }
        }

        if (placement === 'left' || placement === 'right') {
            if (pos.y < margin) {
                pos.y = margin
            }

            if (pos.y + tooltipRect.height > window.innerHeight - margin) {
                pos.y = window.innerHeight - tooltipRect.height - margin
            }
        }

        this.tooltip.style.transform = `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y)}px, 0)`
        this.tooltip.dataset.placement = placement
    }

    private getPosition(placement: TooltipPlacement, anchorRect: DOMRect, tooltipRect: DOMRect, gap: number) {
        switch (placement) {
            case 'top':
                return {
                    x: anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2,
                    y: anchorRect.top - tooltipRect.height - gap
                }

            case 'bottom':
                return {
                    x: anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2,
                    y: anchorRect.bottom + gap
                }

            case 'left':
                return {
                    x: anchorRect.left - tooltipRect.width - gap,
                    y: anchorRect.top + anchorRect.height / 2 - tooltipRect.height / 2
                }

            case 'right':
                return {
                    x: anchorRect.right + gap,
                    y: anchorRect.top + anchorRect.height / 2 - tooltipRect.height / 2
                }
        }
    }
}

new ToolTipController()
