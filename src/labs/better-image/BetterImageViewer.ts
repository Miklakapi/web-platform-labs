declare global {
    interface WindowEventMap {
        'better-image:open': BetterImageOpenEvent
    }
}

export type BetterImageOpenEvent = CustomEvent<BetterImageOpenDetail>

export type BetterImageOpenDetail = {
    previewSrc: string | null
    fullSrc: string | null
}

const style = document.createElement('style')
style.textContent = `
.bi-viewer {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.88);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease;
    z-index: 999999;
    box-sizing: border-box;
}

.bi-viewer.open {
    opacity: 1;
    pointer-events: auto;
}

.bi-viewer__image {
    width: 100%;
    height: 100%;
    max-width: calc(100vw - 48px);
    max-height: calc(100vh - 48px);
    object-fit: contain;
    display: block;
}

.bi-viewer__close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.45);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    z-index: 1;
    transition: background 0.16s ease, transform 0.16s ease;
}

.bi-viewer__close:hover {
    background: rgba(0, 0, 0, 0.65);
    transform: scale(1.04);
}

.bi-viewer__close:active {
    transform: scale(0.98);
}

.bi-viewer__close-icon {
    width: 20px;
    height: 20px;
    display: block;
    pointer-events: none;
}
`
document.head.appendChild(style)

class BetterImageViewer {
    private static readonly CLOSE_ANIMATION_DURATION = 180

    private overlay: HTMLDivElement
    private img: HTMLImageElement
    private closeButton: HTMLButtonElement
    private isOpen = false
    private loadVersion = 0

    constructor() {
        this.overlay = document.createElement('div')
        this.overlay.className = 'bi-viewer'

        this.img = document.createElement('img')
        this.img.className = 'bi-viewer__image'

        this.closeButton = document.createElement('button')
        this.closeButton.type = 'button'
        this.closeButton.className = 'bi-viewer__close'
        this.closeButton.setAttribute('aria-label', 'Close preview')
        this.closeButton.innerHTML = `
            <svg class="bi-viewer__close-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        `
        this.closeButton.addEventListener('click', this.handleCloseClick)

        this.overlay.appendChild(this.img)
        this.overlay.appendChild(this.closeButton)
        document.body.appendChild(this.overlay)

        window.addEventListener('keydown', this.handleKeyDown)
        window.addEventListener('better-image:open', this.handleOpen)
    }

    private handleOpen = (event: BetterImageOpenEvent) => {
        this.open(event.detail)
    }

    private open(detail: BetterImageOpenDetail) {
        const { previewSrc, fullSrc } = detail

        if (!previewSrc && !fullSrc) {
            return
        }

        const currentLoadVersion = this.createLoadVersion()
        const immediateSrc = previewSrc || fullSrc || ''

        this.img.src = immediateSrc
        this.overlay.classList.add('open')
        this.isOpen = true
        document.body.style.overflow = 'hidden'

        if (!fullSrc || fullSrc === immediateSrc) {
            return
        }

        this.loadImageInBackground(fullSrc, () => {
            if (!this.isCurrentLoadVersion(currentLoadVersion)) {
                return
            }

            this.img.src = fullSrc
        })
    }

    private createLoadVersion(): number {
        this.loadVersion += 1
        return this.loadVersion
    }

    private loadImageInBackground(src: string, onLoad: () => void): void {
        const image = new Image()
        image.src = src
        image.onload = onLoad
    }

    private isCurrentLoadVersion(loadVersion: number): boolean {
        return this.loadVersion === loadVersion
    }

    private handleCloseClick = (event: MouseEvent): void => {
        event.preventDefault()
        event.stopPropagation()
        this.close()
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== 'Escape') {
            return
        }

        this.close()
    }

    private close() {
        if (!this.isOpen) {
            return
        }

        this.overlay.classList.remove('open')
        this.isOpen = false
        this.loadVersion += 1

        document.body.style.overflow = ''

        window.setTimeout(() => {
            if (this.isOpen) {
                return
            }

            this.img.src = ''
        }, BetterImageViewer.CLOSE_ANIMATION_DURATION)
    }
}

new BetterImageViewer()
