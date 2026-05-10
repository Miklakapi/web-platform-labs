const storeDecoratorSubscriptionsKey = Symbol('storeDecoratorSubscriptions')

export function store<TValue>(subscribable: TValue & Subscribable) {
    return function storeDecorator(prototype: LitLikeElement, propertyKey: string | symbol): void {
        const originalConnectedCallback = prototype.connectedCallback
        const originalDisconnectedCallback = prototype.disconnectedCallback

        Object.defineProperty(prototype, propertyKey, {
            get(this: LitLikeElement): TValue {
                return subscribable
            },

            configurable: true,
            enumerable: true
        })

        prototype.connectedCallback = function connectedCallbackWithStore(
            this: LitLikeElement & {
                [storeDecoratorSubscriptionsKey]?: StoreDecoratorSubscription[]
            }
        ): void {
            originalConnectedCallback.call(this)

            if (!this[storeDecoratorSubscriptionsKey]) {
                this[storeDecoratorSubscriptionsKey] = []
            }

            const alreadySubscribed = this[storeDecoratorSubscriptionsKey].some(subscription => {
                return subscription.propertyKey === propertyKey
            })

            if (alreadySubscribed) {
                return
            }

            const unsubscribe = subscribable.subscribe(() => {
                this.requestUpdate(propertyKey)
            })

            this[storeDecoratorSubscriptionsKey].push({
                propertyKey,
                unsubscribe
            })

            this.requestUpdate(propertyKey)
        }

        prototype.disconnectedCallback = function disconnectedCallbackWithStore(
            this: LitLikeElement & {
                [storeDecoratorSubscriptionsKey]?: StoreDecoratorSubscription[]
            }
        ): void {
            const subscriptions = this[storeDecoratorSubscriptionsKey] ?? []

            for (const subscription of subscriptions) {
                if (subscription.propertyKey === propertyKey) {
                    subscription.unsubscribe()
                }
            }

            this[storeDecoratorSubscriptionsKey] = subscriptions.filter(subscription => {
                return subscription.propertyKey !== propertyKey
            })

            originalDisconnectedCallback.call(this)
        }
    }
}
