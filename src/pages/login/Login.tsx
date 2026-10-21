import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { MENSAGENS } from "../../utils/mensagens";

export type UsuarioLogado = {
  nome: string;
  login: string;
  perfil: "administrador" | "operador";
};

const usuariosFicticios: Array<UsuarioLogado & { senha: string }> = [
  { nome: "Maria", login: "maria", senha: "123", perfil: "operador" },
  { nome: "Administrador", login: "admin", senha: "admin", perfil: "administrador" },
];

export function lerUsuarioLogado(): UsuarioLogado | null {
  const salvo = sessionStorage.getItem("usuarioLogado");
  return salvo ? (JSON.parse(salvo) as UsuarioLogado) : null;
}

export function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navegar = useNavigate();

  function entrar(evento?: React.FormEvent) {
  evento?.preventDefault();
  const usuario = usuariosFicticios.find(
    (u) => u.login === login.trim() && u.senha === senha
  );

if (!login.trim() || !senha) {
  setErro(MENSAGENS.login.campoVazio);
  return;
}

  if (!usuario) {
  setErro(MENSAGENS.login.erro);
  return;
  }
  sessionStorage.setItem("usuarioLogado", JSON.stringify(usuario));
  navegar("/busca-familia");
}

  return (
    <main className="conteudo conteudo--estreito">
      <h1>Entrar</h1>
      <p className="subtitulo">Acesse o sistema de gestão da Casa São Francisco de Assis.</p>
      <Cartao>
        <form onSubmit={entrar}>
          <label htmlFor="login">Usuário</label>
          <input
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Ex.: maria"
          />
          <label htmlFor="senha" style={{ marginTop: 14 }}>Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
          />
          {erro && (
            <p className="aviso aviso--bloqueio" style={{ marginTop: 14 }}>
              {erro}
            </p>
          )}
          <Button label="Entrar" onClick={() => entrar()} />
        </form>
      </Cartao>
    </main>
  );
}