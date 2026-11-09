import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { Aviso } from "../../components/base/Aviso";
import { Cabecalho } from "../../components/base/Cabecalho";
import { buscarFamilias } from "../../services/familiaService";
import { cadastrarMembro } from "../../services/membros";
import type { FamiliaResumo } from "../../types/familia";
import { MENSAGENS } from "../../utils/mensagens";

export function Membros() {
  // O cadastro de família abre esta tela como /membros?familia=ID
  const [parametros] = useSearchParams();
  const [familias, setFamilias] = useState<FamiliaResumo[]>([]);
  const [familiaId, setFamiliaId] = useState(parametros.get("familia") ?? "");
  const [nome, setNome] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [autorizadoRetirar, setAutorizadoRetirar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    // Com busca vazia vêm todas as famílias, em ordem alfabética no seletor.
    buscarFamilias("")
      .then((lista) => setFamilias([...lista].sort((a, b) => a.nomeResponsavel.localeCompare(b.nomeResponsavel))))
      .catch(() => setFamilias([]));
  }, []);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    if (!familiaId || !nome.trim() || !parentesco.trim()) {
      setErro(MENSAGENS.membros.campoVazio);
      return;
    }

    setEnviando(true);
    setErro("");
    setSucesso("");
    try {
      await cadastrarMembro(Number(familiaId), {
        nome: nome.trim(),
        parentesco: parentesco.trim(),
        dataNascimento: dataNascimento || undefined,
        autorizadoRetirar,
      });
      const familia = familias.find((item) => String(item.id) === familiaId);
      setSucesso(`${nome.trim()} entrou na família de ${familia?.nomeResponsavel ?? "código " + familiaId}.`);
      // A família continua escolhida para cadastrar o próximo membro.
      setNome("");
      setParentesco("");
      setDataNascimento("");
      setAutorizadoRetirar(false);
    } catch {
      setErro(MENSAGENS.membros.erro);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Cabecalho />
      <main className="conteudo conteudo--estreito">
        <h1>Cadastro de membros</h1>
        <p className="subtitulo">Campos com * são obrigatórios.</p>

        {sucesso && (
          <Aviso variante="ok" titulo={MENSAGENS.membros.sucesso}>
            <p className="aviso__texto">{sucesso}</p>
          </Aviso>
        )}
        {erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível salvar">
            <p className="aviso__texto">{erro}</p>
          </Aviso>
        )}

        <Cartao>
          <form onSubmit={salvar} noValidate>
            <label htmlFor="familia">Família *</label>
            <select id="familia" value={familiaId} onChange={(e) => setFamiliaId(e.target.value)}>
              <option value="">Escolha a família</option>
              {familias.map((familia) => (
                <option key={familia.id} value={familia.id}>
                  {familia.nomeResponsavel} (Cód. {familia.codigo})
                </option>
              ))}
            </select>
            <label htmlFor="nome-membro" className="campo-seguinte">Nome *</label>
            <input id="nome-membro" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" />
            <label htmlFor="parentesco" className="campo-seguinte">Parentesco *</label>
            <input
              id="parentesco"
              value={parentesco}
              onChange={(e) => setParentesco(e.target.value)}
              placeholder="Ex.: Filho, Esposa, Neta"
              autoComplete="off"
            />
            <label htmlFor="nascimento" className="campo-seguinte">Data de nascimento</label>
            <input
              id="nascimento"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
            />
            <label className="campo-seguinte campo-marcar">
              <input
                type="checkbox"
                checked={autorizadoRetirar}
                onChange={(e) => setAutorizadoRetirar(e.target.checked)}
              />
              Autorizado a retirar cestas
            </label>
            <Button
              type="submit"
              label={enviando ? "Salvando..." : "Salvar membro"}
              desabilitado={enviando}
              className="botao--formulario"
            />
          </form>
        </Cartao>
      </main>
    </>
  );
}
