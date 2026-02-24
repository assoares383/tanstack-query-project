# TanStack Query com Vue 3 + Vite

<p align="center">
	<img src="https://miro.medium.com/1*PpLe5jXUvSY_GdiJt6mMAA.png" alt="TanStack Query" width="700" />
</p>

Projeto base em Vue 3 + TypeScript com Vite, configurado com `@tanstack/vue-query`.

## Requisitos

- Node.js 20+
- npm 10+

## Como executar

```bash
npm install
npm run dev
```

Para build de produção:

```bash
npm run build
npm run preview
```

## Testes

```bash
npm run test
npm run test:watch
npm run coverage
```

O projeto está configurado com Vitest + coverage V8 e limiar mínimo global de 90%.

## O que foi implementado

- Configuração do `QueryClient` no `src/main.ts`
- Query de listagem de posts com `useQuery` + `keepPreviousData`
- Exibição de estados: `isLoading`, `isFetching`, `isError`
- `refetch` manual
- CRUD completo com `useMutation` (create, update, delete)
- Filtros por título e `userId`
- Paginação com `_page` e `_limit`
- Atualização de cache local com `queryClient.setQueryData`
- Devtools habilitado em desenvolvimento com `@tanstack/vue-query-devtools`
- Tailwind CSS configurado com tema customizado (cores e sombras)
- Vitest configurado com `jsdom`, setup de testes e relatórios de coverage

## Arquivos principais

- `src/main.ts`: registra o `VueQueryPlugin` e configura opções padrão das queries
- `src/App.vue`: camada de apresentação (UI + eventos)
- `src/components/CreatePostForm.vue`: formulário de criação de posts
- `src/components/EditPostForm.vue`: formulário de edição de posts
- `src/composables/usePostsQuery.ts`: query de listagem + filtros + paginação
- `src/composables/usePostMutations.ts`: mutations de create/update/delete e atualização de cache
- `src/services/posts.ts`: camada de API para listar/criar/editar/remover posts
- `src/types/post.ts`: tipos de domínio (`Post`, payloads e resposta paginada)
- `docs/tanstack-query-vue.md`: documentação explicando os conceitos e fluxo
- `tailwind.config.cjs`: tema do Tailwind
- `vite.config.ts`: configuração do Vitest e coverage
- `tests/`: testes unitários de services, composables e componentes

## API usada no exemplo

O projeto usa `https://jsonplaceholder.typicode.com/posts` para simular leitura e criação de dados.

