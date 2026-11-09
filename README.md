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
Com `VITE_API_URL` vazio, o sistema entra em modo de demonstração: as telas usam dados de exemplo,
nada fica salvo e uma faixa amarela no topo avisa isso. Dá para testar tudo sem o back-end.

## Login

Com a API configurada, o login chama `POST /auth/login` e guarda o token na sessão do navegador
(some ao fechar a aba). Todas as chamadas mandam `Authorization: Bearer <token>`.
Se a API responder 401 no meio do uso, o sistema sai e volta para o login com o aviso de sessão terminada.
O usuário é enviado sem espaços e em minúsculas.

No modo de demonstração, valem só estes usuários fictícios:

| Usuário | Senha | Perfil | Telas |
| --- | --- | --- | --- |
| maria | 123 | operador | Busca e registro de entrega |
| admin | admin | administrador | Todas, pelo menu do topo |

Com a API configurada, eles deixam de funcionar: quem confere usuário e senha é o back-end.

## Telas

- `/login`: entrada no sistema
- `/busca-familia`: busca de família e situação da cesta do mês
- `/entrega?familia=ID`: registro de entrega
- `/familias`, `/membros`: cadastros (administrador)
- `/estoque`: entradas e saídas de cestas (administrador)
- `/relatorios`: relatório mensal de entregas, com impressão em PDF (administrador)

## Publicar na Vercel

- Framework: Vite. Build: `npm run build`. Saída: `dist`.
- Em Environment Variables, criar `VITE_API_URL` com o endereço da API no Render, começando com `https://`. Sem ela, o site sobe em modo de demonstração.
- Depois de criar ou mudar a variável, é preciso fazer Redeploy: o Vite coloca o valor no código na hora do build.
- A API precisa liberar CORS para o domínio do site na Vercel.
- O `vercel.json` manda todas as rotas para o `index.html`, assim recarregar a página em `/entrega` ou `/relatorios` não dá 404.
