import { apiConfigurada, getJson } from "./api";
import type { Membro } from "../types/familia";

export async function cadastrarMembro(
  familiaId: string,
  novoMembro: Omit<Membro, "id">
): Promise<Membro> {
  if (apiConfigurada()) {
    return getJson<Membro>(`/familias/${familiaId}/membros`);
  }
  // Dados fictícioss
  return { ...novoMembro, id: Date.now() };
}