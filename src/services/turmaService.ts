import { getJson, usarDadosDeExemplo } from "./api";

// Turmas de exemplo enquanto o endpoint de turmas não está pronto.
export async function listarTurmas(): Promise<string[]> {
  // Caminho provisório: confirmar com o Thiago quando o endpoint existir.
  if (!usarDadosDeExemplo) {
    return getJson<string[]>("/turmas");
  }

  await new Promise((resolver) => setTimeout(resolver, 200));
  return ["Turma 1", "Turma 2", "Turma 3", "Venezuelanas"];
}
