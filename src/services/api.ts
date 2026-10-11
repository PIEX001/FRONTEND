const urlApi = import.meta.env.VITE_API_URL as string | undefined;

export async function getJson<T>(caminho: string): Promise<T> {
  if (!urlApi) {
    throw new Error("API não configurada");
  }
  const resposta = await fetch(`${urlApi}${caminho}`);
  if (!resposta.ok) {
    throw new Error(`Erro na requisição: ${resposta.status}`);
  }
  return (await resposta.json()) as T;
}

export function apiConfigurada(): boolean {
  return Boolean(urlApi);
}