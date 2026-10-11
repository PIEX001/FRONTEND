export type SituacaoFamilia = "ok" | "pendente" | "alerta";

export type Membro = {
  id: string;
  nome: string;
  parentesco: string;
  dataNascimento: string;
  autorizadoRetirar: boolean;
};

export type FamiliaResumo = {
  id: string;
  nomeResponsavel: string;
  endereco: string;
  quantidadeMembros: number;
  situacao: SituacaoFamilia;
};

export type FamiliaDetalhe = FamiliaResumo & {
  telefone: string;
  observacoes: string;
  membros: Membro[];
};