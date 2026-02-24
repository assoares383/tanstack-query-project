# TanStack Query no Vue: guia (CRUD + filtros + paginação)

## 1) Configuração inicial

No `main.ts`, criamos um `QueryClient` e registramos o plugin:

- `QueryClient`: instância central de cache/configuração
- `VueQueryPlugin`: integração do TanStack Query com o app Vue
- `defaultOptions.queries`: comportamentos padrão para todas as queries

No projeto atual:

- `staleTime: 60s`: dados ficam "frescos" por 1 minuto
- `refetchOnWindowFocus: false`: evita refetch automático ao voltar para a aba
- `retry: 1`: tenta novamente 1 vez em caso de erro

## 2) Estrutura do projeto base

- `src/main.ts`: configuração global do TanStack Query
- `src/services/posts.ts`: funções HTTP de CRUD
- `src/types/post.ts`: contratos de dados
- `src/App.vue`: UI com filtros, paginação, listagem e formulário

Essa divisão ajuda a manter a UI separada da lógica de acesso à API.

## 3) Query (leitura de dados)

A listagem usa `useQuery` com:

- `queryKey` com parâmetros (`page`, `limit`, `title`, `userId`)
- `queryFn`: função assíncrona que busca os dados
- `placeholderData: keepPreviousData`: mantém os dados anteriores durante troca de página/filtro

Fluxo:

1. Primeira renderização dispara a requisição
2. Resultado é salvo em cache pela chave específica da combinação atual de filtros/paginação
3. Componentes que usam a mesma chave compartilham esse cache
4. `isLoading`, `isFetching`, `isError` controlam o estado da UI

## 4) CRUD com mutation (escrita de dados)

O projeto possui 3 mutations:

- `createPost` (`POST`)
- `updatePost` (`PUT`)
- `removePost` (`DELETE`)

No `onSuccess`, usamos:

- `queryClient.setQueryData(...)`

Isso atualiza o cache da página atual imediatamente, deixando a interface responsiva sem esperar novo fetch.

## 5) Filtros e paginação

- Filtro por título: `title_like`
- Filtro por usuário: `userId`
- Paginação: `_page` e `_limit`
- Total de itens via header `x-total-count`

Com isso, a UI calcula total de páginas e controla navegação (`Anterior` / `Próxima`).

## 6) Conceitos-chave

- **Query Key**: chave única do cache
- **Stale Time**: tempo em que os dados são considerados frescos
- **setQueryData**: atualiza cache local após mutation
- **Refetch manual**: atualização sob demanda (`postsQuery.refetch()`)

## 7) Quando usar TanStack Query

Use quando você precisa:

- Cache de dados remotos
- Controle de loading/erro por requisição
- Sincronização automática após escrita
- Menos código manual para estado assíncrono

## 8) Observação sobre a API de exemplo

O projeto usa `jsonplaceholder.typicode.com`, que é ótimo para testes, mas não persiste alterações de forma real para leituras posteriores. Por isso, o exemplo atualiza o cache local para demonstrar o comportamento completo de CRUD na interface.

## 9) Próximos passos sugeridos

- Criar hooks reutilizáveis (`usePostsQuery`, `useCreatePostMutation`)
- Migrar para uma API real com persistência
- Adicionar validação de formulário
