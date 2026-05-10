let activeStoreContext: StoreContext | null = null

export function defineStore<TStore extends Record<string, unknown>>(setup: () => TStore): StoreFactory<TStore> {
    let storeInstance: StoreInstance<TStore> | null = null

    return function useStore(): StoreInstance<TStore> {
        if (storeInstance) {
            return storeInstance
        }

        const previousStoreContext = activeStoreContext
        const storeContext = createStoreContext()

        activeStoreContext = storeContext

        try {
            const setupResult = setup()

            storeInstance = {
                ...setupResult,

                subscribe(subscriber: StoreSubscriber): Unsubscribe {
                    return storeContext.subscribe(subscriber)
                }
            }

            return storeInstance
        } finally {
            activeStoreContext = previousStoreContext
        }
    }
}

function createStoreContext(): StoreContext {
    const subscribers = new Set<StoreSubscriber>()

    function subscribe(subscriber: StoreSubscriber): Unsubscribe {
        subscribers.add(subscriber)

        return function unsubscribe(): void {
            subscribers.delete(subscriber)
        }
    }

    function notify(): void {
        for (const subscriber of subscribers) {
            subscriber()
        }
    }

    return {
        subscribe,
        notify
    }
}

export function ref<T>(initialValue: T): Ref<T> {
    const storeContext = activeStoreContext

    if (!storeContext) {
        throw new Error('ref() can only be used inside defineStore().')
    }

    let currentValue = initialValue

    const subscribers = new Set<StoreSubscriber>()

    function subscribe(subscriber: StoreSubscriber): Unsubscribe {
        subscribers.add(subscriber)

        return function unsubscribe(): void {
            subscribers.delete(subscriber)
        }
    }

    function notifyRefSubscribers(): void {
        for (const subscriber of subscribers) {
            subscriber()
        }
    }

    const refValue: Ref<T> = {
        __isRef: true,

        get value(): T {
            return currentValue
        },

        set value(nextValue: T) {
            if (Object.is(currentValue, nextValue)) {
                return
            }

            currentValue = nextValue

            notifyRefSubscribers()
            storeContext.notify()
        },

        subscribe
    }

    return refValue
}

export function isRef<T = unknown>(value: unknown): value is Ref<T> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    return (value as Ref<T>).__isRef === true
}
