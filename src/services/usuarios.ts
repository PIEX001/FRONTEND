import { ErroApi, postJson, usarDadosDeExemplo } from "./api";
import { apenasDigitos } from "../utils/validacao";

// Funções que a administradora pode dar a um funcionário ou voluntário (cargo na API, ETypeDesignation).
export const FUNCOES = [
  { cargo: 5, nome: "Funcionário(a) ou voluntário(a)", descricao: "Busca e registro de entrega das cestas" },
  { cargo: 3, nome: "Assistente social", descricao: "Todas as telas, menos a Equipe" },
  { cargo: 1, nome: "Administrador(a)", descricao: "Todas as telas, inclusive a Equipe" },
] as const;

export type NovoUsuario = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string; // AAAA-MM-DD, precisa ter 18 anos ou mais
  cargo: number;
  senhaInicial: string;
};

// A API pede um endereço para cada usuário. Para a equipe usamos o da Casa
// (o mesmo da carga inicial do back), já que o endereço deles não é usado no sistema.
const ENDERECO_DA_CASA = {
  zipCode: "00000-000",
  street: "Rua Américo Lobo",
  neighborhood: "Manoel Honório",
  number: 703,
  complement: "Casa de São Francisco de Assis",
  city: "Juiz de Fora",
  state: "MG",
  country: "Brasil",
};

// Senha inicial ligada ao nome, fácil de ditar e digitar: primeiro nome sem acento + @ + números.
// Ex.: "Carlos Souza" vira "Carlos@4821". Os números são sorteados, então não dá para adivinhar
// só pelo nome, e no primeiro acesso a pessoa é obrigada a trocar.
// Já passa na regra de senha forte da API: maiúscula, minúscula, número, símbolo e 8 ou mais caracteres.
export function gerarSenhaInicial(nomeCompleto: string) {
  const primeiro = nomeCompleto.trim().split(/\s+/)[0] ?? "";
  const letras = primeiro.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "");
  // Nome com uma letra só não teria minúscula: usa "Cesta" no lugar.
  const base = letras.length >= 2 ? letras[0].toUpperCase() + letras.slice(1).toLowerCase() : "Cesta";
  // Nomes curtos (Ana, Lu) ganham mais números para chegar a 8 caracteres.
  const quantidade = Math.max(4, 7 - base.length);
  const sorteio = new Uint32Array(1);
  crypto.getRandomValues(sorteio);
  const numeros = String(sorteio[0] % 10 ** quantidade).padStart(quantidade, "0");
  return `${base}@${numeros}`;
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

// 409: e-mail já usado. 403: quem está logado não é administrador.
export async function cadastrarUsuario(novo: NovoUsuario): Promise<void> {
  if (usarDadosDeExemplo) {
    await new Promise((resolver) => setTimeout(resolver, 400));
    if (novo.email.trim().toLowerCase() === "admin") throw new ErroApi(409, "E-mail já usado");
    return;
  }
  await postJson<unknown>("/User/user/create", {
    name: novo.nome.trim(),
    birthDate: novo.dataNascimento,
    document: apenasDigitos(novo.cpf),
    phone: apenasDigitos(novo.telefone),
    asssigned: novo.cargo,
    email: novo.email.trim().toLowerCase(),
    password: novo.senhaInicial,
    idAddress: null,
    address: ENDERECO_DA_CASA,
    entryDate: hoje(),
  });
}

export type SenhaNova = { nome: string; email: string; senha: string };

// Para quem esqueceu a senha: a administradora gera uma nova, no mesmo formato da inicial.
// A pessoa volta a ter primeiro acesso (troca obrigatória) e as sessões abertas dela são encerradas.
// 404: e-mail sem login. 403: quem está logado não é administrador. 422: é o próprio e-mail.
export async function gerarNovaSenha(email: string): Promise<SenhaNova> {
  const emailLimpo = email.trim().toLowerCase();
  if (usarDadosDeExemplo) {
    await new Promise((resolver) => setTimeout(resolver, 400));
    const nome = emailLimpo.split("@")[0];
    return { nome, email: emailLimpo, senha: gerarSenhaInicial(nome) };
  }
  const resposta = await postJson<{ name: string; email: string; temporaryPassword: string }>(
    "/User/user/reset-password",
    { email: emailLimpo },
  );
  return { nome: resposta.name, email: resposta.email, senha: resposta.temporaryPassword };
}
