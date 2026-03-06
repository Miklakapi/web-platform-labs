import '../../components/AppHeader/main.js'
import '../../components/SideMenu/main.js'

class AppView extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    async connectedCallback() {
        if (this.shadowRoot.innerHTML) return

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

customElements.define('app-view', AppView)
