import { apiConfigurada, getJson } from "./api";
import type { FamiliaDetalhe, FamiliaResumo } from "../types/familia";

const familiasExemplo: FamiliaDetalhe[] = [
  {
    id: "1",
    nomeResponsavel: "Maria Souza",
    endereco: "Rua das Flores, 123",
    quantidadeMembros: 4,
    situacao: "ok",
    telefone: "(32) 99999-0001",
    observacoes: "Família acompanhada desde 2024.",
    membros: [],
  },
  {
    id: "2",
    nomeResponsavel: "João Pereira",
    endereco: "Av. Brasil, 456",
    quantidadeMembros: 2,
    situacao: "pendente",
    telefone: "(32) 99999-0002",
    observacoes: "Reavaliação do cadastro pendente.",
    membros: [],
  },
];

export async function listarFamilias(): Promise<FamiliaResumo[]> {
  if (apiConfigurada()) {
    return getJson<FamiliaResumo[]>("/familias");
  }
  return familiasExemplo;
}

export async function obterFamilia(id: string): Promise<FamiliaDetalhe | null> {
  if (apiConfigurada()) {
    return getJson<FamiliaDetalhe>(`/familias/${id}`);
  }
  return familiasExemplo.find((f) => f.id === id) ?? null;
}

export async function cadastrarFamilia(
  novaFamilia: Omit<FamiliaDetalhe, "id" | "situacao" | "membros">
): Promise<FamiliaDetalhe> {
  if (apiConfigurada()) {
    return getJson<FamiliaDetalhe>("/familias");
  }
  // Dados fictícios: apenas simula o cadastro localmente
  const familiaCriada: FamiliaDetalhe = {
    ...novaFamilia,
    id: String(Date.now()),
    situacao: "pendente",
    membros: [],
  };
  familiasExemplo.push(familiaCriada);
  return familiaCriada;
}