import { ESTADOS_CIVIS, type DadosPessoais } from "../../types/familia";

type CamposPessoaisProps = {
  prefixo: string; // deixa os ids dos campos únicos na página
  dados: DadosPessoais;
  aoMudar: (dados: DadosPessoais) => void;
};

// Dados pessoais que a API pede de cada membro (CPF, nascimento, estado civil...).
// Usado no cadastro de família (responsável) e no cadastro de membros.
export function CamposPessoais({ prefixo, dados, aoMudar }: CamposPessoaisProps) {
  const mudar = (campo: Partial<DadosPessoais>) => aoMudar({ ...dados, ...campo });

  return (
    <>
      <div className="campos-dupla">
        <div>
          <label htmlFor={`${prefixo}-cpf`} className="campo-seguinte">CPF *</label>
          <input
            id={`${prefixo}-cpf`}
            inputMode="numeric"
            value={dados.cpf}
            onChange={(e) => mudar({ cpf: e.target.value })}
            placeholder="000.000.000-00"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor={`${prefixo}-nascimento`} className="campo-seguinte">Data de nascimento *</label>
          <input
            id={`${prefixo}-nascimento`}
            type="date"
            value={dados.dataNascimento}
            onChange={(e) => mudar({ dataNascimento: e.target.value })}
          />
        </div>
      </div>
      <div className="campos-dupla">
        <div>
          <label htmlFor={`${prefixo}-estado-civil`} className="campo-seguinte">Estado civil *</label>
          <select
            id={`${prefixo}-estado-civil`}
            value={dados.estadoCivil}
            onChange={(e) => mudar({ estadoCivil: Number(e.target.value) })}
          >
            {ESTADOS_CIVIS.map((texto, indice) => (
              <option key={texto} value={indice}>
                {texto}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${prefixo}-nacionalidade`} className="campo-seguinte">Nacionalidade *</label>
          <input
            id={`${prefixo}-nacionalidade`}
            value={dados.nacionalidade}
            onChange={(e) => mudar({ nacionalidade: e.target.value })}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="campos-dupla">
        <div>
          <label htmlFor={`${prefixo}-renda`} className="campo-seguinte">Renda mensal (R$)</label>
          <input
            id={`${prefixo}-renda`}
            inputMode="decimal"
            value={dados.renda ?? ""}
            onChange={(e) => {
              const valor = Number(e.target.value.replace(",", "."));
              mudar({ renda: e.target.value === "" || Number.isNaN(valor) ? undefined : valor });
            }}
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor={`${prefixo}-escolaridade`} className="campo-seguinte">Escolaridade</label>
          <input
            id={`${prefixo}-escolaridade`}
            value={dados.escolaridade ?? ""}
            onChange={(e) => mudar({ escolaridade: e.target.value })}
            placeholder="Ex.: Ensino médio"
            autoComplete="off"
          />
        </div>
      </div>
    </>
  );
}
