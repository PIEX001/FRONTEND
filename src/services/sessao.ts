// Usuário logado, guardado na sessão do navegador até o login usar token.

export type UsuarioLogado = {
  nome: string;
  login: string;
  perfil: "administrador" | "operador";
};

const CHAVE = "usuarioLogado";

export function lerUsuarioLogado(): UsuarioLogado | null {
  try {
    const salvo = sessionStorage.getItem(CHAVE);
    return salvo ? (JSON.parse(salvo) as UsuarioLogado) : null;
  } catch {
    return null;
  }
}

export function salvarUsuarioLogado(usuario: UsuarioLogado) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(usuario));
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
