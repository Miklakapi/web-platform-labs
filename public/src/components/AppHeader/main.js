class AppHeader extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    async connectedCallback() {
        const [html, css] = await Promise.all([
            fetch(new URL('./template.html', import.meta.url)).then(r => r.text()),
            fetch(new URL('./style.css', import.meta.url)).then(r => r.text())
        ])

        this.shadowRoot.innerHTML = `
            <style>${css}</style>
            ${html}
        `
    }
}

customElements.define('app-header', AppHeader)
