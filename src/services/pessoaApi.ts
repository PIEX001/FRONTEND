import type { DadosPessoais, Endereco } from "../types/familia";
import { apenasDigitos, separarNome } from "../utils/validacao";

// Conversões para o formato de pessoa e endereço da API .NET
// (PersonInformationDto e AddressDto). Usadas pelos cadastros de família e de membro.

export type EnderecoDaApi = {
  zipCode: string;
  street: string;
  neighborhood: string;
  number: number;
  complement: string;
  city: string;
  state: string;
  country: string;
};

export function enderecoParaApi(endereco: Endereco): EnderecoDaApi {
  const cep = apenasDigitos(endereco.cep);
  return {
    zipCode: `${cep.slice(0, 5)}-${cep.slice(5)}`,
    street: endereco.rua.trim(),
    neighborhood: endereco.bairro?.trim() ?? "",
    number: Number(apenasDigitos(endereco.numero)),
    complement: endereco.complemento?.trim() ?? "",
    city: endereco.cidade.trim(),
    state: endereco.uf.trim().toUpperCase(),
    country: "Brasil",
  };
}

export function pessoaParaApi(
  nomeCompleto: string,
  parentesco: string,
  autorizadoRetirar: boolean,
  dados: DadosPessoais,
  endereco: EnderecoDaApi,
) {
  const nome = separarNome(nomeCompleto);
  if (!nome) throw new Error("Nome sem sobrenome");
  const renda = dados.renda ?? 0;
  return {
    firstName: nome.nome,
    lastName: nome.sobrenome,
    fullName: null,
    birthDate: dados.dataNascimento,
    age: null,
    document: apenasDigitos(dados.cpf),
    baseSalary: renda,
    education: dados.escolaridade?.trim() ?? "",
    maritialStatus: dados.estadoCivil,
    itsWork: renda > 0,
    job: null,
    nationality: dados.nacionalidade.trim() || "Brasileira",
    address: endereco,
    phone: dados.telefone ? apenasDigitos(dados.telefone) : null,
    relationship: parentesco.trim(),
    canWithdraw: autorizadoRetirar,
    id: null,
  };
}
