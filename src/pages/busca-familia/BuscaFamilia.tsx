import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cabecalho } from "../../components/base/Cabecalho";
import { CampoBusca } from "../../components/base/CampoBusca";
import { Carregando } from "../../components/base/Carregando";
import { Aviso } from "../../components/base/Aviso";
import { Button } from "../../components/base/Button";
import { Situacao } from "../../components/base/Situacao";
import { Vazio } from "../../components/base/Vazio";
import { buscarResumoMes } from "../../services/entregaService";
import { buscarFamilias } from "../../services/familiaService";
import { listarTurmas } from "../../services/turmaService";
import type { ResumoEntregasMes } from "../../types/entrega";
import type { FamiliaResumo } from "../../types/familia";
import "./BuscaFamilia.css";

// Filtro de situação: "pendente" junta quem ainda não recebeu, com ou sem reavaliação vencida.
type FiltroSituacao = "pendente" | "recebida" | "";

// Dias de retirada de cada turma (regras de negócio, seção 11).
const DIA_DA_TURMA: Record<number, string> = { 15: "Turma 1", 21: "Turma 2" };

// "2026-10" vira "Outubro de 2026".
function nomeDoMes(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const texto = new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Traduz a situação da família para a etiqueta colorida da lista.
function etiquetaSituacao(familia: FamiliaResumo) {
  if (familia.situacao === "recebida" && familia.dataUltimaEntrega) {
    const [, mes, dia] = familia.dataUltimaEntrega.split("-");
    return { estado: "ok", texto: `Recebeu em ${dia}/${mes}` } as const;
  }
  if (familia.situacao === "reavaliacao-vencida") {
    return { estado: "alerta", texto: "Reavaliação vencida" } as const;
  }
  return { estado: "pendente", texto: "Ainda não recebeu" } as const;
}

export function BuscaFamilia() {
  const [termo, setTermo] = useState("");
  const [familias, setFamilias] = useState<FamiliaResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [resumo, setResumo] = useState<ResumoEntregasMes | null>(null);
  const [turmas, setTurmas] = useState<string[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(""); // "" = todas
  const [situacaoSelecionada, setSituacaoSelecionada] = useState<FiltroSituacao>("pendente");
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0); // muda para repetir a busca
  const buscou = termo.trim() !== "";

  useEffect(() => {
    // Se falharem, a tela continua funcionando sem a barra e sem o filtro.
    buscarResumoMes().then(setResumo).catch(() => setResumo(null));
    listarTurmas()
      .then((lista) => {
        setTurmas(lista);
        // No dia de retirada de uma turma, a lista já abre nela.
        const turmaDeHoje = DIA_DA_TURMA[new Date().getDate()];
        if (turmaDeHoje && lista.includes(turmaDeHoje)) setTurmaSelecionada(turmaDeHoje);
      })
      .catch(() => setTurmas([]));
  }, []);

  const familiasVisiveis = familias.filter((familia) => {
    if (turmaSelecionada && familia.turma !== turmaSelecionada) return false;
    if (situacaoSelecionada === "recebida") return familia.situacao === "recebida";
    if (situacaoSelecionada === "pendente") return familia.situacao !== "recebida";
    return true;
  });

  const porcentagem =
    resumo && resumo.totalFamilias > 0
      ? Math.round((resumo.familiasAtendidas / resumo.totalFamilias) * 100)
      : 0;

  function aoMudarTermo(valor: string) {
    setTermo(valor);
    setErro(false);
    setCarregando(true);
  }

  function tentarDeNovo() {
    setErro(false);
    setCarregando(true);
    setTentativa((anterior) => anterior + 1);
  }

  // Com o campo vazio, traz todas as famílias (os filtros fazem o resto).
  // Espera a pessoa parar de digitar por 300 ms antes de buscar,
  // e ignora respostas de buscas antigas.
  useEffect(() => {
    let cancelado = false;
    const espera = setTimeout(() => {
      buscarFamilias(termo)
        .then((resultado) => {
          if (cancelado) return;
          setFamilias(resultado);
          setCarregando(false);
        })
        .catch(() => {
          if (cancelado) return;
          setErro(true);
          setCarregando(false);
        });
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [termo, tentativa]);

  return (
    <>
      <Cabecalho />

      <main className="conteudo">
        <h1>Entrega de cestas</h1>

        {resumo && (
          <>
            <p className="subtitulo">
              {nomeDoMes(resumo.mesReferencia)} · {resumo.familiasAtendidas} de{" "}
              {resumo.totalFamilias} famílias já receberam
            </p>
            <div
              className="progresso"
              role="progressbar"
              aria-label="Famílias que já receberam a cesta no mês"
              aria-valuemin={0}
              aria-valuemax={resumo.totalFamilias}
              aria-valuenow={resumo.familiasAtendidas}
            >
              <span style={{ width: `${porcentagem}%` }} />
            </div>
          </>
        )}

        <CampoBusca valor={termo} aoMudar={aoMudarTermo} />

        {carregando && <Carregando />}

        {!carregando && erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível buscar as famílias">
            <p className="aviso__texto">Verifique a conexão com a internet e tente de novo.</p>
            <Button label="Tentar de novo" variante="secundario" onClick={tentarDeNovo} />
          </Aviso>
        )}

        {!carregando && !erro && (
          <>
            <div className="resultado-topo busca__topo">
              <p className="resultado-total">
                {familiasVisiveis.length === 1
                  ? "1 família"
                  : `${familiasVisiveis.length} famílias`}
              </p>
              <div className="busca__filtros">
                <select
                  className="filtro"
                  aria-label="Situação"
                  value={situacaoSelecionada}
                  onChange={(e) => setSituacaoSelecionada(e.target.value as FiltroSituacao)}
                >
                  <option value="pendente">Ainda não receberam</option>
                  <option value="recebida">Já receberam</option>
                  <option value="">Todas as situações</option>
                </select>
                <select
                  className="filtro"
                  aria-label="Turma"
                  value={turmaSelecionada}
                  onChange={(e) => setTurmaSelecionada(e.target.value)}
                >
                  <option value="">Todas as turmas</option>
                  {turmas.map((turma) => (
                    <option key={turma} value={turma}>
                      {turma}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {familiasVisiveis.length === 0 && (
              <Vazio
                titulo={
                  buscou
                    ? `Nenhuma família encontrada para "${termo.trim()}"`
                    : "Nenhuma família com esses filtros"
                }
                texto={
                  buscou && familias.length === 0
                    ? "Confira se o nome está certo ou tente buscar pelo telefone ou pelo código da família."
                    : "Troque a turma ou a situação nos filtros acima."
                }
              />
            )}

            <ul className="lista-familias">
              {familiasVisiveis.map((familia) => {
                const etiqueta = etiquetaSituacao(familia);
                return (
                  <li key={familia.id}>
                    <Link className="familia" to={`/entrega?familia=${familia.id}`}>
                      <span className="familia__nome">{familia.nomeResponsavel}</span>
                      <span className="familia__dados">
                        Cód. {familia.codigo} · {familia.turma} · {familia.totalMembros} membros
                      </span>
                      <Situacao estado={etiqueta.estado} texto={etiqueta.texto} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
