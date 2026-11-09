import type { DadosPessoais } from "../types/familia";
import { cpfValido } from "./validacao";

export const DADOS_PESSOAIS_VAZIOS: DadosPessoais = {
  cpf: "",
  dataNascimento: "",
  estadoCivil: 0,
  nacionalidade: "Brasileira",
};

// Devolve a mensagem do primeiro problema, ou "" se está tudo certo.
export function conferirDadosPessoais(dados: DadosPessoais) {
  if (!dados.cpf.trim() || !dados.dataNascimento || !dados.nacionalidade.trim()) {
    return "Preencha CPF, data de nascimento e nacionalidade.";
  }
  if (!cpfValido(dados.cpf)) return "O CPF não está correto. Confira os números.";
  if (dados.dataNascimento >= new Date().toISOString().slice(0, 10)) return "A data de nascimento precisa ser antes de hoje.";
  return "";
}
