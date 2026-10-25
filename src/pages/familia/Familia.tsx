import { useState } from "react";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { Aviso } from "../../components/base/Aviso";
import { Cabecalho } from "../../components/base/Cabecalho";
import { lerUsuarioLogado } from "../login/Login";
import { cadastrarFamilia } from "../../services/familias";
import { MENSAGENS } from "../../utils/mensagens";

export function Familia() {
  const usuario = lerUsuarioLogado();
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(evento?: React.FormEvent) {
    evento?.preventDefault();
    try {
      await cadastrarFamilia({
        nomeResponsavel,
        endereco,
        telefone,
        observacoes,
        quantidadeMembros: 0,
      });
      setSucesso(true);
      setErro("");
      setNomeResponsavel("");
      setEndereco("");
      setTelefone("");
      setObservacoes("");
    } catch {
      setErro(MENSAGENS.familia.erro);
    }
  }



  return (
    <>
      <Cabecalho usuario={usuario?.nome ?? "Usuário"} cargo={usuario?.perfil ?? ""} />
      <main className="conteudo">
        <h1>Cadastro de família</h1>
        {sucesso && (
          <Aviso variante="ok" titulo="Cadastro realizado">
            {MENSAGENS.familia.sucesso}
          </Aviso>
        )}

        {erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível salvar">
            {MENSAGENS.familia.erro}
          </Aviso>
        )}
        <Cartao>
          <form onSubmit={salvar}>
            <label htmlFor="responsavel">Nome do responsável</label>
            <input id="responsavel" value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)} required />
            <label htmlFor="endereco" style={{ marginTop: 14 }}>Endereço</label>
            <input id="endereco" value={endereco}
              onChange={(e) => setEndereco(e.target.value)} required />
            <label htmlFor="telefone" style={{ marginTop: 14 }}>Telefone</label>
            <input id="telefone" value={telefone}
              onChange={(e) => setTelefone(e.target.value)} />
            <label htmlFor="observacoes" style={{ marginTop: 14 }}>Observações</label>
            <input id="observacoes" value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)} />
            <Button label="Salvar família" />
          </form>
        </Cartao>
      </main>
    </>
  );
}