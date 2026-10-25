import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Aviso } from "../../components/base/Aviso";
import { Button } from "../../components/base/Button";
import { Cabecalho } from "../../components/base/Cabecalho";
import { Carregando } from "../../components/base/Carregando";
import { Cartao } from "../../components/base/Cartao";
import { buscarFamiliaPorId } from "../../services/familiaService";
import type { FamiliaDetalhe } from "../../types/familia";

// Usuário fixo até o login existir.
const USUARIO = "Maria";

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
  const [membroId, setMembroId] = useState<number | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let cancelado = false;
    buscarFamiliaPorId(idFamilia).then((resultado) => {
      if (cancelado) return;
      setFamilia(resultado);
      setCarregando(false);
      // Já deixa marcado o primeiro autorizado (normalmente o responsável).
      const primeiro = resultado?.membros.find((membro) => membro.autorizadoRetirar);
      setMembroId(primeiro ? primeiro.id : null);
    }).catch(() => {
      if (cancelado) return;
      setErro(true);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [idFamilia]);

  const reavaliacaoVencida = familia ? familia.dataReavaliacao <= hojeAAAAMMDD() : false;
  const autorizados = familia ? familia.membros.filter((membro) => membro.autorizadoRetirar) : [];

  // Data e horário que vão junto com a entrega, mostrados antes de confirmar.
  const agora = new Date();
  const dataHoje = agora.toLocaleDateString("pt-BR");
  const horaAgora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <Cabecalho usuario={USUARIO} cargo="operadora" />

      <main className="conteudo">
        <Link className="voltar" to="/busca-familia">
          ← Voltar para a busca
        </Link>
        <h1>Registrar entrega</h1>

        {carregando && <Carregando itens={1} />}

        {erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível carregar a família">
            <p className="aviso__texto">Verifique a conexão com a internet e volte para a busca.</p>
          </Aviso>
        )}

        {!carregando && !erro && !familia && (
          <p className="nota">Família não encontrada. Volte para a busca e tente de novo.</p>
        )}

        {familia && (
          <>
            <p className="subtitulo">Confira os dados e escolha quem está retirando a cesta.</p>

            {reavaliacaoVencida && (
              <Aviso variante="bloqueio" titulo="Reavaliação vencida">
                <p className="aviso__texto">
                  A entrega pode ser feita, mas encaminhe a família para a agente social agendar a nova entrevista.
                </p>
              </Aviso>
            )}

            <div className="entrega">
              <div>
                <Cartao titulo={familia.nomeResponsavel}>
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
                </Cartao>
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                <Cartao>
                  <fieldset className="opcoes">
                    <legend className="cartao__titulo">Quem está retirando?</legend>
                    {autorizados.map((membro) => (
                      <label className="opcao" key={membro.id}>
                        <input
                          type="radio"
                          name="membro"
                          value={membro.id}
                          checked={membroId === membro.id}
                          onChange={() => setMembroId(membro.id)}
                        />
                        <span>
                          {membro.nome}{" "}
                          <span className="opcao__parentesco">{membro.parentesco}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <p className="nota">Aparecem só os membros autorizados a retirar.</p>
                </Cartao>

                <Cartao>
                  <dl className="dados">
                    <dt>Data</dt>
                    <dd>{dataHoje}</dd>
                    <dt>Horário</dt>
                    <dd>{horaAgora}</dd>
                    <dt>Funcionário</dt>
                    <dd>{USUARIO}</dd>
                  </dl>
                  <p className="nota">Preenchidos automaticamente.</p>
                </Cartao>

                <div className="acao-fixa">
                  <Button type="submit" label="Confirmar entrega" desabilitado={membroId === null} />
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </>
  );
}
