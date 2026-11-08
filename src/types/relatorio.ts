// Relatório mensal de entregas, por turma.

// Uma linha da lista de entregas do relatório.
export type EntregaDoRelatorio = {
  id: number;
  dataHora: string; // formato ISO
  familiaCodigo: string;
  familiaNome: string; // nome do responsável
  turma: string;
  retiradoPor: string; // nome de quem retirou
  funcionario: string;
};

// Quantas famílias de cada turma já receberam no mês.
export type ResumoTurma = {
  turma: string;
  totalFamilias: number;
  familiasAtendidas: number;
};

// O que a API devolve para o mês e a turma escolhidos.
export type RelatorioEntregas = {
  mesReferencia: string; // formato AAAA-MM
  totalFamilias: number;
  familiasAtendidas: number;
  cestasEntregues: number; // pode passar das famílias se houver 2 retiradas no mês
  porTurma: ResumoTurma[];
  entregas: EntregaDoRelatorio[]; // da mais recente para a mais antiga
};
