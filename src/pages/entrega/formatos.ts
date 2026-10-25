// Funções de data usadas nas telas de entrega.

// "2026-10-25T14:32:00" vira "25/10/2026, 14:32".
export function dataHoraCurta(iso: string) {
  const data = new Date(iso);
  const dia = data.toLocaleDateString("pt-BR");
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia}, ${hora}`;
}

// "2026-10-25T14:32:00" vira "25/10/2026".
export function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

// Diz se a data cai no mês atual, no fuso do aparelho.
export function ehDesteMes(iso: string) {
  const data = new Date(iso);
  const hoje = new Date();
  return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
}

// Nome do mês atual, ex.: "outubro".
export function mesAtualPorExtenso() {
  return new Date().toLocaleDateString("pt-BR", { month: "long" });
}
