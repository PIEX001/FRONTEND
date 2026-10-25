import type { EntregaRegistrada, NovaEntrega, ResumoEntregasMes } from "../types/entrega";
import { ErroApi, getJson, postJson, usarDadosDeExemplo } from "./api";

// Resumo de exemplo enquanto o endpoint de entregas não está pronto.
export async function buscarResumoMes(): Promise<ResumoEntregasMes> {
  // Caminho provisório: confirmar com a Tayná quando o endpoint existir.
  if (!usarDadosDeExemplo) {
    return getJson<ResumoEntregasMes>("/entregas/resumo-mes");
  }

  await new Promise((resolver) => setTimeout(resolver, 200));

  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");

  return {
    mesReferencia: `${hoje.getFullYear()}-${mes}`,
    totalFamilias: 212,
    familiasAtendidas: 143,
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

// Entregas da família, da mais recente para a mais antiga.
export async function listarEntregasDaFamilia(familiaId: number): Promise<EntregaRegistrada[]> {
  // Caminho provisório: confirmar com a Tayná quando o endpoint existir.
  if (!usarDadosDeExemplo) {
    return getJson<EntregaRegistrada[]>(`/familias/${familiaId}/entregas`);
  }

  await new Promise((resolver) => setTimeout(resolver, 300));

  return ENTREGAS_EXEMPLO.filter((entrega) => entrega.familiaId === familiaId).sort((a, b) =>
    b.dataHora.localeCompare(a.dataHora),
  );
}

// Registra a entrega da cesta. A API responde 409 quando a família
// já recebeu no mês, e a tela usa isso para mostrar o bloqueio.
export async function registrarEntrega(nova: NovaEntrega): Promise<EntregaRegistrada> {
  // Caminho provisório: confirmar com a Tayná quando o endpoint existir.
  if (!usarDadosDeExemplo) {
    return postJson<EntregaRegistrada>("/entregas", nova);
  }

  await new Promise((resolver) => setTimeout(resolver, 500));

  // Compara mês e ano no fuso do aparelho, não em UTC.
  const agora = new Date();
  const mesmoMes = (data: Date) =>
    data.getFullYear() === agora.getFullYear() && data.getMonth() === agora.getMonth();
  const jaRecebeu = ENTREGAS_EXEMPLO.some(
    (entrega) => entrega.familiaId === nova.familiaId && mesmoMes(new Date(entrega.dataHora)),
  );
  if (jaRecebeu) {
    throw new ErroApi(409, "Família já recebeu a cesta neste mês");
  }

  const registrada: EntregaRegistrada = {
    ...nova,
    id: Math.max(0, ...ENTREGAS_EXEMPLO.map((entrega) => entrega.id)) + 1,
    dataHora: agora.toISOString(),
  };
  ENTREGAS_EXEMPLO.push(registrada);
  return registrada;
}
