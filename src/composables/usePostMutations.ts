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

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (createdPost) => {
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

      params.onCreateSuccess?.()
    },
  })

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(params.postsQueryKey.value, (oldData: PostsPage | undefined) => {
        if (!oldData) {
          return oldData
        }

        return {
          ...oldData,
          items: oldData.items.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
        }
      })

      params.onUpdateSuccess?.()
    },
  })

  const deletePostMutation = useMutation({
    mutationFn: removePost,
    onSuccess: (_, deletedId) => {
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
    },
  })

  return {
    createPostMutation,
    updatePostMutation,
    deletePostMutation,
  }
}
