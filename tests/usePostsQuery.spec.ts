import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PostsPage } from '../src/types/post'

const mockUseQuery = vi.fn()
const mockGetPosts = vi.fn()

vi.mock('@tanstack/vue-query', () => ({
  useQuery: mockUseQuery,
  keepPreviousData: Symbol('keepPreviousData'),
}))

vi.mock('../src/services/posts', () => ({
  getPosts: mockGetPosts,
}))

describe('usePostsQuery', () => {
  beforeEach(() => {
    mockUseQuery.mockReset()
    mockGetPosts.mockReset()
    mockGetPosts.mockResolvedValue({ items: [], total: 0, page: 1, limit: 5 })
    const queryState = {
      data: ref<PostsPage | undefined>({
        items: [{ id: 1, userId: 1, title: 'Post', body: 'Body' }],
        total: 12,
        page: 1,
        limit: 5,
      }),
      dataUpdatedAt: ref(0),
      isLoading: ref(false),
      isFetching: ref(false),
      isError: ref(false),
      error: ref<Error | null>(null),
      refetch: vi.fn(),
    }

    mockUseQuery.mockReturnValue(queryState)
  })

  it('should initialize query state and expose computed values', async () => {
    const { usePostsQuery } = await import('../src/composables/usePostsQuery')
    const composable = usePostsQuery()

    expect(composable.page.value).toBe(1)
    expect(composable.totalPages.value).toBe(3)
    expect(composable.canGoPrevious.value).toBe(false)
    expect(composable.canGoNext.value).toBe(true)
    expect(composable.currentItems.value).toHaveLength(1)
    expect(composable.formattedLastUpdate.value).toBe('Ainda não atualizado')

    expect(mockUseQuery).toHaveBeenCalledTimes(1)
    expect(mockUseQuery.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        queryKey: expect.anything(),
        queryFn: expect.any(Function),
      }),
    )
  })

  it('should apply and clear filters resetting page', async () => {
    const { usePostsQuery } = await import('../src/composables/usePostsQuery')
    const composable = usePostsQuery()

    composable.page.value = 3
    composable.titleFilterInput.value = '  vue '
    composable.userIdFilterInput.value = 2

    composable.handleApplyFilters()

    expect(composable.appliedTitleFilter.value).toBe('vue')
    expect(composable.appliedUserIdFilter.value).toBe(2)
    expect(composable.page.value).toBe(1)

    composable.titleFilterInput.value = 'x'
    composable.userIdFilterInput.value = 1
    composable.handleClearFilters()

    expect(composable.titleFilterInput.value).toBe('')
    expect(composable.userIdFilterInput.value).toBeNull()
    expect(composable.appliedTitleFilter.value).toBe('')
    expect(composable.appliedUserIdFilter.value).toBeUndefined()
    expect(composable.page.value).toBe(1)
  })

  it('should handle pagination boundaries', async () => {
    const { usePostsQuery } = await import('../src/composables/usePostsQuery')
    const composable = usePostsQuery()

    composable.handlePreviousPage()
    expect(composable.page.value).toBe(1)

    composable.handleNextPage()
    expect(composable.page.value).toBe(2)

    composable.handleNextPage()
    expect(composable.page.value).toBe(3)

    composable.handleNextPage()
    expect(composable.page.value).toBe(3)

    composable.handlePreviousPage()
    expect(composable.page.value).toBe(2)
  })

  it('should format last update when dataUpdatedAt is present', async () => {
    const queryState = {
      data: ref<PostsPage | undefined>({
        items: [],
        total: 0,
        page: 1,
        limit: 5,
      }),
      dataUpdatedAt: ref(new Date('2026-02-23T10:00:00.000Z').getTime()),
      isLoading: ref(false),
      isFetching: ref(false),
      isError: ref(false),
      error: ref<Error | null>(null),
      refetch: vi.fn(),
    }

    mockUseQuery.mockReturnValue(queryState)

    const { usePostsQuery } = await import('../src/composables/usePostsQuery')
    const composable = usePostsQuery()

    expect(composable.formattedLastUpdate.value).not.toBe('Ainda não atualizado')
  })

  it('should call queryFn with undefined filters when not applied', async () => {
    const { usePostsQuery } = await import('../src/composables/usePostsQuery')
    usePostsQuery()

    const config = mockUseQuery.mock.calls[0][0]
    await config.queryFn()

    expect(mockGetPosts).toHaveBeenCalledWith({
      page: 1,
      limit: 5,
      title: undefined,
      userId: undefined,
    })
  })

  it('should call queryFn with applied filters', async () => {
    const { usePostsQuery } = await import('../src/composables/usePostsQuery')
    const composable = usePostsQuery()

    composable.titleFilterInput.value = 'vue'
    composable.userIdFilterInput.value = 3
    composable.handleApplyFilters()

    const config = mockUseQuery.mock.calls[0][0]
    await config.queryFn()

    expect(mockGetPosts).toHaveBeenCalledWith({
      page: 1,
      limit: 5,
      title: 'vue',
      userId: 3,
    })
  })
})
