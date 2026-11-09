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
  primeiroAcesso?: boolean; // obriga a trocar a senha antes de usar o sistema
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

function gravar(sessao: Sessao) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(sessao));
  } catch {
    // Sem sessionStorage (navegador anônimo bloqueado): segue sem lembrar o login.
  }
}

export function lerUsuarioLogado(): UsuarioLogado | null {
  return lerSessao()?.usuario ?? null;
}

export function lerToken(): string | null {
  return lerSessao()?.token ?? null;
}

export function precisaTrocarSenha(): boolean {
  return lerSessao()?.primeiroAcesso === true;
}

export function salvarSessao(usuario: UsuarioLogado, token: string | null, primeiroAcesso = false) {
  gravar({ usuario, token, primeiroAcesso });
}

// Depois da troca de senha o usuário segue logado com o mesmo token.
export function marcarSenhaTrocada() {
  const sessao = lerSessao();
  if (sessao) gravar({ ...sessao, primeiroAcesso: false });
}

export function sair() {
  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    // Nada a limpar.
  }
}
