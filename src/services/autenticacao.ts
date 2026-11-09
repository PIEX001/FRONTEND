import { ErroApi, postJson, usarDadosDeExemplo } from "./api";
import { salvarSessao, type UsuarioLogado } from "./sessao";

type RespostaLogin = {
  token: string;
  usuario: UsuarioLogado;
};

// Usuários do modo de demonstração. Só valem com VITE_API_URL vazio, quando os dados também são fictícios.
// Com a API configurada, quem confere usuário e senha é o back-end.
const USUARIOS_EXEMPLO: Array<UsuarioLogado & { senha: string }> = [
  { nome: "Maria", login: "maria", senha: "123", perfil: "operador" },
  { nome: "Administrador", login: "admin", senha: "admin", perfil: "administrador" },
];

// Confere usuário e senha e guarda a sessão. Senha errada vira ErroApi 401.
export async function entrar(login: string, senha: string): Promise<UsuarioLogado> {
  if (!usarDadosDeExemplo) {
    const resposta = await postJson<RespostaLogin>("/auth/login", { login, senha });
    salvarSessao(resposta.usuario, resposta.token);
    return resposta.usuario;
  }

  const encontrado = USUARIOS_EXEMPLO.find((u) => u.login === login && u.senha === senha);
  if (!encontrado) {
    throw new ErroApi(401, "Usuário ou senha inválidos");
  }
  // A senha não vai para a sessão.
  const usuario: UsuarioLogado = { nome: encontrado.nome, login: encontrado.login, perfil: encontrado.perfil };
  salvarSessao(usuario, null);
  return usuario;
}
