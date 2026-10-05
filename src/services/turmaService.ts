// Turmas de exemplo enquanto o endpoint de turmas não está pronto.
export async function listarTurmas(): Promise<string[]> {
  await new Promise((resolver) => setTimeout(resolver, 200));
  return ["Turma 1", "Turma 2", "Turma 3", "Venezuelanas"];
}
