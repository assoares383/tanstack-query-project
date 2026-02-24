import { computed, ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { getPosts } from '../services/posts'

export function usePostsQuery() {
  const page = ref(1)
  const limit = ref(5)

  const titleFilterInput = ref('')
  const userIdFilterInput = ref<number | null>(null)
  const appliedTitleFilter = ref('')
  const appliedUserIdFilter = ref<number | undefined>(undefined)

  const postsQueryKey = computed(() => {
    return [
      'posts',
      {
        page: page.value,
        limit: limit.value,
        title: appliedTitleFilter.value,
        userId: appliedUserIdFilter.value,
      },
    ] as const
  })

  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    queryFn: () =>
      getPosts({
        page: page.value,
        limit: limit.value,
        title: appliedTitleFilter.value || undefined,
        userId: appliedUserIdFilter.value,
      }),
    placeholderData: keepPreviousData,
  })

  const totalPages = computed(() => {
    const total = postsQuery.data.value?.total ?? 0

    return Math.max(1, Math.ceil(total / limit.value))
  })

  const canGoPrevious = computed(() => page.value > 1)
  const canGoNext = computed(() => page.value < totalPages.value)
  const currentItems = computed(() => postsQuery.data.value?.items ?? [])

  const formattedLastUpdate = computed(() => {
    if (!postsQuery.dataUpdatedAt.value) {
      return 'Ainda não atualizado'
    }

    return new Date(postsQuery.dataUpdatedAt.value).toLocaleTimeString('pt-BR')
  })

  function handleApplyFilters() {
    appliedTitleFilter.value = titleFilterInput.value.trim()
    appliedUserIdFilter.value = userIdFilterInput.value ?? undefined
    page.value = 1
  }

  function handleClearFilters() {
    titleFilterInput.value = ''
    userIdFilterInput.value = null
    appliedTitleFilter.value = ''
    appliedUserIdFilter.value = undefined
    page.value = 1
  }

  function handlePreviousPage() {
    if (canGoPrevious.value) {
      page.value -= 1
    }
  }

  function handleNextPage() {
    if (canGoNext.value) {
      page.value += 1
    }
  }

  return {
    page,
    limit,
    titleFilterInput,
    userIdFilterInput,
    appliedTitleFilter,
    appliedUserIdFilter,
    postsQueryKey,
    postsQuery,
    totalPages,
    canGoPrevious,
    canGoNext,
    currentItems,
    formattedLastUpdate,
    handleApplyFilters,
    handleClearFilters,
    handlePreviousPage,
    handleNextPage,
  }
}
