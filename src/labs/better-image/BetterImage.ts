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
    static observedAttributes = ['src', 'sources']

    private root: ShadowRoot
    private image: HTMLImageElement
    private virtualImage: HTMLImageElement
    private sourcesMap: ImageVariant[] = []

    constructor() {
        super()

        this.root = this.attachShadow({ mode: 'open' })
        this.root.adoptedStyleSheets = [sheet]

        this.image = document.createElement('img')
        this.virtualImage = document.createElement('img')
        this.root.append(this.image)
    }

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback() {
        this.render()
    }

    private render() {
        const src = this.getAttribute('src')

        if (src) {
            this.sourcesMap = []
            this.image.src = src
            return
        }

        const sources = this.getAttribute('sources') || ''
        this.sourcesMap = this.parseSources(sources)

        const firstSource = this.sourcesMap[0]
        const lastSource = this.sourcesMap.at(-1)
        this.image.src = firstSource?.src || ''

        this.virtualImage.src = lastSource?.src || ''
        this.virtualImage.onload = () => {
            this.image.src = lastSource?.src || ''
        }
    }

    private parseSources(data: string): ImageVariant[] {
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
}

customElements.define('better-image', BetterImage)
