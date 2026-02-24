import { createApp } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import App from './App.vue'

declare global {
	interface Window {
		__TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient
	}
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60,
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
})

window.__TANSTACK_QUERY_CLIENT__ = queryClient

createApp(App).use(VueQueryPlugin, { queryClient }).mount('#app')
