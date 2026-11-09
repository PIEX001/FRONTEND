import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Aviso } from "../../components/base/Aviso";
import { Button } from "../../components/base/Button";
import { Cabecalho } from "../../components/base/Cabecalho";
import { Carregando } from "../../components/base/Carregando";
import { gerarRelatorioEntregas } from "../../services/relatorioService";
import { listarTurmas } from "../../services/turmaService";
import type { RelatorioEntregas } from "../../types/relatorio";
import { lerUsuarioLogado } from "../../services/sessao";
import { ListaEntregas } from "./ListaEntregas";
import { ResumoPorTurma } from "./ResumoPorTurma";
import "./Relatorios.css";

// Últimos 12 meses, do atual para trás: [{ valor: "2026-11", nome: "Novembro de 2026" }, ...]
function ultimosMeses() {
  const hoje = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const valor = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    const nome = data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return { valor, nome: nome.charAt(0).toUpperCase() + nome.slice(1) };
  });
}

const MESES = ultimosMeses();

export function Relatorios() {
  const usuario = lerUsuarioLogado();

  const [mes, setMes] = useState(MESES[0].valor);
  const [turma, setTurma] = useState(""); // "" = todas
  const [turmas, setTurmas] = useState<string[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioEntregas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0); // muda para buscar de novo

  useEffect(() => {
    // Se falhar, o filtro fica só com "Todas as turmas".
    listarTurmas().then(setTurmas).catch(() => setTurmas([]));
  }, []);

  useEffect(() => {
    let cancelado = false;
    gerarRelatorioEntregas(mes, turma)
      .then((resultado) => {
        if (cancelado) return;
        setRelatorio(resultado);
        setCarregando(false);
      })
      .catch(() => {
        if (cancelado) return;
        setErro(true);
        setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [mes, turma, tentativa]);

  // Troca de filtro: limpa o relatório anterior e mostra o carregamento.
  function filtrar(novoMes: string, novaTurma: string) {
    setMes(novoMes);
    setTurma(novaTurma);
    setRelatorio(null);
    setErro(false);
    setCarregando(true);
  }

  function tentarDeNovo() {
    setErro(false);
    setCarregando(true);
    setTentativa((anterior) => anterior + 1);
  }

  const nomeMes = MESES.find((opcao) => opcao.valor === mes)?.nome ?? mes;
  const pendentes = relatorio ? relatorio.totalFamilias - relatorio.familiasAtendidas : 0;

  return (
    <>
      <Cabecalho />

      <main className="conteudo relatorio">
        <Link className="voltar so-tela" to="/busca-familia">
          ← Voltar para a busca
        </Link>
        <h1>Relatório de entregas</h1>
        <p className="subtitulo">
          {nomeMes} · {turma || "Todas as turmas"}
        </p>

        <div className="relatorio__filtros so-tela">
          <select className="filtro" aria-label="Mês" value={mes} onChange={(e) => filtrar(e.target.value, turma)}>
            {MESES.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.nome}
              </option>
            ))}
          </select>
          <select className="filtro" aria-label="Turma" value={turma} onChange={(e) => filtrar(mes, e.target.value)}>
            <option value="">Todas as turmas</option>
            {turmas.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
          {relatorio && (
            <Button
              label="Imprimir ou salvar PDF"
              variante="secundario"
              className="relatorio__imprimir"
              onClick={() => window.print()}
            />
          )}
        </div>

        {carregando && <Carregando itens={2} />}

        {erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível gerar o relatório">
            <p className="aviso__texto">Verifique a conexão com a internet e tente de novo.</p>
            <Button label="Tentar de novo" variante="secundario" onClick={tentarDeNovo} />
          </Aviso>
        )}

        {relatorio && !erro && (
          <>
            <dl className="numeros">
              <div className="numero">
                <dt>Famílias atendidas</dt>
                <dd>
                  {relatorio.familiasAtendidas} <span>de {relatorio.totalFamilias}</span>
                </dd>
              </div>
              <div className="numero">
                <dt>Ainda não receberam</dt>
                <dd>{pendentes}</dd>
              </div>
              <div className="numero">
                <dt>Cestas entregues</dt>
                <dd>{relatorio.cestasEntregues}</dd>
              </div>
            </dl>

            <div className="relatorio__colunas">
              {!turma && relatorio.porTurma.length > 0 && <ResumoPorTurma turmas={relatorio.porTurma} />}
              <ListaEntregas entregas={relatorio.entregas} />
            </div>

            <p className="nota so-impressao">
              Gerado em {new Date().toLocaleString("pt-BR")} por {usuario?.nome ?? "usuário do sistema"}.
            </p>
          </>
        )}
      </main>
    </>
  );
}
