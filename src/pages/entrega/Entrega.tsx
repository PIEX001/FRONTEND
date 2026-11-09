import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Aviso } from "../../components/base/Aviso";
import { Button } from "../../components/base/Button";
import { Cabecalho } from "../../components/base/Cabecalho";
import { Carregando } from "../../components/base/Carregando";
import { Cartao } from "../../components/base/Cartao";
import { Situacao } from "../../components/base/Situacao";
import { ErroApi } from "../../services/api";
import { listarEntregasDaFamilia, registrarEntrega } from "../../services/entregaService";
import { buscarFamiliaPorId } from "../../services/familiaService";
import { lerUsuarioLogado } from "../../services/sessao";
import type { EntregaRegistrada } from "../../types/entrega";
import type { FamiliaDetalhe } from "../../types/familia";
import { EntregaBloqueada } from "./EntregaBloqueada";
import { EntregaConfirmada } from "./EntregaConfirmada";
import { dataCurta, ehDesteMes, mesAtualPorExtenso } from "./formatos";

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
  // Funcionário que registra a entrega: o usuário logado.
  const funcionario = lerUsuarioLogado()?.nome ?? "";

  // A busca abre esta tela como /entrega?familia=ID
  const [parametros] = useSearchParams();
  const idFamilia = Number(parametros.get("familia"));

  const [familia, setFamilia] = useState<FamiliaDetalhe | null>(null);
  const [entregas, setEntregas] = useState<EntregaRegistrada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [membroId, setMembroId] = useState<number | null>(null);
  const [erro, setErro] = useState(false);

  // Envio da entrega para a API.
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<"ja-recebeu" | "falha" | null>(null);
  const [registrada, setRegistrada] = useState<EntregaRegistrada | null>(null);

  useEffect(() => {
    let cancelado = false;
    // Família e histórico de entregas chegam juntos.
    Promise.all([
      buscarFamiliaPorId(idFamilia),
      listarEntregasDaFamilia(idFamilia),
    ]).then(([resultado, historico]) => {
      if (cancelado) return;
      setFamilia(resultado);
      setEntregas(historico);
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

  // Última entrega da família e nome de quem retirou, para o cartão do mês.
  const ultimaEntrega = entregas[0];
  const quemRetirouUltima = familia?.membros.find((membro) => membro.id === ultimaEntrega?.membroId);
  const mes = mesAtualPorExtenso();
  const tituloMes = mes.charAt(0).toUpperCase() + mes.slice(1);

  // Data e horário que vão junto com a entrega, mostrados antes de confirmar.
  const agora = new Date();
  const dataHoje = agora.toLocaleDateString("pt-BR");
  const horaAgora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  async function confirmar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!familia || membroId === null || enviando) return;

    setEnviando(true);
    setErroEnvio(null);
    try {
      const entrega = await registrarEntrega({
        familiaId: familia.id,
        membroId,
        funcionario,
      });
      setRegistrada(entrega);
    } catch (falha) {
      setErroEnvio(falha instanceof ErroApi && falha.status === 409 ? "ja-recebeu" : "falha");
    } finally {
      setEnviando(false);
    }
  }

  if (familia && registrada) {
    return (
      <>
        <Cabecalho />
        <EntregaConfirmada familia={familia} entrega={registrada} />
      </>
    );
  }

  // Família que já recebeu neste mês nem chega ao formulário.
  if (familia && entregas.some((entrega) => ehDesteMes(entrega.dataHora))) {
    return (
      <>
        <Cabecalho />
        <EntregaBloqueada familia={familia} entregas={entregas} />
      </>
    );
  }

  return (
    <>
      <Cabecalho />

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

                <Cartao titulo={tituloMes}>
                  <Situacao estado="pendente" texto="Ainda não recebeu" />
                  <p className="nota">
                    {ultimaEntrega
                      ? `Última entrega: ${dataCurta(ultimaEntrega.dataHora)}, retirada por ${
                          quemRetirouUltima?.nome.split(" ")[0] ?? "membro não identificado"
                        }, entregue por ${ultimaEntrega.funcionario}.`
                      : "Nenhuma entrega registrada ainda."}
                  </p>
                </Cartao>
              </div>

              <form onSubmit={confirmar}>
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
                    <dd>{funcionario}</dd>
                  </dl>
                  <p className="nota">Preenchidos automaticamente.</p>
                </Cartao>

                {erroEnvio === "ja-recebeu" && (
                  <Aviso variante="bloqueio" titulo="Esta família já recebeu a cesta deste mês">
                    <p className="aviso__texto">Não é possível registrar outra entrega no mesmo mês.</p>
                  </Aviso>
                )}

                {erroEnvio === "falha" && (
                  <Aviso variante="bloqueio" titulo="A entrega não foi registrada">
                    <p className="aviso__texto">Verifique a conexão com a internet e tente de novo.</p>
                  </Aviso>
                )}

                <div className="acao-fixa">
                  <Button
                    type="submit"
                    label={enviando ? "Registrando..." : "Confirmar entrega"}
                    desabilitado={membroId === null || enviando}
                  />
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </>
  );
}
