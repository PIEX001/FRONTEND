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

// Entregas feitas nesta sessão, só para o modo de exemplo.
const ENTREGAS_EXEMPLO: EntregaRegistrada[] = [];

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
    id: ENTREGAS_EXEMPLO.length + 1,
    dataHora: agora.toISOString(),
  };
  ENTREGAS_EXEMPLO.push(registrada);
  return registrada;
}
