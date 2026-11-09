import { ErroApi, getJson, patchJson, postJson, usarDadosDeExemplo } from "./api";
import { lerToken, marcarSenhaTrocada, sair, salvarSessao, type UsuarioLogado } from "./sessao";

// ---------------------------------------------------------------------------
// Formato da API .NET (UserController)

type RespostaLogin = {
  token: string;
  isFirstLogin: boolean;
};

// Cargo do usuário no back (ETypeDesignation).
const CARGO = { Admin: 1, Developer: 2, Assistant: 3, Pharmaceutical: 4, Collaborator: 5 } as const;

type UsuarioDaApi = {
  name: string;
  email: string;
  asssigned: number; // grafia do back
};

// Administrador, desenvolvedor e assistente social usam todas as telas.
// Colaborador e farmacêutico ficam com busca e entrega. A API confere cada permissão de novo.
function perfilDoCargo(cargo: number): UsuarioLogado["perfil"] {
  return cargo === CARGO.Admin || cargo === CARGO.Developer || cargo === CARGO.Assistant ? "administrador" : "operador";
}

// ---------------------------------------------------------------------------

// Usuários do modo de demonstração. Só valem com VITE_API_URL vazio, quando os dados também são fictícios.
// Com a API configurada, quem confere usuário e senha é o back-end.
const USUARIOS_EXEMPLO: Array<UsuarioLogado & { senha: string }> = [
  { nome: "Maria", login: "maria", senha: "123", perfil: "operador" },
  { nome: "Administrador", login: "admin", senha: "admin", perfil: "administrador" },
];

export type ResultadoLogin = {
  usuario: UsuarioLogado;
  primeiroAcesso: boolean; // precisa trocar a senha antes de continuar
};

// Confere e-mail (ou usuário, na demonstração) e senha e guarda a sessão. Senha errada vira ErroApi 401.
export async function entrar(login: string, senha: string): Promise<ResultadoLogin> {
  if (!usarDadosDeExemplo) {
    let resposta: RespostaLogin;
    try {
      resposta = await postJson<RespostaLogin>("/User/login", { email: login, password: senha });
    } catch (falha) {
      // A API responde 422 para e-mail ou senha errados.
      if (falha instanceof ErroApi && (falha.status === 422 || falha.status === 400 || falha.status === 404)) {
        throw new ErroApi(401, "E-mail ou senha inválidos");
      }
      throw falha;
    }

    const dados = await getJson<UsuarioDaApi>("/User/user/about", resposta.token);
    const usuario: UsuarioLogado = { nome: dados.name, login: dados.email, perfil: perfilDoCargo(dados.asssigned) };
    salvarSessao(usuario, resposta.token, resposta.isFirstLogin);
    return { usuario, primeiroAcesso: resposta.isFirstLogin };
  }

  const encontrado = USUARIOS_EXEMPLO.find((u) => u.login === login && u.senha === senha);
  if (!encontrado) {
    throw new ErroApi(401, "Usuário ou senha inválidos");
  }
  // A senha não vai para a sessão.
  const usuario: UsuarioLogado = { nome: encontrado.nome, login: encontrado.login, perfil: encontrado.perfil };
  salvarSessao(usuario, null);
  return { usuario, primeiroAcesso: false };
}

// Mesmas regras do back (ChangePassDtoValidator). Devolve o que falta, ou null se a senha serve.
export function problemaNaSenha(senha: string): string | null {
  if (senha.length < 8) return "pelo menos 8 caracteres";
  if (!/[A-Z]/.test(senha)) return "uma letra maiúscula";
  if (!/[a-z]/.test(senha)) return "uma letra minúscula";
  if (!/[0-9]/.test(senha)) return "um número";
  if (!/[^a-zA-Z0-9]/.test(senha)) return "um símbolo, como @ ou #";
  return null;
}

// Troca a senha do usuário logado. Senha atual errada vira ErroApi 422.
export async function trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  if (!usarDadosDeExemplo) {
    await patchJson<unknown>("/User/user/password", {
      oldPass: senhaAtual,
      newPass: novaSenha,
      passConfirmed: novaSenha,
    });
  }
  marcarSenhaTrocada();
}

// Encerra a sessão também na API, para o token não valer mais.
export async function sairDoSistema(): Promise<void> {
  if (!usarDadosDeExemplo && lerToken()) {
    try {
      await postJson<unknown>("/User/logout", {});
    } catch {
      // Sem conexão ou token já vencido: a sessão local é apagada do mesmo jeito.
    }
  }
  sair();
}
