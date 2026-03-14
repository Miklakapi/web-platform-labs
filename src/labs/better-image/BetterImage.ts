const sheet = new CSSStyleSheet()
sheet.replaceSync(`
    :host {
        display: inline-block;
    }

    img {
        display: block;
        width: 100%;
        height: auto;
    }
`)

type ImageVariant = {
    width: number
    src: string
}

export class BetterImage extends HTMLElement {
    static observedAttributes = ['src', 'sources', 'target-width']

    private static readonly MIN_ACCEPTABLE_WIDTH_RATIO = 0.7

    private root: ShadowRoot
    private image: HTMLImageElement
    private sourcesMap: ImageVariant[] = []
    private renderVersion = 0

    constructor() {
        super()

        this.root = this.attachShadow({ mode: 'open' })
        this.root.adoptedStyleSheets = [sheet]

        this.image = document.createElement('img')
        this.root.append(this.image)
    }

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback() {
        this.render()
    }

    private render() {
        const currentRenderVersion = this.createRenderVersion()
        const src = this.getAttribute('src')

        if (this.hasSingleSource(src)) {
            this.renderSingleSourceImage(src)
            return
        }

        this.renderResponsiveImage(currentRenderVersion)
    }

    private createRenderVersion(): number {
        this.renderVersion += 1
        return this.renderVersion
    }

    private hasSingleSource(src: string | null): boolean {
        return !!src
    }

    private renderSingleSourceImage(src: string | null): void {
        this.sourcesMap = []
        this.displayImage(src || '')
    }

    private renderResponsiveImage(renderVersion: number): void {
        this.sourcesMap = this.parseSourcesAttribute(this.getAttribute('sources') || '')

        if (this.sourcesMap.length === 0) {
            this.displayImage('')
            return
        }

        const previewVariant = this.selectPreviewVariant()
        const targetVariant = this.selectTargetVariant()

        this.displayImage(previewVariant.src)

        if (!targetVariant || targetVariant.src === previewVariant.src) {
            return
        }

        this.loadImageInBackground(targetVariant.src, () => {
            if (!this.isCurrentRenderVersion(renderVersion)) {
                return
            }

            this.displayImage(targetVariant.src)
            this.animateImageTransition()
        })
    }

    private displayImage(src: string): void {
        this.image.src = src
    }

    private parseSourcesAttribute(data: string): ImageVariant[] {
        return data
            .split(' ')
            .map(item => item.trim())
            .filter(Boolean)
            .map(item => {
                const separatorIndex = item.indexOf(':')

                if (separatorIndex === -1) {
                    return null
                }

                const width = Number(item.slice(0, separatorIndex))
                const src = item.slice(separatorIndex + 1)

                return {
                    width,
                    src
                }
            })
            .filter((item): item is ImageVariant => {
                return item !== null && !Number.isNaN(item.width) && !!item.src
            })
            .sort((a, b) => a.width - b.width)
    }

    private selectPreviewVariant(): ImageVariant {
        return this.sourcesMap[0]
    }

    private selectTargetVariant(): ImageVariant | undefined {
        const targetWidth = this.resolveTargetWidth()
        const acceptableVariants = this.findAcceptableVariants(targetWidth)

        if (acceptableVariants.length > 0) {
            return this.findClosestVariant(acceptableVariants, targetWidth)
        }

        return this.findLargestVariant()
    }

    private resolveTargetWidth(): number {
        const forcedTargetWidth = this.readForcedTargetWidth()

        if (forcedTargetWidth > 0) {
            return forcedTargetWidth
        }

        return this.readRenderedTargetWidth()
    }

    private readForcedTargetWidth(): number {
        const targetWidthAttribute = Number(this.getAttribute('target-width'))

        if (Number.isNaN(targetWidthAttribute)) {
            return 0
        }

        return targetWidthAttribute
    }

    private readRenderedTargetWidth(): number {
        const elementWidth = this.getBoundingClientRect().width
        const devicePixelRatio = window.devicePixelRatio || 1

        return Math.ceil(elementWidth * devicePixelRatio)
    }

    private findAcceptableVariants(targetWidth: number): ImageVariant[] {
        const minimumAcceptableWidth = targetWidth * BetterImage.MIN_ACCEPTABLE_WIDTH_RATIO

        return this.sourcesMap.filter(variant => variant.width >= minimumAcceptableWidth)
    }

    private findClosestVariant(variants: ImageVariant[], targetWidth: number): ImageVariant | undefined {
        let closestVariant = variants[0]
        let closestDistance = Math.abs(variants[0].width - targetWidth)

        for (const variant of variants) {
            const currentDistance = Math.abs(variant.width - targetWidth)

            if (currentDistance < closestDistance) {
                closestVariant = variant
                closestDistance = currentDistance
            }
        }

        return closestVariant
    }

    private findLargestVariant(): ImageVariant | undefined {
        return this.sourcesMap.at(-1)
    }

    private loadImageInBackground(src: string, onLoad: () => void): void {
        const preloadImage = new Image()
        preloadImage.src = src
        preloadImage.onload = onLoad
    }

    private isCurrentRenderVersion(renderVersion: number): boolean {
        return this.renderVersion === renderVersion
    }

    private animateImageTransition(): void {
        this.image.animate([{ opacity: '0.92' }, { opacity: '1' }], {
            duration: 180,
            easing: 'ease-out'
        })
    }
}

customElements.define('better-image', BetterImage)
