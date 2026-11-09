import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { ErroApi } from "../../services/api";
import { entrar as entrarNoSistema } from "../../services/autenticacao";
import { lerUsuarioLogado } from "../../services/sessao";
import { MENSAGENS } from "../../utils/mensagens";

export function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [parametros] = useSearchParams();
  const navegar = useNavigate();

  // Quem já está logado vai direto para a busca.
  if (lerUsuarioLogado()) {
    return <Navigate to="/busca-familia" replace />;
  }

  // A API devolveu 401 no meio do uso e o sistema mandou para cá.
  const sessaoExpirada = parametros.get("sessao") === "expirada";

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!login.trim() || !senha) {
      setErro(MENSAGENS.login.campoVazio);
      return;
    }

    setErro("");
    setEntrando(true);
    try {
      await entrarNoSistema(login.trim().toLowerCase(), senha);
      navegar("/busca-familia", { replace: true });
    } catch (falha) {
      const senhaErrada = falha instanceof ErroApi && falha.status === 401;
      setErro(senhaErrada ? MENSAGENS.login.erro : MENSAGENS.geral.semConexao);
      setEntrando(false);
    }
  }

  const aviso = erro || (sessaoExpirada ? MENSAGENS.login.sessaoExpirada : "");

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
          {aviso && (
            <p className="aviso aviso--bloqueio campo-seguinte" role="alert">
              {aviso}
            </p>
          )}
          <Button
            type="submit"
            label={entrando ? "Entrando..." : "Entrar"}
            desabilitado={entrando}
            className="botao--formulario"
          />
        </form>
      </Cartao>
    </main>
  );
}
