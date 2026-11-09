import { lerToken, sair } from "./sessao";

// Endereço da API .NET, definido no arquivo .env (veja o .env.example).
// Enquanto VITE_API_URL estiver vazio, os serviços usam os dados de exemplo.
// A barra do fim é tirada para não virar "//family".
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

// ---------------------------------------------------------------------------
// Servidor lento: o Render gratuito dorme depois de 15 minutos sem uso e leva
// perto de 1 minuto para acordar. Chamadas que passam de alguns segundos
// avisam a tela (veja o componente AvisoServidor).

const ESPERA_ANTES_DO_AVISO = 4000;
let chamadasDemoradas = 0;
const ouvintes = new Set<(demorando: boolean) => void>();

function avisarOuvintes() {
  ouvintes.forEach((ouvinte) => ouvinte(chamadasDemoradas > 0));
}

export function aoMudarServidorLento(ouvinte: (demorando: boolean) => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

// Chamada sem login que só serve para o servidor começar a acordar
// enquanto a pessoa digita usuário e senha.
export function acordarServidor() {
  if (usarDadosDeExemplo) return;
  fetch(`${API_URL}/health`).catch(() => {
    // Sem conexão: a tela avisa quando a pessoa tentar entrar.
  });
}

// ---------------------------------------------------------------------------

type Opcoes = RequestInit & {
  token?: string; // usado logo depois do login, antes de a sessão ser salva
};

// Toda chamada passa por aqui: manda o token, trata a sessão vencida e avisa da demora.
async function chamar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { token: tokenInformado, ...init } = opcoes;
  const token = tokenInformado ?? lerToken();
  const cabecalhos = new Headers(init.headers);
  if (token) {
    cabecalhos.set("Authorization", `Bearer ${token}`);
  }

  let demorou = false;
  const relogio = setTimeout(() => {
    demorou = true;
    chamadasDemoradas += 1;
    avisarOuvintes();
  }, ESPERA_ANTES_DO_AVISO);

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, { ...init, headers: cabecalhos });
  } finally {
    clearTimeout(relogio);
    if (demorou) {
      chamadasDemoradas -= 1;
      avisarOuvintes();
    }
  }

  // Token vencido ou recusado: sai e volta para o login com aviso.
  // Sem token (a própria tela de login), o 401 só quer dizer senha errada.
  if (resposta.status === 401 && token && !tokenInformado) {
    sair();
    window.location.assign("/login?sessao=expirada");
  }
  if (!resposta.ok) {
    throw new ErroApi(resposta.status, `Erro ${resposta.status} ao chamar ${caminho}`);
  }
  // 204 e respostas vazias não têm corpo. Várias rotas do back devolvem só um texto
  // (ex.: "Senha alterada com sucesso"), sem JSON: nesse caso devolve o texto como está.
  const texto = await resposta.text();
  if (!texto) return undefined as T;
  try {
    return JSON.parse(texto) as T;
  } catch {
    return texto as T;
  }
}

// Faz um GET na API e devolve o JSON. Dá erro se a resposta não for 2xx,
// e esse erro é o que faz as telas mostrarem o aviso de falha.
export function getJson<T>(caminho: string, token?: string): Promise<T> {
  return chamar<T>(caminho, { token });
}

function enviarJson<T>(metodo: string, caminho: string, corpo: unknown): Promise<T> {
  return chamar<T>(caminho, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

// Faz um POST com corpo em JSON e devolve o JSON da resposta.
export function postJson<T>(caminho: string, corpo: unknown): Promise<T> {
  return enviarJson<T>("POST", caminho, corpo);
}

export function patchJson<T>(caminho: string, corpo: unknown): Promise<T> {
  return enviarJson<T>("PATCH", caminho, corpo);
}
