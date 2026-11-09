import type { Movimentacao, NovaMovimentacao, SaldoEstoque } from "../types/estoque";
import { ErroApi, getJson, postJson, usarDadosDeExemplo } from "./api";

// Motivos oferecidos na tela para cada tipo de movimentação.
// As saídas por entrega às famílias não entram aqui: a API deve baixar
// uma cesta do estoque a cada entrega registrada (confirmar com o Thiago).
export const MOTIVOS = {
  entrada: ["Doação", "Compra", "Ajuste de contagem"],
  saida: ["Perda ou avaria", "Repasse a outra instituição", "Ajuste de contagem"],
} as const;

// ---------------------------------------------------------------------------
// Formato da API .NET (StockController). A tela controla cestas prontas: usamos
// o primeiro tipo de cesta ativo, o mesmo que a API baixa a cada entrega.

type CestaDaApi = { id: number; balance: number; actived: boolean };
type MovimentacaoDaApi = {
  id: number;
  type: number; // 1 entrada, 2 saída
  reason: number;
  quantity: number;
  movementDate: string;
  userName: string;
  observation: string | null;
};

const MOTIVO_DA_API: Record<number, string> = {
  1: "Doação",
  2: "Compra",
  3: "Montagem de cestas",
  4: "Entrega às famílias",
  5: "Ajuste de contagem",
  6: "Perda ou avaria",
};

// A API não tem "repasse": vai como ajuste, com o motivo no começo da observação.
const REPASSE = "Repasse a outra instituição";

function motivoParaApi(motivo: string): number {
  if (motivo === "Doação") return 1;
  if (motivo === "Compra") return 2;
  if (motivo === "Perda ou avaria") return 6;
  return 5; // Ajuste de contagem e repasse
}

function movimentacaoDaApi(mov: MovimentacaoDaApi): Movimentacao {
  let motivo = MOTIVO_DA_API[mov.reason] ?? "Outro";
  let observacao = mov.observation ?? undefined;
  if (mov.reason === 5 && observacao?.startsWith(REPASSE)) {
    motivo = REPASSE;
    observacao = observacao.slice(REPASSE.length).replace(/^[:\s.-]+/, "") || undefined;
  }
  return {
    id: mov.id,
    tipo: mov.type === 1 ? "entrada" : "saida",
    quantidade: mov.quantity,
    motivo,
    observacao,
    funcionario: mov.userName,
    dataHora: mov.movementDate,
  };
}

async function cestaPadrao(): Promise<CestaDaApi> {
  const saldo = await getJson<{ baskets: CestaDaApi[] }>("/stock/balance");
  const cesta = saldo.baskets.filter((item) => item.actived).sort((a, b) => a.id - b.id)[0];
  if (!cesta) throw new ErroApi(404, "Nenhum tipo de cesta cadastrado");
  return cesta;
}

async function movimentacoesDaApi(cestaId: number): Promise<Movimentacao[]> {
  const lista = await getJson<MovimentacaoDaApi[]>(`/stock/movement?basketTypeId=${cestaId}`);
  return lista.map(movimentacaoDaApi).sort((a, b) => b.dataHora.localeCompare(a.dataHora));
}

// ---------------------------------------------------------------------------

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
  if (!usarDadosDeExemplo) {
    const cesta = await cestaPadrao();
    const movimentacoes = await movimentacoesDaApi(cesta.id);
    return { saldo: cesta.balance, atualizadoEm: movimentacoes[0]?.dataHora };
  }

  await new Promise((resolver) => setTimeout(resolver, 300));
  return { saldo: saldoExemplo(), atualizadoEm: MOVIMENTACOES_EXEMPLO[0].dataHora };
}

// Movimentações da mais recente para a mais antiga.
export async function listarMovimentacoes(): Promise<Movimentacao[]> {
  if (!usarDadosDeExemplo) {
    return movimentacoesDaApi((await cestaPadrao()).id);
  }

  await new Promise((resolver) => setTimeout(resolver, 300));
  return [...MOVIMENTACOES_EXEMPLO];
}

// Registra entrada ou saída. A API deve responder 409 quando a saída
// é maior que o saldo, e a tela usa isso para mostrar o aviso.
export async function registrarMovimentacao(nova: NovaMovimentacao): Promise<Movimentacao> {
  // O funcionário não vai no corpo: a API usa quem está logado.
  if (!usarDadosDeExemplo) {
    const cesta = await cestaPadrao();
    const observacao = nova.motivo === REPASSE ? [REPASSE, nova.observacao].filter(Boolean).join(": ") : nova.observacao;
    try {
      await postJson<unknown>("/stock/movement/", {
        productId: null,
        basketTypeId: cesta.id,
        type: nova.tipo === "entrada" ? 1 : 2,
        reason: motivoParaApi(nova.motivo),
        quantity: nova.quantidade,
        observation: observacao || null,
      });
    } catch (falha) {
      // A API responde 422 quando a saída passa do saldo; a tela espera 409 para esse caso.
      if (falha instanceof ErroApi && falha.status === 422 && nova.tipo === "saida") {
        throw new ErroApi(409, "Saída maior que o saldo do estoque");
      }
      throw falha;
    }
    // A API não devolve a movimentação; a tela recarrega a lista logo depois.
    return { ...nova, id: Date.now(), dataHora: new Date().toISOString() };
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
