import type { EntregaRegistrada, NovaEntrega, ResumoEntregasMes } from "../types/entrega";
import { ErroApi, getJson, postJson, usarDadosDeExemplo } from "./api";

// ---------------------------------------------------------------------------
// Formato da API .NET (DeliveryController)

type EntregaDaApi = {
  id: number;
  familyId: number;
  personId: number | null;
  personName: string;
  employeeName: string;
  registeredAt: string; // ISO em UTC
};

export type ResumoDoMesDaApi = {
  month: string; // AAAA-MM
  totalFamilies: number;
  familiesServed: number;
  basketsDelivered: number;
  servedFamilies: { familyId: number; deliveryDate: string }[]; // deliveryDate AAAA-MM-DD
};

function daApi(entrega: EntregaDaApi): EntregaRegistrada {
  return {
    id: entrega.id,
    familiaId: entrega.familyId,
    membroId: entrega.personId ?? 0,
    membroNome: entrega.personName,
    funcionario: entrega.employeeName,
    dataHora: entrega.registeredAt,
  };
}

// Também usado pela busca, para marcar quem já recebeu no mês.
export function buscarResumoDoMesDaApi(): Promise<ResumoDoMesDaApi> {
  return getJson<ResumoDoMesDaApi>("/delivery/summary");
}

// ---------------------------------------------------------------------------

// Resumo de exemplo enquanto o endpoint de entregas não está pronto.
export async function buscarResumoMes(): Promise<ResumoEntregasMes> {
  if (!usarDadosDeExemplo) {
    const resumo = await buscarResumoDoMesDaApi();
    return { mesReferencia: resumo.month, totalFamilias: resumo.totalFamilies, familiasAtendidas: resumo.familiesServed };
  }

  await new Promise((resolver) => setTimeout(resolver, 200));

  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");

  // As entregas feitas na tela somam no número do mês.
  return {
    mesReferencia: `${hoje.getFullYear()}-${mes}`,
    totalFamilias: 212,
    familiasAtendidas: 143 + registradasNaTela,
  };
}

// Data de exemplo relativa a hoje: mesesAtras = 0 é o mês atual.
// O dia nunca passa de hoje, para não criar entrega no futuro.
function dataExemplo(mesesAtras: number, dia: number, hora: number) {
  const hoje = new Date();
  const diaFinal = mesesAtras === 0 ? Math.min(dia, hoje.getDate()) : dia;
  return new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, diaFinal, hora, 15).toISOString();
}

// Entregas de exemplo. A família 2 já recebeu neste mês, as outras não.
// As entregas registradas na tela entram nesta mesma lista.
const ENTREGAS_EXEMPLO: EntregaRegistrada[] = [
  { id: 1, familiaId: 1, membroId: 12, funcionario: "Joana", dataHora: dataExemplo(1, 12, 9) },
  { id: 2, familiaId: 1, membroId: 11, funcionario: "Maria", dataHora: dataExemplo(2, 14, 10) },
  { id: 3, familiaId: 2, membroId: 22, funcionario: "Joana", dataHora: dataExemplo(0, 9, 10) },
  { id: 4, familiaId: 2, membroId: 21, funcionario: "Maria", dataHora: dataExemplo(1, 11, 14) },
  { id: 5, familiaId: 2, membroId: 21, funcionario: "Joana", dataHora: dataExemplo(2, 14, 9) },
  { id: 6, familiaId: 3, membroId: 31, funcionario: "Maria", dataHora: dataExemplo(1, 18, 11) },
  { id: 7, familiaId: 4, membroId: 42, funcionario: "Joana", dataHora: dataExemplo(1, 15, 15) },
  { id: 8, familiaId: 5, membroId: 51, funcionario: "Maria", dataHora: dataExemplo(1, 21, 9) },
];

// Quantas entregas foram registradas na tela desde que a página abriu.
let registradasNaTela = 0;

// Compara mês e ano no fuso do aparelho, não em UTC.
function ehDesteMes(iso: string) {
  const data = new Date(iso);
  const hoje = new Date();
  return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
}

// Entrega da família no mês atual, se houver. Usada pela busca nos dados de exemplo.
export function entregaDoMesExemplo(familiaId: number): EntregaRegistrada | undefined {
  return ENTREGAS_EXEMPLO.find((entrega) => entrega.familiaId === familiaId && ehDesteMes(entrega.dataHora));
}

// Entregas da família, da mais recente para a mais antiga.
export async function listarEntregasDaFamilia(familiaId: number): Promise<EntregaRegistrada[]> {
  if (!usarDadosDeExemplo) {
    return (await getJson<EntregaDaApi[]>(`/delivery/family/${familiaId}`)).map(daApi);
  }

  await new Promise((resolver) => setTimeout(resolver, 300));

  return ENTREGAS_EXEMPLO.filter((entrega) => entrega.familiaId === familiaId).sort((a, b) =>
    b.dataHora.localeCompare(a.dataHora),
  );
}

// Registra a entrega da cesta. A API responde 409 quando a família
// já recebeu no mês, e a tela usa isso para mostrar o bloqueio.
export async function registrarEntrega(nova: NovaEntrega): Promise<EntregaRegistrada> {
  // O funcionário não vai no corpo: a API usa quem está logado.
  if (!usarDadosDeExemplo) {
    return daApi(await postJson<EntregaDaApi>("/delivery", { familyId: nova.familiaId, personId: nova.membroId }));
  }

  await new Promise((resolver) => setTimeout(resolver, 500));

  if (entregaDoMesExemplo(nova.familiaId)) {
    throw new ErroApi(409, "Família já recebeu a cesta neste mês");
  }

  const registrada: EntregaRegistrada = {
    ...nova,
    id: Math.max(0, ...ENTREGAS_EXEMPLO.map((entrega) => entrega.id)) + 1,
    dataHora: new Date().toISOString(),
  };
  ENTREGAS_EXEMPLO.push(registrada);
  registradasNaTela += 1;
  return registrada;
}
