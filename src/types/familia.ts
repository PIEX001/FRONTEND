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

export type Membro = {
  id: number;
  nome: string;
  parentesco: string; // "Responsável", "Filho", "Esposa"...
  autorizadoRetirar: boolean;
  dataNascimento?: string; // formato AAAA-MM-DD, vem do cadastro de membros
};

// Dados completos usados na tela de registro de entrega.
export type FamiliaDetalhe = FamiliaResumo & {
  dataReavaliacao: string; // formato AAAA-MM-DD
  membros: Membro[];
  endereco?: string; // vem do cadastro de família
  observacoes?: string;
};

// O que a tela de cadastro de família envia.
export type NovaFamilia = {
  nomeResponsavel: string;
  endereco: string;
  telefone?: string;
  observacoes?: string;
  quantidadeMembros: number;
};
