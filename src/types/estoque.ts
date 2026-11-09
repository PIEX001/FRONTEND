// Controle de estoque de cestas prontas, sem detalhar os produtos de cada cesta.

export type TipoMovimentacao = "entrada" | "saida";

// O que a tela manda para a API ao registrar uma entrada ou saída.
// Data e horário ficam por conta da API, como na entrega.
export type NovaMovimentacao = {
  tipo: TipoMovimentacao;
  quantidade: number; // número de cestas, sempre positivo
  motivo: string; // "Doação", "Perda ou avaria"...
  observacao?: string;
  funcionario: string; // provisório: sai daqui quando o token tiver o usuário
};

// Movimentação já registrada, como vem da API.
export type Movimentacao = NovaMovimentacao & {
  id: number;
  dataHora: string; // formato ISO
};

// Saldo atual de cestas no estoque.
export type SaldoEstoque = {
  saldo: number;
  atualizadoEm?: string; // formato ISO, data da última movimentação (vazio se não houver)
};
