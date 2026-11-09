import { apiConfigurada, postJson } from "./api";
import type { FamiliaDetalhe, NovaFamilia } from "../types/familia";
import { adicionarFamiliaExemplo } from "./familiaService";

// Cadastro de família. Caminho provisório: confirmar com o Thiago.
export async function cadastrarFamilia(novaFamilia: NovaFamilia): Promise<FamiliaDetalhe> {
  if (apiConfigurada()) {
    return postJson<FamiliaDetalhe>("/familias", novaFamilia);
  }
  // Dados de exemplo: a família entra na busca na mesma hora.
  await new Promise((resolver) => setTimeout(resolver, 300));
  return adicionarFamiliaExemplo(novaFamilia);
}
