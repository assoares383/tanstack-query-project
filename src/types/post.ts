export type Post = {
  id: number
  userId: number
  title: string
  body: string
}

export type GetPostsParams = {
  page: number
  limit: number
  title?: string
  userId?: number
}

export type PostsPage = {
  items: Post[]
  total: number
  page: number
  limit: number
}

export type CreatePostInput = {
  userId: number
  title: string
  body: string
}

export type UpdatePostInput = {
  id: number
  userId: number
  title: string
  body: string
}
