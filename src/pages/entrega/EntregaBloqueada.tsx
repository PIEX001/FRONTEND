import { Link } from "react-router-dom";
import { Aviso } from "../../components/base/Aviso";
import { Cartao } from "../../components/base/Cartao";
import type { EntregaRegistrada } from "../../types/entrega";
import type { FamiliaDetalhe } from "../../types/familia";
import { dataCurta, dataHoraCurta, mesAtualPorExtenso } from "./formatos";

type EntregaBloqueadaProps = {
  familia: FamiliaDetalhe;
  entregas: EntregaRegistrada[]; // da mais recente para a mais antiga
};

// Tela mostrada quando a família já recebeu a cesta no mês atual.
export function EntregaBloqueada({ familia, entregas }: EntregaBloqueadaProps) {
  const ultima = entregas[0];

  // O histórico guarda só o id de quem retirou; o nome vem da família.
  const membroDe = (entrega: EntregaRegistrada) =>
    familia.membros.find((membro) => membro.id === entrega.membroId);
  const quemRetirou = membroDe(ultima);

  return (
    <main className="conteudo conteudo--estreito">
      <Aviso
        variante="bloqueio"
        titulo={`Esta família já recebeu a cesta de ${mesAtualPorExtenso()}`}
        nivelTitulo="h1"
      >
        <dl className="dados">
          <dt>Retirou</dt>
          <dd>
            {quemRetirou
              ? `${quemRetirou.nome} (${quemRetirou.parentesco.toLowerCase()})`
              : ultima.membroNome ?? "Membro não identificado"}
          </dd>
          <dt>Data</dt>
          <dd>{dataHoraCurta(ultima.dataHora)}</dd>
          <dt>Entregue por</dt>
          <dd>{ultima.funcionario}</dd>
        </dl>
        <p className="nota">Não é possível registrar outra entrega no mesmo mês.</p>
      </Aviso>

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
        </dl>
      </Cartao>

      <Cartao titulo="Últimas entregas">
        <ul className="historico">
          {entregas.slice(0, 3).map((entrega) => (
            <li key={entrega.id}>
              <span>{dataCurta(entrega.dataHora)}</span>
              <span>
                {(membroDe(entrega)?.nome ?? entrega.membroNome)?.split(" ")[0] ?? "Membro"}, por {entrega.funcionario}
              </span>
            </li>
          ))}
        </ul>
      </Cartao>

      <Link className="botao" to="/busca-familia">
        Buscar outra família
      </Link>
    </main>
  );
}
