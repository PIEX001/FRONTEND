import type { EntregaDoRelatorio, RelatorioEntregas, ResumoTurma } from "../types/relatorio";
import { getJson, usarDadosDeExemplo } from "./api";
import { idDaTurma } from "./turmaService";

// Formato da API .NET (GET /delivery/report)
type RelatorioDaApi = {
  month: string;
  totalFamilies: number;
  familiesServed: number;
  basketsDelivered: number;
  byClass: { deliveryClassName: string; totalFamilies: number; familiesServed: number }[];
  deliveries: {
    id: number;
    registeredAt: string;
    familyCode: string;
    familyName: string;
    deliveryClassName: string | null;
    personName: string;
    employeeName: string;
  }[];
};

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
    let data = new Date(ano, mes - 1, dia, 8 + (n % 6), (n * 13) % 60);
    // No mês atual, nada de entrega num horário que ainda não chegou.
    if (data > hoje) data = new Date(hoje.getTime() - (n + 1) * 7 * 60 * 1000);
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
  if (!usarDadosDeExemplo) {
    const filtro = new URLSearchParams({ month: mesReferencia });
    const turmaId = await idDaTurma(turma);
    if (turmaId !== undefined) filtro.set("deliveryClassId", String(turmaId));
    const relatorio = await getJson<RelatorioDaApi>(`/delivery/report?${filtro}`);
    return {
      mesReferencia: relatorio.month,
      totalFamilias: relatorio.totalFamilies,
      familiasAtendidas: relatorio.familiesServed,
      cestasEntregues: relatorio.basketsDelivered,
      porTurma: relatorio.byClass.map((linha) => ({
        turma: linha.deliveryClassName,
        totalFamilias: linha.totalFamilies,
        familiasAtendidas: linha.familiesServed,
      })),
      entregas: relatorio.deliveries.map((entrega) => ({
        id: entrega.id,
        dataHora: entrega.registeredAt,
        familiaCodigo: entrega.familyCode,
        familiaNome: entrega.familyName,
        turma: entrega.deliveryClassName ?? "Sem turma",
        retiradoPor: entrega.personName,
        funcionario: entrega.employeeName,
      })),
    };
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
