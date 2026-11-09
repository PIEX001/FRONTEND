// Situação da família em relação à cesta do mês atual.
// "suspensa": cadastro inativo ou suspenso na API, não pode receber.
export type SituacaoEntrega = "pendente" | "recebida" | "reavaliacao-vencida" | "suspensa";

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
  dataReavaliacao?: string; // formato AAAA-MM-DD; a API ainda não informa
  membros: Membro[];
  endereco?: string; // vem do cadastro de família
  observacoes?: string;
};

export type Endereco = {
  cep: string;
  rua: string;
  numero: string; // só dígitos; a API guarda como número
  bairro?: string;
  complemento?: string;
  cidade: string;
  uf: string; // duas letras
};

// Estado civil na ordem da API (EMaritialStatus).
export const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "Separado(a)", "Divorciado(a)", "Viúvo(a)"] as const;

// Dados pessoais que a API pede de cada membro. Ficam protegidos: só administrador e
// assistente social veem depois.
export type DadosPessoais = {
  cpf: string;
  dataNascimento: string; // AAAA-MM-DD
  estadoCivil: number; // índice de ESTADOS_CIVIS
  nacionalidade: string;
  renda?: number; // renda mensal em reais
  escolaridade?: string;
  telefone?: string;
};

// O que a tela de cadastro de família envia. O responsável entra como primeiro membro,
// autorizado a retirar a cesta.
export type NovaFamilia = {
  nomeResponsavel: string;
  endereco: Endereco;
  turma: string;
  telefone?: string;
  quantidadeMembros: number;
  responsavel: DadosPessoais;
};

// O que a tela de cadastro de membros envia.
export type NovoMembro = Omit<Membro, "id"> & {
  dados: DadosPessoais;
};

// Endereço em uma linha, para mostrar na tela.
export function enderecoEmTexto(endereco: Endereco) {
  const numero = endereco.numero ? `, ${endereco.numero}` : "";
  const bairro = endereco.bairro ? ` - ${endereco.bairro}` : "";
  return `${endereco.rua}${numero}${bairro}, ${endereco.cidade}/${endereco.uf}`;
}
