import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PostsPage } from '../src/types/post'

const setQueryDataMock = vi.fn()
const invalidateQueriesMock = vi.fn()
const removeQueriesMock = vi.fn()
const mutationConfigs: Array<{ onSuccess?: (...args: any[]) => void }> = []

vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: () => ({
    setQueryData: setQueryDataMock,
    invalidateQueries: invalidateQueriesMock,
    removeQueries: removeQueriesMock,
  }),
  useMutation: (config: { onSuccess?: (...args: any[]) => void }) => {
    mutationConfigs.push(config)
    return { mutate: vi.fn(), isPending: ref(false), isError: ref(false), isSuccess: ref(false), error: ref(null) }
  },
}))

describe('usePostMutations', () => {
  beforeEach(() => {
    setQueryDataMock.mockReset()
    invalidateQueriesMock.mockReset()
    removeQueriesMock.mockReset()
    invalidateQueriesMock.mockResolvedValue(undefined)
    mutationConfigs.length = 0
  })

  it('should update cache on create success and call callback', async () => {
    const onCreateSuccess = vi.fn()
    const onUpdateSuccess = vi.fn()

    const { usePostMutations } = await import('../src/composables/usePostMutations')

    usePostMutations({
      postsQueryKey: ref(['posts']),
      appliedTitleFilter: ref(''),
      appliedUserIdFilter: ref(undefined),
      onCreateSuccess,
      onUpdateSuccess,
    })

    const createConfig = mutationConfigs[0]

    await createConfig.onSuccess?.({ id: 9, userId: 1, title: 'Novo', body: 'Body' })

    expect(setQueryDataMock).toHaveBeenCalledTimes(1)

    const updater = setQueryDataMock.mock.calls[0][1] as (oldData: PostsPage | undefined) => PostsPage | undefined
    const updated = updater({
      items: [{ id: 1, userId: 1, title: 'A', body: 'B' }],
      total: 1,
      page: 1,
      limit: 5,
    })

    expect(updated?.items[0].id).toBe(9)
    expect(updated?.total).toBe(2)
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['posts'] })
    expect(onCreateSuccess).toHaveBeenCalledTimes(1)
    expect(onUpdateSuccess).not.toHaveBeenCalled()
  })

  it('should only increment total when create does not match filters', async () => {
    const { usePostMutations } = await import('../src/composables/usePostMutations')

    usePostMutations({
      postsQueryKey: ref(['posts']),
      appliedTitleFilter: ref('vue'),
      appliedUserIdFilter: ref(2),
    })

    const createConfig = mutationConfigs[0]
    await createConfig.onSuccess?.({ id: 10, userId: 1, title: 'React', body: 'X' })

    const updater = setQueryDataMock.mock.calls[0][1] as (oldData: PostsPage | undefined) => PostsPage | undefined
    const updated = updater({
      items: [{ id: 1, userId: 2, title: 'Vue A', body: 'B' }],
      total: 1,
      page: 1,
      limit: 5,
    })

    expect(updated?.items).toHaveLength(1)
    expect(updated?.total).toBe(2)
  })

  it('should only increment total when current page is not first page', async () => {
    const { usePostMutations } = await import('../src/composables/usePostMutations')

    usePostMutations({
      postsQueryKey: ref(['posts']),
      appliedTitleFilter: ref(''),
      appliedUserIdFilter: ref(undefined),
    })

    const createConfig = mutationConfigs[0]
    await createConfig.onSuccess?.({ id: 10, userId: 1, title: 'React', body: 'X' })

    const updater = setQueryDataMock.mock.calls[0][1] as (oldData: PostsPage | undefined) => PostsPage | undefined
    const updated = updater({
      items: [{ id: 1, userId: 2, title: 'Vue A', body: 'B' }],
      total: 1,
      page: 2,
      limit: 5,
    })

    expect(updated?.items).toHaveLength(1)
    expect(updated?.total).toBe(2)
  })

  it('should update item on update success and call callback', async () => {
    const onUpdateSuccess = vi.fn()
    const { usePostMutations } = await import('../src/composables/usePostMutations')

    usePostMutations({
      postsQueryKey: ref(['posts']),
      appliedTitleFilter: ref(''),
      appliedUserIdFilter: ref(undefined),
      onUpdateSuccess,
    })

    const updateConfig = mutationConfigs[1]
    await updateConfig.onSuccess?.({ id: 1, userId: 1, title: 'Editado', body: 'Body2' })

    const updater = setQueryDataMock.mock.calls[0][1] as (oldData: PostsPage | undefined) => PostsPage | undefined
    const updated = updater({
      items: [{ id: 1, userId: 1, title: 'Antigo', body: 'Body' }],
      total: 1,
      page: 1,
      limit: 5,
    })

    expect(updated?.items[0].title).toBe('Editado')
    expect(setQueryDataMock).toHaveBeenCalledWith(['post', 1], {
      id: 1,
      userId: 1,
      title: 'Editado',
      body: 'Body2',
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['posts'] })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['post', 1], exact: true })
    expect(onUpdateSuccess).toHaveBeenCalledTimes(1)
  })

  it('should remove item and decrement total on delete success', async () => {
    const { usePostMutations } = await import('../src/composables/usePostMutations')

    usePostMutations({
      postsQueryKey: ref(['posts']),
      appliedTitleFilter: ref(''),
      appliedUserIdFilter: ref(undefined),
    })

    const deleteConfig = mutationConfigs[2]
    await deleteConfig.onSuccess?.(undefined, 2)

    const updater = setQueryDataMock.mock.calls[0][1] as (oldData: PostsPage | undefined) => PostsPage | undefined
    const updated = updater({
      items: [
        { id: 1, userId: 1, title: 'A', body: 'B' },
        { id: 2, userId: 1, title: 'C', body: 'D' },
      ],
      total: 2,
      page: 1,
      limit: 5,
    })

    expect(updated?.items).toHaveLength(1)
    expect(updated?.items[0].id).toBe(1)
    expect(updated?.total).toBe(1)
    expect(removeQueriesMock).toHaveBeenCalledWith({ queryKey: ['post', 2] })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['posts'] })
  })

  it('should keep mutation flow successful even when invalidation fails', async () => {
    const onCreateSuccess = vi.fn()
    const onUpdateSuccess = vi.fn()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    invalidateQueriesMock.mockRejectedValueOnce(new Error('invalidate failed'))
    invalidateQueriesMock.mockRejectedValueOnce(new Error('invalidate failed'))

    const { usePostMutations } = await import('../src/composables/usePostMutations')

    usePostMutations({
      postsQueryKey: ref(['posts']),
      appliedTitleFilter: ref(''),
      appliedUserIdFilter: ref(undefined),
      onCreateSuccess,
      onUpdateSuccess,
    })

    await expect(mutationConfigs[0].onSuccess?.({ id: 1, userId: 1, title: 'A', body: 'B' })).resolves.toBeUndefined()

    await expect(mutationConfigs[1].onSuccess?.({ id: 1, userId: 1, title: 'A', body: 'B' })).resolves.toBeUndefined()

    expect(onCreateSuccess).toHaveBeenCalledTimes(1)
    expect(onUpdateSuccess).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2)

    consoleErrorSpy.mockRestore()
  })

  it('should update item without callback configured', async () => {
    const { usePostMutations } = await import('../src/composables/usePostMutations')

    usePostMutations({
      postsQueryKey: ref(['posts']),
      appliedTitleFilter: ref(''),
      appliedUserIdFilter: ref(undefined),
    })

    const updateConfig = mutationConfigs[1]
    await updateConfig.onSuccess?.({ id: 2, userId: 1, title: 'X', body: 'Y' })

    const updater = setQueryDataMock.mock.calls[0][1] as (oldData: PostsPage | undefined) => PostsPage | undefined
    const updated = updater({
      items: [{ id: 2, userId: 1, title: 'Old', body: 'OldBody' }],
      total: 1,
      page: 1,
      limit: 5,
    })

    expect(updated?.items[0].title).toBe('X')
  })

  it('updaters should keep undefined cache unchanged', async () => {
    const { usePostMutations } = await import('../src/composables/usePostMutations')

    usePostMutations({
      postsQueryKey: ref(['posts']),
      appliedTitleFilter: ref(''),
      appliedUserIdFilter: ref(undefined),
    })

    await mutationConfigs[0].onSuccess?.({ id: 3, userId: 1, title: 'A', body: 'B' })
    await mutationConfigs[1].onSuccess?.({ id: 3, userId: 1, title: 'A', body: 'B' })
    await mutationConfigs[2].onSuccess?.(undefined, 3)

    for (const call of setQueryDataMock.mock.calls) {
      const updater = call[1]

      if (typeof updater === 'function') {
        expect((updater as (oldData: PostsPage | undefined) => PostsPage | undefined)(undefined)).toBeUndefined()
      }
    }
  })
})
