import { Cartao } from "../../components/base/Cartao";
import type { ResumoTurma } from "../../types/relatorio";

type ResumoPorTurmaProps = {
  turmas: ResumoTurma[];
};

function porcentagem(parte: number, total: number) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

// Barra de cada turma: quantas famílias já receberam do total.
export function ResumoPorTurma({ turmas }: ResumoPorTurmaProps) {
  return (
    <Cartao titulo="Por turma">
      <ul className="turmas">
        {turmas.map((linha) => {
          const pct = porcentagem(linha.familiasAtendidas, linha.totalFamilias);
          return (
            <li key={linha.turma} className="turma">
              <span className="turma__nome">{linha.turma}</span>
              <span className="turma__numeros">
                {linha.familiasAtendidas} de {linha.totalFamilias} ({pct}%)
              </span>
              <span
                className="turma__barra"
                role="progressbar"
                aria-label={`Famílias da ${linha.turma} que receberam`}
                aria-valuemin={0}
                aria-valuemax={linha.totalFamilias}
                aria-valuenow={linha.familiasAtendidas}
              >
                <span style={{ width: `${pct}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </Cartao>
  );
}
