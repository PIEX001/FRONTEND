import { useState } from "react";
import { Button } from "../../components/base/Button";
import { Cartao } from "../../components/base/Cartao";
import type { EntregaDoRelatorio } from "../../types/relatorio";
import { dataHoraCurta } from "../entrega/formatos";

type ListaEntregasProps = {
  entregas: EntregaDoRelatorio[];
};

// Quantas linhas aparecem antes do botão "Mostrar todas".
const LIMITE = 15;

// Lista das entregas do mês. Na impressão saem todas, mesmo as escondidas.
export function ListaEntregas({ entregas }: ListaEntregasProps) {
  const [todas, setTodas] = useState(false);

  return (
    <Cartao titulo={`Entregas do mês (${entregas.length})`}>
      {entregas.length === 0 ? (
        <p className="nota">Nenhuma entrega registrada neste mês.</p>
      ) : (
        <>
          <ul className="entregas-relatorio">
            {entregas.map((entrega, indice) => (
              <li
                key={entrega.id}
                className={!todas && indice >= LIMITE ? "entrega-linha entrega-linha--oculta" : "entrega-linha"}
              >
                <span className="entrega-linha__familia">
                  {entrega.familiaNome} <span className="entrega-linha__codigo">Cód. {entrega.familiaCodigo}</span>
                </span>
                <span className="entrega-linha__dados">
                  {dataHoraCurta(entrega.dataHora)} · {entrega.turma}
                </span>
                <span className="entrega-linha__dados">
                  {entrega.retiradoPor === entrega.familiaNome
                    ? "Retirada pelo responsável"
                    : `Retirada por ${entrega.retiradoPor}`}
                  , entregue por {entrega.funcionario}
                </span>
              </li>
            ))}
          </ul>
          {!todas && entregas.length > LIMITE && (
            <div className="so-tela">
              <Button
                label={`Mostrar todas as ${entregas.length} entregas`}
                variante="secundario"
                onClick={() => setTodas(true)}
              />
            </div>
          )}
        </>
      )}
    </Cartao>
  );
}
