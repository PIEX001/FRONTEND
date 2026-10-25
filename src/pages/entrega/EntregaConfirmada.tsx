import { Link } from "react-router-dom";
import { Aviso } from "../../components/base/Aviso";
import type { EntregaRegistrada } from "../../types/entrega";
import type { FamiliaDetalhe } from "../../types/familia";

type EntregaConfirmadaProps = {
  familia: FamiliaDetalhe;
  entrega: EntregaRegistrada;
};

// "2026-10-25T14:32:00" vira "25/10/2026, 14:32".
function dataHoraCurta(iso: string) {
  const data = new Date(iso);
  const dia = data.toLocaleDateString("pt-BR");
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia}, ${hora}`;
}

// Tela mostrada depois que a API confirma o registro da entrega.
export function EntregaConfirmada({ familia, entrega }: EntregaConfirmadaProps) {
  const quemRetirou = familia.membros.find((membro) => membro.id === entrega.membroId);

  return (
    <main className="conteudo conteudo--estreito">
      <Aviso variante="ok" titulo="Entrega registrada" nivelTitulo="h1">
        <dl className="dados">
          <dt>Família</dt>
          <dd>
            {familia.nomeResponsavel} ({familia.codigo})
          </dd>
          <dt>Retirou</dt>
          <dd>{quemRetirou ? quemRetirou.nome : "Membro não identificado"}</dd>
          <dt>Data</dt>
          <dd>{dataHoraCurta(entrega.dataHora)}</dd>
          <dt>Entregue por</dt>
          <dd>{entrega.funcionario}</dd>
        </dl>
      </Aviso>

      <Link className="botao" to="/busca-familia">
        Buscar outra família
      </Link>
    </main>
  );
}
