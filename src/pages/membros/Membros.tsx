import { useState } from "react";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { Aviso } from "../../components/base/Aviso";
import { Cabecalho } from "../../components/base/Cabecalho";
import { lerUsuarioLogado } from "../login/Login";
import { cadastrarMembro } from "../../services/membros";
import { MENSAGENS } from "../../utils/mensagens";

export function Membros() {
  const usuario = lerUsuarioLogado();
  const [nome, setNome] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [autorizadoRetirar, setAutorizadoRetirar] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(evento?: React.FormEvent) {
    evento?.preventDefault();
    try {
      await cadastrarMembro("1", { nome, parentesco, dataNascimento, autorizadoRetirar });
      setSucesso(true);
      setErro("");
      setNome("");
      setParentesco("");
      setDataNascimento("");
      setAutorizadoRetirar(false);
    } catch {
      setErro(MENSAGENS.membros.erro);
    }
  }

  return (
    <>
      <Cabecalho usuario={usuario?.nome ?? "Usuário"} cargo={usuario?.perfil ?? ""} />
      <main className="conteudo">
        <h1>Cadastro de membros</h1>
        {sucesso && (
          <Aviso variante="ok" titulo="Membro cadastrado">
            {MENSAGENS.membros.sucesso}
          </Aviso>
        )}
        {erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível salvar">
            {MENSAGENS.membros.erro}
          </Aviso>
        )}
        <Cartao>
          <form onSubmit={salvar}>
            <label htmlFor="nome-membro">Nome</label>
            <input id="nome-membro" value={nome}
              onChange={(e) => setNome(e.target.value)} required />
            <label htmlFor="parentesco" style={{ marginTop: 14 }}>Parentesco</label>
            <input id="parentesco" value={parentesco}
              onChange={(e) => setParentesco(e.target.value)} required />
            <label htmlFor="nascimento" style={{ marginTop: 14 }}>Data de nascimento</label>
            <input id="nascimento" type="date" value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)} />
            <label style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={autorizadoRetirar}
                onChange={(e) => setAutorizadoRetirar(e.target.checked)}
              />
              Autorizado a retirar cestas
            </label>
            <Button label="Salvar membro" />
          </form>
        </Cartao>
      </main>
    </>
  );
}