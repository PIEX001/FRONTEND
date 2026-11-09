// Quantas famílias já receberam a cesta no mês de referência.
export type ResumoEntregasMes = {
  mesReferencia: string; // formato AAAA-MM
  totalFamilias: number;
  familiasAtendidas: number;
};

// O que a tela manda para a API ao confirmar a entrega.
// Data e horário ficam por conta da API, para não depender do relógio do celular.
export type NovaEntrega = {
  familiaId: number;
  membroId: number; // quem está retirando
  funcionario: string; // provisório: sai daqui quando o login existir
};

// O que a API devolve depois de registrar a entrega.
export type EntregaRegistrada = NovaEntrega & {
  id: number;
  membroNome?: string; // a API grava o nome de quem retirou, mesmo se o membro sair da família
  dataHora: string; // formato ISO, ex.: 2026-10-25T14:32:00
};
