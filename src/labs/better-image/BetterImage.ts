const sheet = new CSSStyleSheet()
sheet.replaceSync(`
    :host {
        display: inline-block;
        position: relative;
    }

    img {
        display: block;
        width: 100%;
        height: auto;
    }

    .reload-button {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.55);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transform: scale(0.9);
        transition: opacity 0.16s ease, transform 0.16s ease, background 0.16s ease;
        padding: 0;
        z-index: 2;
    }

    .reload-button:hover {
        background: rgba(0, 0, 0, 0.72);
    }

    :host(:hover) .reload-button {
        opacity: 1;
        pointer-events: auto;
        transform: scale(1);
    }

    .reload-icon {
        width: 14px;
        height: 14px;
        display: block;
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
    private reloadButton: HTMLButtonElement
    private sourcesMap: ImageVariant[] = []
    private renderVersion = 0
    private currentDisplayedSrc: string | null = null
    private isReadyToLoadImage = false

    constructor() {
        super()

        this.root = this.attachShadow({ mode: 'open' })
        this.root.adoptedStyleSheets = [sheet]

        this.image = document.createElement('img')

        this.reloadButton = document.createElement('button')
        this.reloadButton.type = 'button'
        this.reloadButton.className = 'reload-button'
        this.reloadButton.setAttribute('aria-label', 'Odśwież zdjęcie')
        this.reloadButton.innerHTML = `
            <svg class="reload-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        `
        this.reloadButton.addEventListener('click', this.handleReloadClick)

        this.root.append(this.image, this.reloadButton)
    }

    connectedCallback(): void {
        this.startObservingVisibility()
        this.render()
    }

    disconnectedCallback(): void {
        this.stopObservingVisibility()
        this.reloadButton.removeEventListener('click', this.handleReloadClick)
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

    private handleReloadClick = async (event: MouseEvent): Promise<void> => {
        event.preventDefault()
        event.stopPropagation()

        const currentUrl = this.resolveCurrentImageUrl()
        if (!currentUrl) {
            return
        }

        await this.reloadImageThroughServiceWorker(currentUrl)
        this.forceVisualReload()
    }

    private resolveCurrentImageUrl(): string | null {
        if (this.currentDisplayedSrc) {
            return this.currentDisplayedSrc
        }

        const src = this.getAttribute('src')
        if (src) {
            return src
        }

        return this.selectTargetVariant()?.src || this.selectPreviewVariant()?.src || null
    }

    private async reloadImageThroughServiceWorker(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const controller = navigator.serviceWorker.controller

            if (!controller) {
                reject(new Error('No active service worker'))
                return
            }

            const channel = new MessageChannel()

            channel.port1.onmessage = event => {
                if (event.data?.ok) {
                    resolve()
                    return
                }

                reject(new Error(event.data?.error || 'Failed to refresh image'))
            }

            controller.postMessage(
                {
                    type: 'better-image:reload',
                    url
                },
                [channel.port2]
            )
        })
    }

    private forceVisualReload(): void {
        const src = this.resolveCurrentImageUrl()
        if (!src) {
            return
        }

        const refreshedSrc = this.appendRefreshTimestamp(src)

        this.currentDisplayedSrc = null
        this.image.src = refreshedSrc
    }

    private appendRefreshTimestamp(src: string): string {
        const url = new URL(src, window.location.origin)
        url.searchParams.set('_bi_refresh', String(Date.now()))

        return url.toString()
    }
}

customElements.define('better-image', BetterImage)
