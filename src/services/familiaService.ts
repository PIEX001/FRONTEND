import type { FamiliaDetalhe, FamiliaResumo, Membro, NovaFamilia, SituacaoEntrega } from "../types/familia";
import { getJson, usarDadosDeExemplo } from "./api";
import { entregaDoMesExemplo } from "./entregaService";

// Dados de exemplo enquanto o endpoint de famílias não está pronto.
// Quando a API existir, só a função buscarFamilias muda; a tela continua igual.
// A situação de cada família é calculada pelas entregas de exemplo (veja situacaoExemplo).
const FAMILIAS_EXEMPLO: FamiliaResumo[] = [
  { id: 1, codigo: "0148", nomeResponsavel: "Rosângela Aparecida da Silva", telefone: "(32) 99812-4410", turma: "Turma 1", totalMembros: 4, situacao: "pendente" },
  { id: 2, codigo: "0032", nomeResponsavel: "José Carlos Silva Moreira", telefone: "(32) 98455-1023", turma: "Turma 3", totalMembros: 2, situacao: "pendente" },
  { id: 3, codigo: "0201", nomeResponsavel: "Adriana Silva Rezende", telefone: "(32) 99104-7788", turma: "Turma 2", totalMembros: 5, situacao: "reavaliacao-vencida" },
  { id: 4, codigo: "0117", nomeResponsavel: "Marcos Antônio da Silva", turma: "Turma 1", totalMembros: 3, situacao: "pendente" },
  { id: 5, codigo: "0089", nomeResponsavel: "Yelitza Carolina Pérez", telefone: "(32) 98871-3302", turma: "Venezuelanas", totalMembros: 6, situacao: "pendente" },
];

// Tira acentos e deixa em minúsculas, para "jose" encontrar "José".
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Data de hoje no formato AAAA-MM-DD, no fuso do aparelho.
function hojeAAAAMMDD() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

// Situação da família no mês, igual a API deve calcular:
// recebeu no mês > reavaliação vencida > ainda não recebeu.
function situacaoExemplo(familia: FamiliaResumo): FamiliaResumo {
  const entrega = entregaDoMesExemplo(familia.id);
  if (entrega) {
    const data = new Date(entrega.dataHora);
    const dataUltimaEntrega = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(
      data.getDate(),
    ).padStart(2, "0")}`;
    return { ...familia, situacao: "recebida", dataUltimaEntrega };
  }
  const reavaliacao = DETALHES_EXEMPLO[familia.id]?.dataReavaliacao;
  const situacao: SituacaoEntrega = reavaliacao && reavaliacao <= hojeAAAAMMDD() ? "reavaliacao-vencida" : "pendente";
  return { ...familia, situacao, dataUltimaEntrega: undefined };
}

export async function buscarFamilias(termo: string): Promise<FamiliaResumo[]> {
  // Caminho provisório: confirmar com o Thiago quando o endpoint existir.
  // Com busca vazia, a API deve devolver todas as famílias ativas.
  if (!usarDadosDeExemplo) {
    return getJson<FamiliaResumo[]>(`/familias?busca=${encodeURIComponent(termo)}`);
  }

  // Atraso falso, só para conseguirmos ver o estado de carregamento na tela.
  await new Promise((resolver) => setTimeout(resolver, 400));

  const familias = FAMILIAS_EXEMPLO.map(situacaoExemplo);
  const texto = normalizar(termo);
  if (!texto) return familias; // campo vazio: todas as famílias
  const digitos = termo.replace(/\D/g, "");

  return familias.filter(
    (familia) =>
      normalizar(familia.nomeResponsavel).includes(texto) ||
      familia.codigo.includes(texto) ||
      (digitos.length >= 4 && (familia.telefone ?? "").replace(/\D/g, "").includes(digitos)),
  );
}

// Detalhes de exemplo de cada família, pelo id.
const DETALHES_EXEMPLO: Record<number, { dataReavaliacao: string; membros: Membro[] }> = {
  1: {
    dataReavaliacao: "2027-03-01",
    membros: [
      { id: 11, nome: "Rosângela Aparecida da Silva", parentesco: "Responsável", autorizadoRetirar: true },
      { id: 12, nome: "Bruno da Silva Costa", parentesco: "Filho", autorizadoRetirar: true },
      { id: 13, nome: "Kátia da Silva Costa", parentesco: "Filha", autorizadoRetirar: true },
      { id: 14, nome: "Pedro da Silva Costa", parentesco: "Neto", autorizadoRetirar: false },
    ],
  },
  2: {
    dataReavaliacao: "2027-01-01",
    membros: [
      { id: 21, nome: "José Carlos Silva Moreira", parentesco: "Responsável", autorizadoRetirar: true },
      { id: 22, nome: "Ana Paula Moreira", parentesco: "Esposa", autorizadoRetirar: true },
    ],
  },
  3: {
    dataReavaliacao: "2026-07-01",
    membros: [
      { id: 31, nome: "Adriana Silva Rezende", parentesco: "Responsável", autorizadoRetirar: true },
      { id: 32, nome: "Lucas Rezende Pinto", parentesco: "Marido", autorizadoRetirar: true },
      { id: 33, nome: "Júlia Rezende Pinto", parentesco: "Filha", autorizadoRetirar: true },
      { id: 34, nome: "Davi Rezende Pinto", parentesco: "Filho", autorizadoRetirar: false },
      { id: 35, nome: "Laura Rezende Pinto", parentesco: "Filha", autorizadoRetirar: false },
    ],
  },
  4: {
    dataReavaliacao: "2027-02-01",
    membros: [
      { id: 41, nome: "Marcos Antônio da Silva", parentesco: "Responsável", autorizadoRetirar: true },
      { id: 42, nome: "Cláudia Ribeiro da Silva", parentesco: "Esposa", autorizadoRetirar: true },
      { id: 43, nome: "Enzo Ribeiro da Silva", parentesco: "Filho", autorizadoRetirar: false },
    ],
  },
  5: {
    dataReavaliacao: "2027-04-01",
    membros: [
      { id: 51, nome: "Yelitza Carolina Pérez", parentesco: "Responsável", autorizadoRetirar: true },
      { id: 52, nome: "Luis Alberto Pérez", parentesco: "Marido", autorizadoRetirar: true },
      { id: 53, nome: "Daniela Pérez", parentesco: "Filha", autorizadoRetirar: false },
      { id: 54, nome: "Andrés Pérez", parentesco: "Filho", autorizadoRetirar: false },
      { id: 55, nome: "Sofía Pérez", parentesco: "Filha", autorizadoRetirar: false },
      { id: 56, nome: "Mateo Pérez", parentesco: "Filho", autorizadoRetirar: false },
    ],
  },
};

// Devolve null quando a família não existe.
export async function buscarFamiliaPorId(id: number): Promise<FamiliaDetalhe | null> {
  // Caminho provisório: confirmar com o Thiago quando o endpoint existir.
  if (!usarDadosDeExemplo) {
    return getJson<FamiliaDetalhe>(`/familias/${id}`);
  }

  await new Promise((resolver) => setTimeout(resolver, 300));

  const resumo = FAMILIAS_EXEMPLO.find((familia) => familia.id === id);
  const detalhes = DETALHES_EXEMPLO[id];
  if (!resumo || !detalhes) return null;

  return { ...situacaoExemplo(resumo), ...detalhes, membros: [...detalhes.membros] };
}

// Cadastro de família nos dados de exemplo: entra na busca na mesma hora.
// O responsável já vira membro autorizado a retirar.
export function adicionarFamiliaExemplo(nova: NovaFamilia): FamiliaDetalhe {
  const id = Math.max(0, ...FAMILIAS_EXEMPLO.map((familia) => familia.id)) + 1;
  const resumo: FamiliaResumo = {
    id,
    codigo: String(300 + id).padStart(4, "0"),
    nomeResponsavel: nova.nomeResponsavel,
    telefone: nova.telefone || undefined,
    turma: nova.turma,
    totalMembros: 1,
    situacao: "pendente",
  };
  const detalhes = {
    dataReavaliacao: `${new Date().getFullYear() + 1}${hojeAAAAMMDD().slice(4)}`, // reavaliação em um ano
    membros: [{ id: id * 10 + 1, nome: nova.nomeResponsavel, parentesco: "Responsável", autorizadoRetirar: true }],
  };
  FAMILIAS_EXEMPLO.push(resumo);
  DETALHES_EXEMPLO[id] = detalhes;
  return { ...resumo, ...detalhes, endereco: nova.endereco, observacoes: nova.observacoes };
}

// Cadastro de membro nos dados de exemplo: aparece na tela de entrega da família.
export function adicionarMembroExemplo(familiaId: number, novo: Omit<Membro, "id">): Membro | null {
  const familia = FAMILIAS_EXEMPLO.find((item) => item.id === familiaId);
  const detalhes = DETALHES_EXEMPLO[familiaId];
  if (!familia || !detalhes) return null;

  const membro: Membro = { ...novo, id: Math.max(familiaId * 10, ...detalhes.membros.map((m) => m.id)) + 1 };
  detalhes.membros.push(membro);
  familia.totalMembros += 1;
  return membro;
}
