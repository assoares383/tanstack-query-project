<script setup lang="ts">
import { computed, ref } from 'vue'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { createPost, getPosts, removePost, updatePost } from './services/posts'
import type { CreatePostInput, Post, PostsPage, UpdatePostInput } from './types/post'

const isDev = import.meta.env.DEV

const queryClient = useQueryClient()
const page = ref(1)
const limit = ref(5)

const titleFilterInput = ref('')
const userIdFilterInput = ref<number | null>(null)
const appliedTitleFilter = ref('')
const appliedUserIdFilter = ref<number | undefined>(undefined)

const createForm = ref<CreatePostInput>({
  userId: 1,
  title: '',
  body: '',
})

const editingPostId = ref<number | null>(null)
const editForm = ref<Omit<UpdatePostInput, 'id'>>({
  userId: 1,
  title: '',
  body: '',
})

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

const createPostMutation = useMutation({
  mutationFn: createPost,
  onSuccess: (createdPost) => {
    queryClient.setQueryData(postsQueryKey.value, (oldData: PostsPage | undefined) => {
      if (!oldData) {
        return oldData
      }

      const shouldAddInCurrentPage =
        oldData.page === 1 &&
        (!appliedUserIdFilter.value || createdPost.userId === appliedUserIdFilter.value) &&
        (!appliedTitleFilter.value ||
          createdPost.title.toLowerCase().includes(appliedTitleFilter.value.toLowerCase()))

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

    createForm.value = { userId: 1, title: '', body: '' }
  },
})

const updatePostMutation = useMutation({
  mutationFn: updatePost,
  onSuccess: (updatedPost) => {
    queryClient.setQueryData(postsQueryKey.value, (oldData: PostsPage | undefined) => {
      if (!oldData) {
        return oldData
      }

      return {
        ...oldData,
        items: oldData.items.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
      }
    })

    editingPostId.value = null
  },
})

const deletePostMutation = useMutation({
  mutationFn: removePost,
  onSuccess: (_, deletedId) => {
    queryClient.setQueryData(postsQueryKey.value, (oldData: PostsPage | undefined) => {
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

const hasFormValues = computed(() => {
  return createForm.value.title.trim().length > 0 && createForm.value.body.trim().length > 0
})

const hasEditValues = computed(() => {
  return editForm.value.title.trim().length > 0 && editForm.value.body.trim().length > 0
})

const totalPages = computed(() => {
  const total = postsQuery.data.value?.total ?? 0

  return Math.max(1, Math.ceil(total / limit.value))
})

const canGoPrevious = computed(() => page.value > 1)
const canGoNext = computed(() => page.value < totalPages.value)
const currentItems = computed(() => postsQuery.data.value?.items ?? [])

function handleCreatePost() {
  if (!hasFormValues.value) {
    return
  }

  createPostMutation.mutate(createForm.value)
}

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

function startEdit(post: Post) {
  editingPostId.value = post.id
  editForm.value = {
    userId: post.userId,
    title: post.title,
    body: post.body,
  }
}

function cancelEdit() {
  editingPostId.value = null
}

function handleUpdatePost(id: number) {
  if (!hasEditValues.value) {
    return
  }

  updatePostMutation.mutate({
    id,
    ...editForm.value,
  })
}

function handleDeletePost(id: number) {
  deletePostMutation.mutate(id)
}

const formattedLastUpdate = computed(() => {
  if (!postsQuery.dataUpdatedAt.value) {
    return 'Ainda não atualizado'
  }

  return new Date(postsQuery.dataUpdatedAt.value).toLocaleTimeString('pt-BR')
})
</script>

<template>
  <main class="container">
    <h1>TanStack Query + Vue</h1>
    <p class="subtitle">Estrutura base com CRUD, filtros e paginação usando TanStack Query no Vue.</p>

    <section class="card">
      <h2>1) Filtros e paginação</h2>

      <div class="filters-grid">
        <input v-model="titleFilterInput" type="text" placeholder="Filtrar por título" />
        <input v-model.number="userIdFilterInput" type="number" min="1" placeholder="Filtrar por userId" />
      </div>

      <div class="row-actions">
        <button @click="handleApplyFilters">Aplicar filtros</button>
        <button @click="handleClearFilters">Limpar filtros</button>
      </div>

      <div class="pagination">
        <button @click="handlePreviousPage" :disabled="!canGoPrevious">Anterior</button>
        <span>Página {{ page }} de {{ totalPages }}</span>
        <button @click="handleNextPage" :disabled="!canGoNext">Próxima</button>
      </div>
    </section>

    <section class="card">
      <h2>2) Listagem com query</h2>

      <div class="status-grid">
        <span><strong>isLoading:</strong> {{ postsQuery.isLoading.value }}</span>
        <span><strong>isFetching:</strong> {{ postsQuery.isFetching.value }}</span>
        <span><strong>isError:</strong> {{ postsQuery.isError.value }}</span>
        <span><strong>última atualização:</strong> {{ formattedLastUpdate }}</span>
        <span><strong>total:</strong> {{ postsQuery.data.value?.total ?? 0 }}</span>
      </div>

      <button @click="postsQuery.refetch()" :disabled="postsQuery.isFetching.value">
        {{ postsQuery.isFetching.value ? 'Atualizando...' : 'Refetch manual' }}
      </button>

      <p v-if="postsQuery.isError.value" class="error">
        {{ postsQuery.error.value?.message }}
      </p>

      <ul v-else class="list">
        <li v-for="post in currentItems" :key="post.id">
          <div class="list-head">
            <small>#{{ post.id }} • user {{ post.userId }}</small>
          </div>

          <template v-if="editingPostId === post.id">
            <input v-model="editForm.title" type="text" placeholder="Título" />
            <textarea v-model="editForm.body" rows="3" placeholder="Conteúdo"></textarea>

            <div class="row-actions">
              <button @click="handleUpdatePost(post.id)" :disabled="updatePostMutation.isPending.value || !hasEditValues">
                {{ updatePostMutation.isPending.value ? 'Salvando...' : 'Salvar edição' }}
              </button>
              <button @click="cancelEdit">Cancelar</button>
            </div>
          </template>

          <template v-else>
            <h3>{{ post.title }}</h3>
            <p>{{ post.body }}</p>

            <div class="row-actions">
              <button @click="startEdit(post)">Editar</button>
              <button @click="handleDeletePost(post.id)" :disabled="deletePostMutation.isPending.value">
                {{ deletePostMutation.isPending.value ? 'Removendo...' : 'Excluir' }}
              </button>
            </div>
          </template>
        </li>
      </ul>
    </section>

    <section class="card">
      <h2>3) Criação de post</h2>
      <p class="hint">Neste exemplo, create/update/delete atualizam o cache local da página atual.</p>

      <input v-model.number="createForm.userId" type="number" min="1" placeholder="userId" />
      <input v-model="createForm.title" type="text" placeholder="Título" />
      <textarea v-model="createForm.body" rows="4" placeholder="Conteúdo"></textarea>

      <button @click="handleCreatePost" :disabled="createPostMutation.isPending.value || !hasFormValues">
        {{ createPostMutation.isPending.value ? 'Salvando...' : 'Criar post' }}
      </button>

      <p v-if="createPostMutation.isError.value" class="error">
        {{ createPostMutation.error.value?.message }}
      </p>
      <p v-if="createPostMutation.isSuccess.value" class="success">Post criado com sucesso.</p>
    </section>
  </main>

  <VueQueryDevtools v-if="isDev" />
</template>
