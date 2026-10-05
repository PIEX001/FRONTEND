// Quantas famílias já receberam a cesta no mês de referência.
export type ResumoEntregasMes = {
  mesReferencia: string; // formato AAAA-MM
  totalFamilias: number;
  familiasAtendidas: number;
};
