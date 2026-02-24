<script setup lang="ts">
const props = defineProps<{
  title: string
  body: string
  isPending: boolean
  canSubmit: boolean
}>()

const emit = defineEmits<{
  (event: 'update-title', value: string): void
  (event: 'update-body', value: string): void
  (event: 'submit'): void
  (event: 'cancel'): void
}>()

function handleTitleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update-title', target.value)
}

function handleBodyInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update-body', target.value)
}
</script>

<template>
  <input :value="props.title" type="text" placeholder="Título" @input="handleTitleInput" />
  <textarea :value="props.body" rows="3" placeholder="Conteúdo" @input="handleBodyInput"></textarea>

  <div class="row-actions">
    <button @click="emit('submit')" :disabled="props.isPending || !props.canSubmit">
      {{ props.isPending ? 'Salvando...' : 'Salvar edição' }}
    </button>
    <button @click="emit('cancel')">Cancelar</button>
  </div>
</template>
