import type { Movimentacao, NovaMovimentacao, SaldoEstoque } from "../types/estoque";
import { ErroApi, getJson, postJson, usarDadosDeExemplo } from "./api";

// Motivos oferecidos na tela para cada tipo de movimentação.
// As saídas por entrega às famílias não entram aqui: a API deve baixar
// uma cesta do estoque a cada entrega registrada (confirmar com o Thiago).
export const MOTIVOS = {
  entrada: ["Doação", "Compra", "Ajuste de contagem"],
  saida: ["Perda ou avaria", "Repasse a outra instituição", "Ajuste de contagem"],
} as const;

// Data de exemplo: diasAtras = 0 é hoje.
function diasAtras(dias: number, hora: number) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  data.setHours(hora, 0, 0, 0);
  return data.toISOString();
}

// Movimentações de exemplo, da mais recente para a mais antiga.
// As registradas na tela entram no começo desta mesma lista.
const MOVIMENTACOES_EXEMPLO: Movimentacao[] = [
  { id: 5, tipo: "saida", quantidade: 2, motivo: "Perda ou avaria", observacao: "Embalagens molhadas", funcionario: "Administrador", dataHora: diasAtras(2, 16) },
  { id: 4, tipo: "entrada", quantidade: 40, motivo: "Doação", observacao: "Campanha da paróquia", funcionario: "Administrador", dataHora: diasAtras(5, 10) },
  { id: 3, tipo: "entrada", quantidade: 30, motivo: "Compra", funcionario: "Administrador", dataHora: diasAtras(12, 9) },
  { id: 2, tipo: "saida", quantidade: 5, motivo: "Repasse a outra instituição", funcionario: "Administrador", dataHora: diasAtras(20, 14) },
  { id: 1, tipo: "entrada", quantidade: 15, motivo: "Ajuste de contagem", observacao: "Contagem física do mês", funcionario: "Administrador", dataHora: diasAtras(28, 11) },
];

// Saldo de exemplo: entradas menos saídas.
function saldoExemplo() {
  return MOVIMENTACOES_EXEMPLO.reduce(
    (total, mov) => total + (mov.tipo === "entrada" ? mov.quantidade : -mov.quantidade),
    0,
  );
}

export async function buscarSaldo(): Promise<SaldoEstoque> {
  // Caminho provisório: confirmar com o Thiago quando o endpoint existir.
  if (!usarDadosDeExemplo) {
    return getJson<SaldoEstoque>("/estoque/saldo");
  }

  await new Promise((resolver) => setTimeout(resolver, 300));
  return { saldo: saldoExemplo(), atualizadoEm: MOVIMENTACOES_EXEMPLO[0].dataHora };
}

// Movimentações da mais recente para a mais antiga.
export async function listarMovimentacoes(): Promise<Movimentacao[]> {
  // Caminho provisório: confirmar com o Thiago quando o endpoint existir.
  if (!usarDadosDeExemplo) {
    return getJson<Movimentacao[]>("/estoque/movimentacoes");
  }

  await new Promise((resolver) => setTimeout(resolver, 300));
  return [...MOVIMENTACOES_EXEMPLO];
}

// Registra entrada ou saída. A API deve responder 409 quando a saída
// é maior que o saldo, e a tela usa isso para mostrar o aviso.
export async function registrarMovimentacao(nova: NovaMovimentacao): Promise<Movimentacao> {
  // Caminho provisório: confirmar com o Thiago quando o endpoint existir.
  if (!usarDadosDeExemplo) {
    return postJson<Movimentacao>("/estoque/movimentacoes", nova);
  }

  await new Promise((resolver) => setTimeout(resolver, 500));

  if (nova.tipo === "saida" && nova.quantidade > saldoExemplo()) {
    throw new ErroApi(409, "Saída maior que o saldo do estoque");
  }

  const registrada: Movimentacao = {
    ...nova,
    id: Math.max(0, ...MOVIMENTACOES_EXEMPLO.map((mov) => mov.id)) + 1,
    dataHora: new Date().toISOString(),
  };
  MOVIMENTACOES_EXEMPLO.unshift(registrada);
  return registrada;
}
