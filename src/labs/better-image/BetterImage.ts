export class BetterImage extends HTMLElement {
    static observedAttributes = ['src']

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback() {
        this.render()
    }

    render() {
        const src = this.getAttribute('src')
        this.innerHTML = `<img src="${src}">`
    }
}

customElements.define('better-image', BetterImage)
