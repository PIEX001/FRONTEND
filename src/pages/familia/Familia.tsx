import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { Aviso } from "../../components/base/Aviso";
import { Cabecalho } from "../../components/base/Cabecalho";
import { cadastrarFamilia } from "../../services/familias";
import { listarTurmas } from "../../services/turmaService";
import type { FamiliaDetalhe } from "../../types/familia";
import { MENSAGENS } from "../../utils/mensagens";

export function Familia() {
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [turma, setTurma] = useState("");
  const [turmas, setTurmas] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cadastrada, setCadastrada] = useState<FamiliaDetalhe | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarTurmas().then(setTurmas).catch(() => setTurmas([]));
  }, []);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    if (!nomeResponsavel.trim() || !endereco.trim() || !turma) {
      setErro(MENSAGENS.familia.campoVazio);
      return;
    }

    setEnviando(true);
    setErro("");
    setCadastrada(null);
    try {
      const familia = await cadastrarFamilia({
        nomeResponsavel: nomeResponsavel.trim(),
        endereco: endereco.trim(),
        telefone: telefone.trim() || undefined,
        turma,
        observacoes: observacoes.trim() || undefined,
        quantidadeMembros: 1,
      });
      setCadastrada(familia);
      setNomeResponsavel("");
      setEndereco("");
      setTelefone("");
      setTurma("");
      setObservacoes("");
    } catch {
      setErro(MENSAGENS.familia.erro);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Cabecalho />
      <main className="conteudo conteudo--estreito">
        <h1>Cadastro de família</h1>
        <p className="subtitulo">Campos com * são obrigatórios.</p>

        {cadastrada && (
          <Aviso variante="ok" titulo="Cadastro realizado">
            <p className="aviso__texto">
              {MENSAGENS.familia.sucesso} Código {cadastrada.codigo}.{" "}
              <Link to={`/membros?familia=${cadastrada.id}`}>Cadastrar membros desta família</Link>
            </p>
          </Aviso>
        )}

        {erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível salvar">
            <p className="aviso__texto">{erro}</p>
          </Aviso>
        )}

        <Cartao>
          <form onSubmit={salvar} noValidate>
            <label htmlFor="responsavel">Nome do responsável *</label>
            <input
              id="responsavel"
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
              autoComplete="off"
            />
            <label htmlFor="endereco" className="campo-seguinte">Endereço *</label>
            <input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} autoComplete="off" />
            <label htmlFor="telefone" className="campo-seguinte">Telefone</label>
            <input
              id="telefone"
              type="tel"
              inputMode="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(32) 99999-0000"
            />
            <label htmlFor="turma" className="campo-seguinte">Turma *</label>
            <select id="turma" value={turma} onChange={(e) => setTurma(e.target.value)}>
              <option value="">Escolha a turma</option>
              {turmas.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
            <label htmlFor="observacoes" className="campo-seguinte">Observações</label>
            <input id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            <Button
              type="submit"
              label={enviando ? "Salvando..." : "Salvar família"}
              desabilitado={enviando}
              className="botao--formulario"
            />
          </form>
        </Cartao>
      </main>
    </>
  );
}
