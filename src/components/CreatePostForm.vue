<script setup lang="ts">
const props = defineProps<{
  userId: number
  title: string
  body: string
  isPending: boolean
  canSubmit: boolean
}>()

const emit = defineEmits<{
  (event: 'update-user-id', value: number): void
  (event: 'update-title', value: string): void
  (event: 'update-body', value: string): void
  (event: 'submit'): void
}>()

function handleUserIdInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update-user-id', Number(target.value))
}

function handleTitleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update-title', target.value)
}

function handleBodyInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update-body', target.value)
}

function handleSubmit() {
  emit('submit')
}
</script>

<template>
  <input :value="props.userId" type="number" min="1" placeholder="userId" @input="handleUserIdInput" />
  <input :value="props.title" type="text" placeholder="Título" @input="handleTitleInput" />
  <textarea :value="props.body" rows="4" placeholder="Conteúdo" @input="handleBodyInput"></textarea>

  <button class="bg-app-primary text-white hover:bg-app-primary-hover" @click="handleSubmit" :disabled="props.isPending || !props.canSubmit">
    {{ props.isPending ? 'Salvando...' : 'Criar post' }}
  </button>
</template>
