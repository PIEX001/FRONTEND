import type { ResumoEntregasMes } from "../types/entrega";

// Resumo de exemplo enquanto o endpoint de entregas não está pronto.
export async function buscarResumoMes(): Promise<ResumoEntregasMes> {
  await new Promise((resolver) => setTimeout(resolver, 200));

  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");

  return {
    mesReferencia: `${hoje.getFullYear()}-${mes}`,
    totalFamilias: 212,
    familiasAtendidas: 143,
  };
}
