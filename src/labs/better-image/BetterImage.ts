const sheet = new CSSStyleSheet()
sheet.replaceSync(`
    :host {
        display: inline-block;
    }

    img {
        display: block;
        max-width: 100%;
    }
`)

export class BetterImage extends HTMLElement {
    static observedAttributes = ['src']

    private root: ShadowRoot
    private image: HTMLImageElement

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
        const src = this.getAttribute('src') || ''
        this.image.src = src
    }
}

customElements.define('better-image', BetterImage)
