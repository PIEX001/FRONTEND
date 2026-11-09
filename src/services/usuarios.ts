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

// Senha inicial fácil de ditar e digitar, que já passa na regra de senha forte.
// No primeiro acesso a pessoa é obrigada a trocar.
export function gerarSenhaInicial() {
  const numeros = new Uint32Array(1);
  crypto.getRandomValues(numeros);
  return `Cesta@${String(numeros[0] % 10000).padStart(4, "0")}`;
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
