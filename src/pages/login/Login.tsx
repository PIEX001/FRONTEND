import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { lerUsuarioLogado, salvarUsuarioLogado, type UsuarioLogado } from "../../services/sessao";
import { MENSAGENS } from "../../utils/mensagens";

const usuariosFicticios: Array<UsuarioLogado & { senha: string }> = [
  { nome: "Maria", login: "maria", senha: "123", perfil: "operador" },
  { nome: "Administrador", login: "admin", senha: "admin", perfil: "administrador" },
];

export function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navegar = useNavigate();

  // Quem já está logado vai direto para a busca.
  if (lerUsuarioLogado()) {
    return <Navigate to="/busca-familia" replace />;
  }

  function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!login.trim() || !senha) {
      setErro(MENSAGENS.login.campoVazio);
      return;
    }

    const usuario = usuariosFicticios.find(
      (u) => u.login === login.trim().toLowerCase() && u.senha === senha,
    );
    if (!usuario) {
      setErro(MENSAGENS.login.erro);
      return;
    }

    // A senha não vai para a sessão.
    salvarUsuarioLogado({ nome: usuario.nome, login: usuario.login, perfil: usuario.perfil });
    navegar("/busca-familia");
  }

  return (
    <main className="conteudo conteudo--estreito login">
      <img className="login__logo" src="/logo.png" alt="" />
      <h1>Entrar</h1>
      <p className="subtitulo">Acesse o sistema de gestão da Casa São Francisco de Assis.</p>
      <Cartao>
        <form onSubmit={entrar} noValidate>
          <label htmlFor="login">Usuário</label>
          <input
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Ex.: maria"
            autoComplete="username"
            autoCapitalize="none"
          />
          <label htmlFor="senha" className="campo-seguinte">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
          />
          {erro && (
            <p className="aviso aviso--bloqueio campo-seguinte" role="alert">
              {erro}
            </p>
          )}
          <Button type="submit" label="Entrar" className="botao--formulario" />
        </form>
      </Cartao>
    </main>
  );
}
