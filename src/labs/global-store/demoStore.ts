import { defineStore, ref } from './store'

export const useDemoStore = defineStore(() => {
    const counter = ref(15)

    function increment() {
        counter.value++
    }

    function decrement() {
        counter.value--
    }

    return {
        counter,
        increment,
        decrement
    }
})
