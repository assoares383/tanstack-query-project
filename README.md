# TanStack Query com Vue 3 + Vite

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

## Arquivos principais

- `src/main.ts`: registra o `VueQueryPlugin` e configura opções padrão das queries
- `src/App.vue`: tela de CRUD, filtros, paginação e estados da query
- `src/services/posts.ts`: camada de API para listar/criar/editar/remover posts
- `src/types/post.ts`: tipos de domínio (`Post`, payloads e resposta paginada)
- `docs/tanstack-query-vue.md`: documentação explicando os conceitos e fluxo

## API usada no exemplo

O projeto usa `https://jsonplaceholder.typicode.com/posts` para simular leitura e criação de dados.

