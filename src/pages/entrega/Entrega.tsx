import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Cabecalho } from "../../components/base/Cabecalho";
import { Carregando } from "../../components/base/Carregando";
import { buscarFamiliaPorId } from "../../services/familiaService";
import type { FamiliaDetalhe } from "../../types/familia";

// "2027-03-01" vira "março de 2027".
function mesPorExtenso(data: string) {
  const [ano, mes] = data.split("-").map(Number);
  return new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

// Data de hoje no formato AAAA-MM-DD, no fuso do aparelho.
function hojeAAAAMMDD() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

export function Entrega() {
  // A busca abre esta tela como /entrega?familia=ID
  const [parametros] = useSearchParams();
  const idFamilia = Number(parametros.get("familia"));

  const [familia, setFamilia] = useState<FamiliaDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    buscarFamiliaPorId(idFamilia).then((resultado) => {
      if (cancelado) return;
      setFamilia(resultado);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [idFamilia]);

  const reavaliacaoVencida = familia ? familia.dataReavaliacao <= hojeAAAAMMDD() : false;

  return (
    <>
      {/* Usuário fixo até o login existir */}
      <Cabecalho usuario="Maria" cargo="operadora" />

      <main className="conteudo">
        <Link className="voltar" to="/busca-familia">
          ← Voltar para a busca
        </Link>
        <h1>Registrar entrega</h1>

        {carregando && <Carregando itens={1} />}

        {!carregando && !familia && (
          <p className="nota">Família não encontrada. Volte para a busca e tente de novo.</p>
        )}

        {familia && (
          <>
            <p className="subtitulo">Confira os dados e escolha quem está retirando a cesta.</p>

            <div className="entrega">
              <div>
                {/* Trocar por <Cartao> quando o componente base estiver pronto */}
                <section className="cartao">
                  <h2 className="cartao__titulo">{familia.nomeResponsavel}</h2>
                  <dl className="dados">
                    <dt>Código</dt>
                    <dd>{familia.codigo}</dd>
                    <dt>Turma</dt>
                    <dd>{familia.turma}</dd>
                    {familia.telefone && (
                      <>
                        <dt>Telefone</dt>
                        <dd>{familia.telefone}</dd>
                      </>
                    )}
                    <dt>Reavaliação</dt>
                    <dd>
                      {reavaliacaoVencida
                        ? `vencida desde ${mesPorExtenso(familia.dataReavaliacao)}`
                        : `em ${mesPorExtenso(familia.dataReavaliacao)}`}
                    </dd>
                  </dl>
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
