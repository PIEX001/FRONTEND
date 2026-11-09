import { apiConfigurada, postJson } from "./api";
import type { Membro } from "../types/familia";
import { adicionarMembroExemplo } from "./familiaService";

// Cadastro de membro de uma família. Caminho provisório: confirmar com o Thiago.
export async function cadastrarMembro(familiaId: number, novoMembro: Omit<Membro, "id">): Promise<Membro> {
  if (apiConfigurada()) {
    return postJson<Membro>(`/familias/${familiaId}/membros`, novoMembro);
  }
  // Dados de exemplo: o membro aparece na tela de entrega da família.
  await new Promise((resolver) => setTimeout(resolver, 300));
  const membro = adicionarMembroExemplo(familiaId, novoMembro);
  if (!membro) throw new Error("Família não encontrada");
  return membro;
}
