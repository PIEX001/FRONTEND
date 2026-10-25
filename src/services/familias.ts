import { apiConfigurada, getJson } from "./api";
import type { FamiliaDetalhe, FamiliaResumo, NovaFamilia } from "../types/familia";

const familiasExemplo: FamiliaDetalhe[] = [
  {
    id: 1,
    codigo: "0001",
    nomeResponsavel: "Maria Souza",
    endereco: "Rua das Flores, 123",
    turma: "Turma 1",
    totalMembros: 4,
    situacao: "pendente",
    dataReavaliacao: "2027-03-01",
    telefone: "(32) 99999-0001",
    observacoes: "Família acompanhada desde 2024.",
    membros: [],
  },
  {
    id: 2,
    codigo: "0002",
    nomeResponsavel: "João Pereira",
    endereco: "Av. Brasil, 456",
    turma: "Turma 2",
    totalMembros: 2,
    situacao: "reavaliacao-vencida",
    dataReavaliacao: "2026-07-01",
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
  return familiasExemplo.find((f) => f.id === Number(id)) ?? null;
}

export async function cadastrarFamilia(novaFamilia: NovaFamilia): Promise<FamiliaDetalhe> {
  if (apiConfigurada()) {
    return getJson<FamiliaDetalhe>("/familias");
  }
  // Dados fictícios: apenas simula o cadastro localmente
  const proximoId = familiasExemplo.length + 1;
  const daquiUmAno = new Date();
  daquiUmAno.setFullYear(daquiUmAno.getFullYear() + 1);
  const familiaCriada: FamiliaDetalhe = {
    nomeResponsavel: novaFamilia.nomeResponsavel,
    endereco: novaFamilia.endereco,
    telefone: novaFamilia.telefone,
    observacoes: novaFamilia.observacoes,
    totalMembros: novaFamilia.quantidadeMembros,
    id: proximoId,
    codigo: String(proximoId).padStart(4, "0"),
    turma: "Sem turma",
    situacao: "pendente",
    dataReavaliacao: daquiUmAno.toISOString().slice(0, 10),
    membros: [],
  };
  familiasExemplo.push(familiaCriada);
  return familiaCriada;
}
