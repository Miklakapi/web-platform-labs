type StoreContext = {
    subscribe(subscriber: StoreSubscriber): Unsubscribe
    notify(): void
}

type StoreSubscriber = () => void

type Unsubscribe = () => void

type Subscribable = {
    subscribe(subscriber: StoreSubscriber): Unsubscribe
}

type Ref<T> = {
    readonly __isRef: true

    value: T

    subscribe(subscriber: StoreSubscriber): Unsubscribe
}

type StoreInstance<TStore extends Record<string, unknown>> = TStore & {
    subscribe(subscriber: StoreSubscriber): Unsubscribe
}

type StoreFactory<TStore extends Record<string, unknown>> = {
    (): StoreInstance<TStore>
}

declare function ref<T>(initialValue: T): Ref<T>

declare function defineStore<TStore extends Record<string, unknown>>(setup: () => TStore): StoreFactory<TStore>

declare function isRef<T = unknown>(value: unknown): value is Ref<T>

type LitLikeElement = HTMLElement & {
    requestUpdate(name?: PropertyKey, oldValue?: unknown): void
    connectedCallback(): void
    disconnectedCallback(): void
}

type StoreDecoratorSubscription = {
    propertyKey: PropertyKey
    unsubscribe: Unsubscribe
}
