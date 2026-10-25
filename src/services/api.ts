// Endereço da API .NET, definido no arquivo .env (veja o .env.example).
// Enquanto VITE_API_URL estiver vazio, os serviços usam os dados de exemplo.
const API_URL: string = import.meta.env.VITE_API_URL ?? "";

export const usarDadosDeExemplo = API_URL === "";

// Mesmo teste ao contrário, usado pelos serviços de cadastro.
export function apiConfigurada() {
  return !usarDadosDeExemplo;
}

// Erro de chamada à API. O status deixa a tela tratar casos específicos,
// como o 409 de entrega já registrada no mês.
export class ErroApi extends Error {
  status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

// Faz um GET na API e devolve o JSON. Dá erro se a resposta não for 2xx,
// e esse erro é o que faz as telas mostrarem o aviso de falha.
export async function getJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`);
  if (!resposta.ok) {
    throw new ErroApi(resposta.status, `Erro ${resposta.status} ao chamar ${caminho}`);
  }
  return (await resposta.json()) as T;
}

// Faz um POST com corpo em JSON e devolve o JSON da resposta.
export async function postJson<T>(caminho: string, corpo: unknown): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  if (!resposta.ok) {
    throw new ErroApi(resposta.status, `Erro ${resposta.status} ao chamar ${caminho}`);
  }
  return (await resposta.json()) as T;
}
