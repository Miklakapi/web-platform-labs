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
    private static readonly observedElements = new WeakMap<Element, BetterImage>()
    private static readonly sharedIntersectionObserver = new IntersectionObserver(
        entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) {
                    continue
                }

                const component = BetterImage.observedElements.get(entry.target)
                if (!component) {
                    continue
                }

                component.handleIntersection()
                BetterImage.sharedIntersectionObserver.unobserve(entry.target)
            }
        },
        {
            root: null,
            rootMargin: '300px 0px',
            threshold: 0.01
        }
    )

    private root: ShadowRoot
    private image: HTMLImageElement
    private sourcesMap: ImageVariant[] = []
    private renderVersion = 0
    private currentDisplayedSrc: string | null = null
    private isReadyToLoadImage = false

    constructor() {
        super()

        this.root = this.attachShadow({ mode: 'open' })
        this.root.adoptedStyleSheets = [sheet]

        this.image = document.createElement('img')
        this.root.append(this.image)
    }

    connectedCallback(): void {
        this.startObservingVisibility()
        this.render()
    }

    disconnectedCallback(): void {
        this.stopObservingVisibility()
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

        if (!this.isReadyToLoadImage) {
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
        if (this.currentDisplayedSrc === src) {
            return
        }

        this.currentDisplayedSrc = src
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

    private handleIntersection(): void {
        this.isReadyToLoadImage = true
        this.render()
    }

    private startObservingVisibility(): void {
        if (this.isReadyToLoadImage) {
            return
        }

        BetterImage.observedElements.set(this, this)
        BetterImage.sharedIntersectionObserver.observe(this)
    }

    private stopObservingVisibility(): void {
        BetterImage.sharedIntersectionObserver.unobserve(this)
    }
}

customElements.define('better-image', BetterImage)
