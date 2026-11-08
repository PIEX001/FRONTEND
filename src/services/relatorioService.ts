import type { EntregaDoRelatorio, RelatorioEntregas, ResumoTurma } from "../types/relatorio";
import { getJson, usarDadosDeExemplo } from "./api";

// Total de famílias por turma nos dados de exemplo (soma 212, igual ao resumo da busca).
const TURMAS_EXEMPLO = [
  { turma: "Turma 1", totalFamilias: 70, atendidasNoMesAtual: 52 },
  { turma: "Turma 2", totalFamilias: 64, atendidasNoMesAtual: 45 },
  { turma: "Turma 3", totalFamilias: 48, atendidasNoMesAtual: 30 },
  { turma: "Venezuelanas", totalFamilias: 30, atendidasNoMesAtual: 16 },
];

const NOMES = ["Maria", "Rosângela", "José", "Adriana", "Marcos", "Cláudia", "Sebastião", "Lúcia", "Paulo", "Terezinha", "Yelitza", "Ana"];
const SOBRENOMES = ["da Silva", "Souza", "Pereira", "Rezende", "Moreira", "Oliveira", "Santos", "Costa", "Pérez"];

// Quantas famílias da turma receberam no mês: mês atual fixo, meses
// passados quase completos, meses futuros zerados.
function atendidasExemplo(mesReferencia: string, indiceTurma: number) {
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const turma = TURMAS_EXEMPLO[indiceTurma];
  if (mesReferencia === mesAtual) return turma.atendidasNoMesAtual;
  if (mesReferencia > mesAtual) return 0;
  const mes = Number(mesReferencia.slice(5));
  return turma.totalFamilias - ((mes * 3 + indiceTurma * 5) % 7);
}

// Número "aleatório" fixo para cada n, para os exemplos não mudarem a cada carga.
function sorteio(n: number, limite: number) {
  return Math.floor(Math.abs(Math.sin(n + 1) * 10000)) % limite;
}

// Monta entregas fictícias para o mês, sem passar do dia de hoje.
function entregasExemplo(mesReferencia: string, indiceTurma: number, quantidade: number) {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const hoje = new Date();
  const ehMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth() + 1;
  const turma = TURMAS_EXEMPLO[indiceTurma].turma;

  return Array.from({ length: quantidade }, (_, i): EntregaDoRelatorio => {
    const n = indiceTurma * 100 + i;
    const sobrenome = SOBRENOMES[sorteio(n * 3, SOBRENOMES.length)];
    const nome = `${NOMES[sorteio(n, NOMES.length)]} ${sobrenome}`;
    const ultimoDia = ehMesAtual ? hoje.getDate() : 27;
    const dia = 1 + ((n * 5) % ultimoDia);
    const data = new Date(ano, mes - 1, dia, 8 + (n % 6), (n * 13) % 60);
    return {
      id: n + 1,
      dataHora: data.toISOString(),
      familiaCodigo: String(10 + n * 3).padStart(4, "0"),
      familiaNome: nome,
      turma,
      retiradoPor: n % 4 === 0 ? `${NOMES[sorteio(n + 7, NOMES.length)]} ${sobrenome}` : nome,
      funcionario: n % 2 === 0 ? "Maria" : "Joana",
    };
  });
}

// mesReferencia no formato AAAA-MM. Turma vazia traz todas.
export async function gerarRelatorioEntregas(mesReferencia: string, turma: string): Promise<RelatorioEntregas> {
  // Caminho provisório: confirmar com a Tayná quando a consulta existir.
  if (!usarDadosDeExemplo) {
    const filtro = new URLSearchParams({ mes: mesReferencia });
    if (turma) filtro.set("turma", turma);
    return getJson<RelatorioEntregas>(`/relatorios/entregas?${filtro}`);
  }

  await new Promise((resolver) => setTimeout(resolver, 400));

  const porTurma: ResumoTurma[] = [];
  const entregas: EntregaDoRelatorio[] = [];
  TURMAS_EXEMPLO.forEach((dados, indice) => {
    if (turma && dados.turma !== turma) return;
    const atendidas = atendidasExemplo(mesReferencia, indice);
    porTurma.push({ turma: dados.turma, totalFamilias: dados.totalFamilias, familiasAtendidas: atendidas });
    entregas.push(...entregasExemplo(mesReferencia, indice, atendidas));
  });
  entregas.sort((a, b) => b.dataHora.localeCompare(a.dataHora));

  const somar = (campo: "totalFamilias" | "familiasAtendidas") =>
    porTurma.reduce((total, linha) => total + linha[campo], 0);

  return {
    mesReferencia,
    totalFamilias: somar("totalFamilias"),
    familiasAtendidas: somar("familiasAtendidas"),
    cestasEntregues: entregas.length,
    porTurma,
    entregas,
  };
}
