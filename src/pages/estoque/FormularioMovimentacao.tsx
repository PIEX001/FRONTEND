import { useState, type FormEvent } from "react";
import { Aviso } from "../../components/base/Aviso";
import { Button } from "../../components/base/Button";
import { Cartao } from "../../components/base/Cartao";
import { ErroApi } from "../../services/api";
import { MOTIVOS, registrarMovimentacao } from "../../services/estoqueService";
import type { Movimentacao, TipoMovimentacao } from "../../types/estoque";

type FormularioMovimentacaoProps = {
  saldo: number;
  funcionario: string;
  aoRegistrar: (movimentacao: Movimentacao) => void;
};

// Formulário de entrada e saída de cestas.
export function FormularioMovimentacao({ saldo, funcionario, aoRegistrar }: FormularioMovimentacaoProps) {
  const [tipo, setTipo] = useState<TipoMovimentacao>("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState<string>(MOTIVOS.entrada[0]);
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const numero = Number(quantidade);
  const quantidadeValida = Number.isInteger(numero) && numero > 0;
  const passaDoSaldo = tipo === "saida" && quantidadeValida && numero > saldo;

  function trocarTipo(novo: TipoMovimentacao) {
    setTipo(novo);
    setMotivo(MOTIVOS[novo][0]);
    setErro("");
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    if (!quantidadeValida) {
      setErro("Informe uma quantidade de cestas maior que zero.");
      return;
    }
    if (passaDoSaldo) return;

    setEnviando(true);
    setErro("");
    try {
      const registrada = await registrarMovimentacao({
        tipo,
        quantidade: numero,
        motivo,
        observacao: observacao.trim() || undefined,
        funcionario,
      });
      setQuantidade("");
      setObservacao("");
      aoRegistrar(registrada);
    } catch (falha) {
      setErro(
        falha instanceof ErroApi && falha.status === 409
          ? "A saída é maior que o saldo do estoque. Atualize a página e confira o saldo."
          : "A movimentação não foi registrada. Verifique a conexão com a internet e tente de novo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      <Cartao titulo="Registrar movimentação">
        <fieldset className="opcoes estoque__tipos">
          <legend className="so-leitor">Tipo de movimentação</legend>
          <label className="opcao">
            <input type="radio" name="tipo" checked={tipo === "entrada"} onChange={() => trocarTipo("entrada")} />
            <span>Entrada</span>
          </label>
          <label className="opcao">
            <input type="radio" name="tipo" checked={tipo === "saida"} onChange={() => trocarTipo("saida")} />
            <span>Saída</span>
          </label>
        </fieldset>

        <label htmlFor="quantidade">Quantidade de cestas</label>
        <input
          id="quantidade"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={quantidade}
          onChange={(e) => {
            setQuantidade(e.target.value);
            setErro("");
          }}
          placeholder="Ex.: 20"
        />

        <label htmlFor="motivo" className="estoque__rotulo">Motivo</label>
        <select id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
          {MOTIVOS[tipo].map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>

        <label htmlFor="observacao" className="estoque__rotulo">
          Observação <span className="estoque__opcional">(opcional)</span>
        </label>
        <input
          id="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Ex.: campanha da paróquia"
          maxLength={120}
        />

        <p className="nota">
          {tipo === "saida"
            ? "As entregas às famílias já descontam do estoque. Use a saída só para perdas, repasses e ajustes."
            : "Data, horário e funcionário são preenchidos automaticamente."}
        </p>
      </Cartao>

      {passaDoSaldo && (
        <Aviso variante="bloqueio" titulo="Saída maior que o saldo">
          <p className="aviso__texto">
            Há {saldo} {saldo === 1 ? "cesta" : "cestas"} no estoque. Confira a quantidade.
          </p>
        </Aviso>
      )}

      {erro && (
        <Aviso variante="bloqueio" titulo="Não foi possível registrar">
          <p className="aviso__texto">{erro}</p>
        </Aviso>
      )}

      <div className="estoque__acao">
        <Button
          type="submit"
          label={enviando ? "Registrando..." : tipo === "entrada" ? "Registrar entrada" : "Registrar saída"}
          desabilitado={enviando || passaDoSaldo}
        />
      </div>
    </form>
  );
}
