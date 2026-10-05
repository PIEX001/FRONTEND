// Endereço da API .NET, definido no arquivo .env (veja o .env.example).
// Enquanto VITE_API_URL estiver vazio, os serviços usam os dados de exemplo.
const API_URL: string = import.meta.env.VITE_API_URL ?? "";

export const usarDadosDeExemplo = API_URL === "";

// Faz um GET na API e devolve o JSON. Dá erro se a resposta não for 2xx,
// e esse erro é o que faz as telas mostrarem o aviso de falha.
export async function getJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`);
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao chamar ${caminho}`);
  }
  return (await resposta.json()) as T;
}
