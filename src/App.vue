<script setup lang="ts">
import { computed, ref } from 'vue'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import CreatePostForm from './components/CreatePostForm.vue'
import EditPostForm from './components/EditPostForm.vue'
import { usePostMutations } from './composables/usePostMutations'
import { usePostsQuery } from './composables/usePostsQuery'
import type { CreatePostInput, Post, UpdatePostInput } from './types/post'

const isDev = import.meta.env.DEV

const {
  page,
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
} = usePostsQuery()

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

const { createPostMutation, updatePostMutation, deletePostMutation } = usePostMutations({
  postsQueryKey,
  appliedTitleFilter,
  appliedUserIdFilter,
  onCreateSuccess: () => {
    createForm.value = { userId: 1, title: '', body: '' }
  },
  onUpdateSuccess: () => {
    editingPostId.value = null
  },
})

const hasFormValues = computed(() => {
  return createForm.value.title.trim().length > 0 && createForm.value.body.trim().length > 0
})

const hasEditValues = computed(() => {
  return editForm.value.title.trim().length > 0 && editForm.value.body.trim().length > 0
})

function handleCreatePost() {
  if (!hasFormValues.value) {
    return
  }

  createPostMutation.mutate(createForm.value)
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
</script>

<template>
  <main class="container">
    <h1 class="mb-2 text-3xl font-bold">TanStack Query + Vue</h1>
    <p class="subtitle">Estrutura base com CRUD, filtros e paginação usando TanStack Query no Vue.</p>

    <section class="card">
      <h2 class="text-xl font-semibold">1) Filtros e paginação</h2>

      <div class="filters-grid">
        <input v-model="titleFilterInput" type="text" placeholder="Filtrar por título" />
        <input v-model.number="userIdFilterInput" type="number" min="1" placeholder="Filtrar por userId" />
      </div>

      <div class="row-actions">
        <button class="bg-app-primary text-white hover:bg-app-primary-hover" @click="handleApplyFilters">Aplicar filtros</button>
        <button @click="handleClearFilters">Limpar filtros</button>
      </div>

      <div class="pagination">
        <button @click="handlePreviousPage" :disabled="!canGoPrevious">Anterior</button>
        <span>Página {{ page }} de {{ totalPages }}</span>
        <button @click="handleNextPage" :disabled="!canGoNext">Próxima</button>
      </div>
    </section>

    <section class="card">
      <h2 class="text-xl font-semibold">2) Listagem com query</h2>

      <div class="status-grid">
        <span><strong>isLoading:</strong> {{ postsQuery.isLoading.value }}</span>
        <span><strong>isFetching:</strong> {{ postsQuery.isFetching.value }}</span>
        <span><strong>isError:</strong> {{ postsQuery.isError.value }}</span>
        <span><strong>última atualização:</strong> {{ formattedLastUpdate }}</span>
        <span><strong>total:</strong> {{ postsQuery.data.value?.total ?? 0 }}</span>
      </div>

      <button class="bg-app-primary text-white hover:bg-app-primary-hover" @click="postsQuery.refetch()" :disabled="postsQuery.isFetching.value">
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
            <EditPostForm
              :title="editForm.title"
              :body="editForm.body"
              :is-pending="updatePostMutation.isPending.value"
              :can-submit="hasEditValues"
              @update-title="editForm.title = $event"
              @update-body="editForm.body = $event"
              @submit="handleUpdatePost(post.id)"
              @cancel="cancelEdit"
            />
          </template>

          <template v-else>
            <h3 class="text-base font-semibold">{{ post.title }}</h3>
            <p class="text-sm text-app-muted">{{ post.body }}</p>

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
      <h2 class="text-xl font-semibold">3) Criação de post</h2>
      <p class="hint">Neste exemplo, create/update/delete atualizam o cache local da página atual.</p>

      <CreatePostForm
        :user-id="createForm.userId"
        :title="createForm.title"
        :body="createForm.body"
        :is-pending="createPostMutation.isPending.value"
        :can-submit="hasFormValues"
        @update-user-id="createForm.userId = $event"
        @update-title="createForm.title = $event"
        @update-body="createForm.body = $event"
        @submit="handleCreatePost"
      />

      <p v-if="createPostMutation.isError.value" class="error">
        {{ createPostMutation.error.value?.message }}
      </p>
      <p v-if="createPostMutation.isSuccess.value" class="success">Post criado com sucesso.</p>
    </section>
  </main>

  <VueQueryDevtools v-if="isDev" />
</template>
