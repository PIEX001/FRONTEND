# Casa São Francisco de Assis: front-end

Sistema de entrega de cestas básicas, feito no Projeto de Extensão. React, TypeScript e Vite.

## Rodar no computador

```bash
npm install
npm run dev
```

Abre em http://localhost:5173.

## API

Copie `.env.example` para `.env` e preencha `VITE_API_URL` com o endereço da API .NET.
Com `VITE_API_URL` vazio, as telas usam dados de exemplo e dá para testar tudo sem o back-end.

## Usuários de teste

| Usuário | Senha | Perfil | Telas |
| --- | --- | --- | --- |
| maria | 123 | operador | Busca e registro de entrega |
| admin | admin | administrador | Todas, pelo menu do topo |

O login ainda é local. Quando a API de autenticação existir, ele passa a usar token.

## Telas

- `/login`: entrada no sistema
- `/busca-familia`: busca de família e situação da cesta do mês
- `/entrega?familia=ID`: registro de entrega
- `/familias`, `/membros`: cadastros (administrador)
- `/estoque`: entradas e saídas de cestas (administrador)
- `/relatorios`: relatório mensal de entregas, com impressão em PDF (administrador)

## Publicar na Vercel

- Framework: Vite. Build: `npm run build`. Saída: `dist`.
- Em Environment Variables, criar `VITE_API_URL` com o endereço da API no Render. Sem ela, o site sobe com os dados de exemplo.
- O `vercel.json` manda todas as rotas para o `index.html`, assim recarregar a página em `/entrega` ou `/relatorios` não dá 404.
