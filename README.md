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

Com a API configurada, o login é pelo **e-mail** (`POST /User/login`), e o token fica na sessão do navegador
(some ao fechar a aba). Todas as chamadas mandam `Authorization: Bearer <token>`.
O cargo do usuário vira o perfil do front: Admin, Developer e Assistant usam todas as telas; Collaborator e
Pharmaceutical ficam com busca e entrega. A API confere cada permissão de novo.

- **Primeiro acesso:** a API avisa (`isFirstLogin`) e o front obriga a trocar a senha em `/trocar-senha`.
- **Sessão vencida:** se a API responder 401, o sistema volta para o login com aviso.
- **Sair** encerra o token também na API.
- **Servidor dormindo:** o Render gratuito leva até 1 minuto para acordar. O login já chama `/health` ao abrir,
  e qualquer chamada que passa de 4 segundos mostra a faixa "Conectando ao servidor".

No modo de demonstração, valem só estes usuários fictícios:

| Usuário | Senha | Perfil | Telas |
| --- | --- | --- | --- |
| maria | 123 | operador | Busca e registro de entrega |
| admin | admin | administrador | Todas, pelo menu do topo |

## Rotas da API usadas

| Tela | Rotas |
| --- | --- |
| Login | `POST /User/login`, `GET /User/user/about`, `PATCH /User/user/password`, `POST /User/logout` |
| Busca | `GET /family?term=`, `GET /delivery/summary`, `GET /class` |
| Entrega | `GET /family/{id}`, `GET /delivery/family/{id}`, `POST /delivery` |
| Estoque | `GET /stock/balance`, `GET /stock/movement?basketTypeId=`, `POST /stock/movement/` |
| Relatórios | `GET /delivery/report?month=&deliveryClassId=` |
| Cadastros | `POST /family/`, `GET /{id}/information`, `POST /family/{id}/members` |
| Equipe | `POST /User/user/create` (só administrador; senha inicial gerada pelo front, troca obrigatória no primeiro acesso) |

A conversão do formato da API para o das telas fica nos arquivos de `src/services`.

## Telas

- `/login`: entrada no sistema
- `/trocar-senha`: troca de senha (obrigatória no primeiro acesso)
- `/busca-familia`: busca de família e situação da cesta do mês
- `/entrega?familia=ID`: registro de entrega
- `/familias`, `/membros`: cadastros (administrador)
- `/estoque`: entradas e saídas de cestas (administrador)
- `/relatorios`: relatório mensal de entregas, com impressão em PDF (administrador)
- `/equipe`: criar login de funcionários e voluntários (administrador)

## Publicar na Vercel

- Framework: Vite. Build: `npm run build`. Saída: `dist`.
- Em Environment Variables, criar `VITE_API_URL` com o endereço da API no Render, começando com `https://`. Sem ela, o site sobe em modo de demonstração.
- Depois de criar ou mudar a variável, é preciso fazer Redeploy: o Vite coloca o valor no código na hora do build.
- A API precisa liberar CORS para o domínio do site na Vercel.
- O `vercel.json` manda todas as rotas para o `index.html`, assim recarregar a página em `/entrega` ou `/relatorios` não dá 404.
