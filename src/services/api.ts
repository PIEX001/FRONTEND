import { lerToken, sair } from "./sessao";

// Endereço da API .NET, definido no arquivo .env (veja o .env.example).
// Enquanto VITE_API_URL estiver vazio, os serviços usam os dados de exemplo.
// A barra do fim é tirada para não virar "//familias".
const API_URL: string = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");

export const usarDadosDeExemplo = API_URL === "";

// Mesmo teste ao contrário, usado pelos serviços de cadastro.
export function apiConfigurada() {
  return !usarDadosDeExemplo;
}

// Site em https chamando API em http: o navegador bloqueia todas as chamadas.
if (API_URL.startsWith("http://") && window.location.protocol === "https:") {
  console.error("VITE_API_URL usa http://. O navegador vai bloquear as chamadas; use https://.");
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

// Toda chamada passa por aqui: manda o token e trata a sessão vencida.
async function chamar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = lerToken();
  const cabecalhos = new Headers(opcoes.headers);
  if (token) {
    cabecalhos.set("Authorization", `Bearer ${token}`);
  }

  const resposta = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers: cabecalhos });

  // Token vencido ou recusado: sai e volta para o login com aviso.
  // Sem token (a própria tela de login), o 401 só quer dizer senha errada.
  if (resposta.status === 401 && token) {
    sair();
    window.location.assign("/login?sessao=expirada");
  }
  if (!resposta.ok) {
    throw new ErroApi(resposta.status, `Erro ${resposta.status} ao chamar ${caminho}`);
  }
  return (await resposta.json()) as T;
}

// Faz um GET na API e devolve o JSON. Dá erro se a resposta não for 2xx,
// e esse erro é o que faz as telas mostrarem o aviso de falha.
export function getJson<T>(caminho: string): Promise<T> {
  return chamar<T>(caminho);
}

// Faz um POST com corpo em JSON e devolve o JSON da resposta.
export function postJson<T>(caminho: string, corpo: unknown): Promise<T> {
  return chamar<T>(caminho, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
}
