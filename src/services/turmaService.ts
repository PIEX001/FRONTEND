import { getJson, usarDadosDeExemplo } from "./api";

// Turma como vem da API (GET /class).
type TurmaDaApi = {
  id: number;
  name: string;
  actived: boolean;
};

export type Turma = {
  id: number;
  nome: string;
};

// Turmas ativas com o id que a API usa nos filtros e cadastros.
export async function listarTurmasComId(): Promise<Turma[]> {
  if (!usarDadosDeExemplo) {
    const turmas = await getJson<TurmaDaApi[]>("/class");
    return turmas.filter((turma) => turma.actived).map((turma) => ({ id: turma.id, nome: turma.name }));
  }
  const nomes = await listarTurmas();
  return nomes.map((nome, indice) => ({ id: indice + 1, nome }));
}

// Id da turma pelo nome. As telas trabalham com o nome; a API, com o id.
export async function idDaTurma(nome: string): Promise<number | undefined> {
  if (!nome) return undefined;
  const turmas = await listarTurmasComId();
  return turmas.find((turma) => turma.nome === nome)?.id;
}

// Nomes das turmas, usados nos filtros e no cadastro de família.
export async function listarTurmas(): Promise<string[]> {
  if (!usarDadosDeExemplo) {
    return (await listarTurmasComId()).map((turma) => turma.nome);
  }

  await new Promise((resolver) => setTimeout(resolver, 200));
  return ["Turma 1", "Turma 2", "Turma 3", "Venezuelanas"];
}
