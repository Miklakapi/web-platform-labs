import { Directive, directive, PartInfo, PartType } from 'lit/directive.js'

class TooltipDirective extends Directive {
    private element?: HTMLElement
    private text = ''
    private options: TooltipOptions = {}

    constructor(partInfo: PartInfo) {
        super(partInfo)

        if (partInfo.type !== PartType.ELEMENT) {
            throw new Error('tooltip directive can only be used on elements')
        }
    }

    render(text: string, options: TooltipOptions = {}) {
        this.text = text
        this.options = options

        return undefined
    }

    update(part: unknown, [text, options = {}]: [string, TooltipOptions?]) {
        const element = (part as { element: HTMLElement }).element

        if (this.element !== element) {
            this.cleanup()
            this.element = element
            this.attach(element)
        }

        this.text = text
        this.options = options

        return undefined
    }

    disconnected() {
        this.cleanup()
    }

    private attach(element: HTMLElement) {
        element.addEventListener('pointerenter', this.onShow)
        element.addEventListener('pointerleave', this.onHide)
        element.addEventListener('focus', this.onShow)
        element.addEventListener('blur', this.onHide)
    }

    private cleanup() {
        if (!this.element) return

        this.element.removeEventListener('pointerenter', this.onShow)
        this.element.removeEventListener('pointerleave', this.onHide)
        this.element.removeEventListener('focus', this.onShow)
        this.element.removeEventListener('blur', this.onHide)
    }

    private onShow = () => {
        if (!this.element || !this.text) return

        this.element.dispatchEvent(
            new CustomEvent('tooltip-show', {
                bubbles: true,
                composed: true,
                detail: {
                    anchor: this.element,
                    text: this.text,
                    placement: this.options.placement ?? 'top'
                }
            })
        )
    }

    private onHide = () => {
        if (!this.element) return

        this.element.dispatchEvent(
            new CustomEvent('tooltip-hide', {
                bubbles: true,
                composed: true,
                detail: {
                    anchor: this.element
                }
            })
        )
    }
}

export const tooltip = directive(TooltipDirective)
