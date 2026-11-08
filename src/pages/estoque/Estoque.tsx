import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Aviso } from "../../components/base/Aviso";
import { Button } from "../../components/base/Button";
import { Cabecalho } from "../../components/base/Cabecalho";
import { Carregando } from "../../components/base/Carregando";
import { Cartao } from "../../components/base/Cartao";
import { Situacao } from "../../components/base/Situacao";
import { buscarResumoMes } from "../../services/entregaService";
import { buscarSaldo, listarMovimentacoes } from "../../services/estoqueService";
import type { Movimentacao, SaldoEstoque } from "../../types/estoque";
import { lerUsuarioLogado } from "../login/Login";
import { dataHoraCurta, mesAtualPorExtenso } from "../entrega/formatos";
import { FormularioMovimentacao } from "./FormularioMovimentacao";
import "./Estoque.css";

// "1 cesta" ou "N cestas".
function cestas(quantidade: number) {
  return quantidade === 1 ? "1 cesta" : `${quantidade} cestas`;
}

export function Estoque() {
  const usuario = lerUsuarioLogado();
  const nome = usuario?.nome ?? "";

  const [saldo, setSaldo] = useState<SaldoEstoque | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [pendentes, setPendentes] = useState<number | null>(null); // famílias que faltam no mês
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0); // muda para carregar de novo
  const [ultimaRegistrada, setUltimaRegistrada] = useState<Movimentacao | null>(null);

  useEffect(() => {
    let cancelado = false;
    Promise.all([buscarSaldo(), listarMovimentacoes()])
      .then(([resultado, lista]) => {
        if (cancelado) return;
        setSaldo(resultado);
        setMovimentacoes(lista);
        setCarregando(false);
      })
      .catch(() => {
        if (cancelado) return;
        setErro(true);
        setCarregando(false);
      });
    // Se falhar, a tela funciona sem a comparação com as famílias do mês.
    buscarResumoMes()
      .then((resumo) => !cancelado && setPendentes(resumo.totalFamilias - resumo.familiasAtendidas))
      .catch(() => !cancelado && setPendentes(null));
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function tentarDeNovo() {
    setErro(false);
    setCarregando(true);
    setTentativa((anterior) => anterior + 1);
  }

  // Depois de registrar, busca saldo e lista de novo para ficar igual à API.
  function aoRegistrar(movimentacao: Movimentacao) {
    setUltimaRegistrada(movimentacao);
    setTentativa((anterior) => anterior + 1);
  }

  const falta = saldo && pendentes !== null ? pendentes - saldo.saldo : null;

  return (
    <>
      <Cabecalho usuario={nome} cargo="administrador" />

      <main className="conteudo">
        <Link className="voltar" to="/busca-familia">
          ← Voltar para a busca
        </Link>
        <h1>Estoque de cestas</h1>
        <p className="subtitulo">Registre as cestas que chegam e as que saem fora das entregas.</p>

        {carregando && !saldo && <Carregando itens={2} />}

        {erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível carregar o estoque">
            <p className="aviso__texto">Verifique a conexão com a internet e tente de novo.</p>
            <Button label="Tentar de novo" variante="secundario" onClick={tentarDeNovo} />
          </Aviso>
        )}

        {saldo && !erro && (
          <div className="estoque">
            <div>
              {ultimaRegistrada && (
                <Aviso
                  variante="ok"
                  titulo={`${ultimaRegistrada.tipo === "entrada" ? "Entrada" : "Saída"} de ${cestas(
                    ultimaRegistrada.quantidade,
                  )} registrada`}
                >
                  <p className="aviso__texto">O saldo abaixo já está atualizado.</p>
                </Aviso>
              )}

              <Cartao titulo="Saldo atual">
                <p className="estoque__saldo">
                  {saldo.saldo}
                  <span>{saldo.saldo === 1 ? "cesta" : "cestas"}</span>
                </p>
                <p className="nota">Última movimentação em {dataHoraCurta(saldo.atualizadoEm)}.</p>
                {falta !== null && pendentes !== null && pendentes > 0 && (
                  <div className="estoque__cobertura">
                    <Situacao
                      estado={falta > 0 ? "alerta" : "ok"}
                      texto={
                        falta > 0
                          ? `Faltam ${cestas(falta)} para as ${pendentes} famílias que ainda não receberam em ${mesAtualPorExtenso()}`
                          : `Dá para as ${pendentes} famílias que ainda não receberam em ${mesAtualPorExtenso()}`
                      }
                    />
                  </div>
                )}
              </Cartao>

              <FormularioMovimentacao saldo={saldo.saldo} funcionario={nome} aoRegistrar={aoRegistrar} />
            </div>

            <Cartao titulo="Últimas movimentações">
              {movimentacoes.length === 0 ? (
                <p className="nota">Nenhuma movimentação registrada ainda.</p>
              ) : (
                <ul className="movimentacoes">
                  {movimentacoes.slice(0, 10).map((mov) => (
                    <li key={mov.id} className={`movimentacao movimentacao--${mov.tipo}`}>
                      <span className="movimentacao__quantidade">
                        {mov.tipo === "entrada" ? "+" : "−"}
                        {mov.quantidade}
                      </span>
                      <span className="movimentacao__motivo">
                        {mov.motivo}
                        {mov.observacao && <span className="movimentacao__dados"> · {mov.observacao}</span>}
                      </span>
                      <span className="movimentacao__dados">
                        {dataHoraCurta(mov.dataHora)}, por {mov.funcionario}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>
          </div>
        )}
      </main>
    </>
  );
}
