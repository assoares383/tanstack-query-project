import { describe, expect, it, vi } from 'vitest'
import { createPost, getPosts, removePost, updatePost } from '../src/services/posts'

describe('posts service', () => {
  it('getPosts should return paged data and parse x-total-count', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 1, userId: 1, title: 'A', body: 'B' }]), {
        status: 200,
        headers: { 'x-total-count': '20' },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const result = await getPosts({ page: 2, limit: 5, title: 'abc', userId: 1 })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/posts?_page=2&_limit=5&title_like=abc&userId=1'),
    )
    expect(result.total).toBe(20)
    expect(result.items).toHaveLength(1)
    expect(result.page).toBe(2)
    expect(result.limit).toBe(5)
  })

  it('getPosts should fallback total to items length when header is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ id: 1, userId: 1, title: 'A', body: 'B' }]), {
          status: 200,
        }),
      ),
    )

    const result = await getPosts({ page: 1, limit: 10 })

    expect(result.total).toBe(1)
  })

  it('getPosts should throw on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

    await expect(getPosts({ page: 1, limit: 5 })).rejects.toThrow('Não foi possível carregar os posts')
  })

  it('createPost should call api and return body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 99, userId: 1, title: 'Novo', body: 'Teste' }), {
        status: 201,
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const result = await createPost({ userId: 1, title: 'Novo', body: 'Teste' })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/posts'),
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result.id).toBe(99)
  })

  it('createPost should throw on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 400 })))

    await expect(createPost({ userId: 1, title: 'x', body: 'y' })).rejects.toThrow('Falha ao criar post')
  })

  it('updatePost should call api and return updated body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1, userId: 2, title: 'Edit', body: 'Body' }), {
        status: 200,
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const result = await updatePost({ id: 1, userId: 2, title: 'Edit', body: 'Body' })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/posts/1'),
      expect.objectContaining({ method: 'PUT' }),
    )
    expect(result.title).toBe('Edit')
  })

  it('updatePost should throw on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 400 })))

    await expect(updatePost({ id: 1, userId: 1, title: 'x', body: 'y' })).rejects.toThrow(
      'Falha ao atualizar post',
    )
  })

  it('removePost should call delete endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await removePost(7)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/posts/7'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('removePost should throw on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

    await expect(removePost(1)).rejects.toThrow('Falha ao remover post')
  })
})
