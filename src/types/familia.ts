// Situação da família em relação à cesta do mês atual.
export type SituacaoEntrega = "pendente" | "recebida" | "reavaliacao-vencida";

// Dados resumidos que aparecem em cada item da lista de busca.
// Os nomes dos campos serão ajustados quando o endpoint de famílias for definido.
export type FamiliaResumo = {
  id: number;
  codigo: string;
  nomeResponsavel: string;
  telefone?: string;
  turma: string;
  totalMembros: number;
  situacao: SituacaoEntrega;
  dataUltimaEntrega?: string; // formato AAAA-MM-DD
};
