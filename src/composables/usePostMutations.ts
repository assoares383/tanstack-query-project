import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { createPost, removePost, updatePost } from '../services/posts'
import type { PostsPage } from '../types/post'

type UsePostMutationsParams = {
  postsQueryKey: Ref<readonly unknown[]>
  appliedTitleFilter: Ref<string>
  appliedUserIdFilter: Ref<number | undefined>
  onCreateSuccess?: () => void
  onUpdateSuccess?: () => void
}

export function usePostMutations(params: UsePostMutationsParams) {
  const queryClient = useQueryClient()

  async function invalidatePostQueries(options?: { postId?: number }) {
    await queryClient.invalidateQueries({ queryKey: ['posts'] })

    if (options?.postId !== undefined) {
      await queryClient.invalidateQueries({ queryKey: ['post', options.postId], exact: true })
    }
  }

  async function safeInvalidatePostQueries(options?: { postId?: number }) {
    try {
      await invalidatePostQueries(options)
    } catch (error) {
      console.error(error)
    }
  }

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: async (createdPost) => {
      queryClient.setQueryData(params.postsQueryKey.value, (oldData: PostsPage | undefined) => {
        if (!oldData) {
          return oldData
        }

        const shouldAddInCurrentPage =
          oldData.page === 1 &&
          (!params.appliedUserIdFilter.value || createdPost.userId === params.appliedUserIdFilter.value) &&
          (!params.appliedTitleFilter.value ||
            createdPost.title.toLowerCase().includes(params.appliedTitleFilter.value.toLowerCase()))

        if (!shouldAddInCurrentPage) {
          return {
            ...oldData,
            total: oldData.total + 1,
          }
        }

        return {
          ...oldData,
          items: [createdPost, ...oldData.items].slice(0, oldData.limit),
          total: oldData.total + 1,
        }
      })

      await safeInvalidatePostQueries()

      params.onCreateSuccess?.()
    },
  })

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: async (updatedPost) => {
      queryClient.setQueryData(params.postsQueryKey.value, (oldData: PostsPage | undefined) => {
        if (!oldData) {
          return oldData
        }

        return {
          ...oldData,
          items: oldData.items.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
        }
      })

      queryClient.setQueryData(['post', updatedPost.id], updatedPost)

      await safeInvalidatePostQueries({ postId: updatedPost.id })

      params.onUpdateSuccess?.()
    },
  })

  const deletePostMutation = useMutation({
    mutationFn: removePost,
    onSuccess: async (_, deletedId) => {
      queryClient.setQueryData(params.postsQueryKey.value, (oldData: PostsPage | undefined) => {
        if (!oldData) {
          return oldData
        }

        return {
          ...oldData,
          items: oldData.items.filter((post) => post.id !== deletedId),
          total: Math.max(oldData.total - 1, 0),
        }
      })

      queryClient.removeQueries({ queryKey: ['post', deletedId] })

      await safeInvalidatePostQueries()
    },
  })

  return {
    createPostMutation,
    updatePostMutation,
    deletePostMutation,
  }
}
