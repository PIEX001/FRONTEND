import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cabecalho } from "../../components/base/Cabecalho";
import { CampoBusca } from "../../components/base/CampoBusca";
import { Carregando } from "../../components/base/Carregando";
import { Situacao } from "../../components/base/Situacao";
import { buscarResumoMes } from "../../services/entregaService";
import { buscarFamilias } from "../../services/familiaService";
import type { ResumoEntregasMes } from "../../types/entrega";
import type { FamiliaResumo } from "../../types/familia";

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
  const [carregando, setCarregando] = useState(false);
  const [resumo, setResumo] = useState<ResumoEntregasMes | null>(null);
  const buscou = termo.trim() !== "";

  useEffect(() => {
    buscarResumoMes().then(setResumo);
  }, []);

  const porcentagem =
    resumo && resumo.totalFamilias > 0
      ? Math.round((resumo.familiasAtendidas / resumo.totalFamilias) * 100)
      : 0;

  function aoMudarTermo(valor: string) {
    setTermo(valor);
    setCarregando(valor.trim() !== "");
  }

  // Espera a pessoa parar de digitar por 300 ms antes de buscar,
  // e ignora respostas de buscas antigas.
  useEffect(() => {
    if (!termo.trim()) return;
    let cancelado = false;
    const espera = setTimeout(() => {
      buscarFamilias(termo).then((resultado) => {
        if (cancelado) return;
        setFamilias(resultado);
        setCarregando(false);
      });
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [termo]);

  return (
    <>
      {/* Usuário fixo até o login existir */}
      <Cabecalho usuario="Maria" cargo="operadora" />

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

        {buscou && carregando && <Carregando />}

        {buscou && !carregando && (
          <>
            <div className="resultado-topo">
              <p className="resultado-total">
                {familias.length === 1 ? "1 família" : `${familias.length} famílias`}
              </p>
            </div>

            <ul className="lista-familias">
              {familias.map((familia) => {
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
