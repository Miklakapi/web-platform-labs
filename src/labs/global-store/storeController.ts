import type { ReactiveController, ReactiveControllerHost } from 'lit'

export class StoreController implements ReactiveController {
    private readonly host: ReactiveControllerHost
    private readonly subscribable: Subscribable

    private unsubscribe?: Unsubscribe

    constructor(host: ReactiveControllerHost, subscribable: Subscribable) {
        this.host = host
        this.subscribable = subscribable

        this.host.addController(this)
    }

    hostConnected(): void {
        this.unsubscribe = this.subscribable.subscribe(() => {
            this.host.requestUpdate()
        })
    }

    hostDisconnected(): void {
        this.unsubscribe?.()
        this.unsubscribe = undefined
    }
}

export function watchStore(host: ReactiveControllerHost, subscribable: Subscribable): StoreController {
    return new StoreController(host, subscribable)
}
