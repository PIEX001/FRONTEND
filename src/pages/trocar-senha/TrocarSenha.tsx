import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { ErroApi } from "../../services/api";
import { problemaNaSenha, trocarSenha } from "../../services/autenticacao";
import { lerUsuarioLogado, precisaTrocarSenha } from "../../services/sessao";
import { MENSAGENS } from "../../utils/mensagens";

// Primeiro acesso: a senha inicial foi criada por outra pessoa, então precisa ser trocada.
// Também serve para trocar a senha depois, pelo endereço /trocar-senha.
export function TrocarSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const navegar = useNavigate();
  const usuario = lerUsuarioLogado();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const primeiroAcesso = precisaTrocarSenha();

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!senhaAtual || !novaSenha || !confirmacao) {
      setErro(MENSAGENS.login.campoVazio);
      return;
    }
    const falta = problemaNaSenha(novaSenha);
    if (falta) {
      setErro(`A nova senha precisa ter ${falta}.`);
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro(MENSAGENS.senha.naoConfere);
      return;
    }
    if (novaSenha === senhaAtual) {
      setErro(MENSAGENS.senha.igualAtual);
      return;
    }

    setErro("");
    setSalvando(true);
    try {
      await trocarSenha(senhaAtual, novaSenha);
      navegar("/busca-familia", { replace: true });
    } catch (falha) {
      const senhaAtualErrada = falha instanceof ErroApi && (falha.status === 422 || falha.status === 400);
      setErro(senhaAtualErrada ? MENSAGENS.senha.atualErrada : MENSAGENS.geral.semConexao);
      setSalvando(false);
    }
  }

  return (
    <main className="conteudo conteudo--estreito login">
      <img className="login__logo" src="/logo.png" alt="" />
      <h1>{primeiroAcesso ? "Crie sua senha" : "Trocar senha"}</h1>
      <p className="subtitulo">
        {primeiroAcesso
          ? `Olá, ${usuario.nome.split(" ")[0]}. Antes de começar, troque a senha que você recebeu por uma só sua.`
          : "Digite a senha atual e escolha uma nova."}
      </p>
      <Cartao>
        <form onSubmit={salvar} noValidate>
          <label htmlFor="senha-atual">{primeiroAcesso ? "Senha que você recebeu" : "Senha atual"}</label>
          <input
            id="senha-atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            autoComplete="current-password"
          />
          <label htmlFor="nova-senha" className="campo-seguinte">Nova senha</label>
          <input
            id="nova-senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            autoComplete="new-password"
            aria-describedby="regra-senha"
          />
          <p id="regra-senha" className="nota">{MENSAGENS.senha.regra}</p>
          <label htmlFor="confirmacao" className="campo-seguinte">Repita a nova senha</label>
          <input
            id="confirmacao"
            type="password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            autoComplete="new-password"
          />
          {erro && (
            <p className="aviso aviso--bloqueio campo-seguinte" role="alert">
              {erro}
            </p>
          )}
          <Button
            type="submit"
            label={salvando ? "Salvando..." : "Salvar nova senha"}
            desabilitado={salvando}
            className="botao--formulario"
          />
        </form>
      </Cartao>
    </main>
  );
}
