// Usuário logado e token da API, guardados na sessão do navegador.
// A sessão do navegador some ao fechar a aba, o que protege computadores compartilhados.

export type UsuarioLogado = {
  nome: string;
  login: string;
  perfil: "administrador" | "operador";
};

type Sessao = {
  usuario: UsuarioLogado;
  token: string | null; // null no modo de demonstração, que não usa a API
};

const CHAVE = "sessao";

function lerSessao(): Sessao | null {
  try {
    const salvo = sessionStorage.getItem(CHAVE);
    const sessao = salvo ? (JSON.parse(salvo) as Sessao) : null;
    return sessao?.usuario ? sessao : null;
  } catch {
    return null;
  }
}

export function lerUsuarioLogado(): UsuarioLogado | null {
  return lerSessao()?.usuario ?? null;
}

export function lerToken(): string | null {
  return lerSessao()?.token ?? null;
}

export function salvarSessao(usuario: UsuarioLogado, token: string | null) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify({ usuario, token }));
  } catch {
    // Sem sessionStorage (navegador anônimo bloqueado): segue sem lembrar o login.
  }
}

export function sair() {
  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    // Nada a limpar.
  }
}
