import type { CreatePostInput, GetPostsParams, Post, PostsPage, UpdatePostInput } from '../types/post'

const API_URL = 'https://jsonplaceholder.typicode.com/posts'

export async function getPosts(params: GetPostsParams): Promise<PostsPage> {
  const searchParams = new URLSearchParams()

  searchParams.set('_page', String(params.page))
  searchParams.set('_limit', String(params.limit))

  if (params.title) {
    searchParams.set('title_like', params.title)
  }

  if (params.userId) {
    searchParams.set('userId', String(params.userId))
  }

  const response = await fetch(`${API_URL}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Não foi possível carregar os posts')
  }

  const totalHeader = response.headers.get('x-total-count')
  const items = (await response.json()) as Post[]

  return {
    items,
    total: totalHeader ? Number(totalHeader) : items.length,
    page: params.page,
    limit: params.limit,
  }
}

export async function createPost(payload: CreatePostInput): Promise<Post> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Falha ao criar post')
  }

  return (await response.json()) as Post
}

export async function updatePost(payload: UpdatePostInput): Promise<Post> {
  const response = await fetch(`${API_URL}/${payload.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Falha ao atualizar post')
  }

  return (await response.json()) as Post
}

export async function removePost(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Falha ao remover post')
  }
}
