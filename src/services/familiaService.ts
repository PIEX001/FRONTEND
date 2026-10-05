import type { FamiliaResumo } from "../types/familia";

// Dados de exemplo enquanto o endpoint de famílias não está pronto.
// Quando a API existir, só a função buscarFamilias muda; a tela continua igual.
const FAMILIAS_EXEMPLO: FamiliaResumo[] = [
  { id: 1, codigo: "0148", nomeResponsavel: "Rosângela Aparecida da Silva", telefone: "(32) 99812-4410", turma: "Turma 1", totalMembros: 4, situacao: "pendente" },
  { id: 2, codigo: "0032", nomeResponsavel: "José Carlos Silva Moreira", telefone: "(32) 98455-1023", turma: "Turma 3", totalMembros: 2, situacao: "recebida", dataUltimaEntrega: "2026-09-09" },
  { id: 3, codigo: "0201", nomeResponsavel: "Adriana Silva Rezende", telefone: "(32) 99104-7788", turma: "Turma 2", totalMembros: 5, situacao: "reavaliacao-vencida" },
  { id: 4, codigo: "0117", nomeResponsavel: "Marcos Antônio da Silva", turma: "Turma 1", totalMembros: 3, situacao: "pendente" },
  { id: 5, codigo: "0089", nomeResponsavel: "Yelitza Carolina Pérez", telefone: "(32) 98871-3302", turma: "Venezuelanas", totalMembros: 6, situacao: "pendente" },
];

// Tira acentos e deixa em minúsculas, para "jose" encontrar "José".
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export async function buscarFamilias(termo: string): Promise<FamiliaResumo[]> {
  // Atraso falso, só para conseguirmos ver o estado de carregamento na tela.
  await new Promise((resolver) => setTimeout(resolver, 400));

  const texto = normalizar(termo);
  if (!texto) return [];
  const digitos = termo.replace(/\D/g, "");

  return FAMILIAS_EXEMPLO.filter(
    (familia) =>
      normalizar(familia.nomeResponsavel).includes(texto) ||
      familia.codigo.includes(texto) ||
      (digitos.length >= 4 && (familia.telefone ?? "").replace(/\D/g, "").includes(digitos)),
  );
}
