import { apiConfigurada, ErroApi, getJson, postJson } from "./api";
import type { FamiliaDetalhe, NovaFamilia } from "../types/familia";
import { enderecoEmTexto } from "../types/familia";
import { adicionarFamiliaExemplo } from "./familiaService";
import { enderecoParaApi, pessoaParaApi } from "./pessoaApi";
import { idDaTurma } from "./turmaService";
import { apenasDigitos } from "../utils/validacao";

type FamiliaCriadaDaApi = { id: number; code: string; name: string; membersCount: number; deliveryClassName: string | null };

// Cadastro de família. O responsável vai junto como primeiro membro, autorizado a retirar.
// Se a API recusar o responsável (CPF já cadastrado, por exemplo), a família é criada sem membros
// e totalMembros volta 0: a tela avisa para cadastrar pelo cadastro de membros.
export async function cadastrarFamilia(nova: NovaFamilia): Promise<FamiliaDetalhe> {
  if (apiConfigurada()) {
    const endereco = enderecoParaApi(nova.endereco);
    const resposta = await postJson<string>("/family/", {
      name: nova.nomeResponsavel.trim(),
      amount: nova.quantidadeMembros,
      phone: nova.telefone ? apenasDigitos(nova.telefone) : null,
      address: endereco,
      deliveryClassId: (await idDaTurma(nova.turma)) ?? null,
      members: [pessoaParaApi(nova.nomeResponsavel, "Responsável", true, nova.responsavel, endereco)],
    });

    // A API devolve um texto com o código entre parênteses, ex.: "Família cadastrada (F00012)".
    const codigo = /\(([^)]+)\)/.exec(resposta ?? "")?.[1];
    if (!codigo) throw new ErroApi(500, "A API não informou o código da família");
    const encontradas = await getJson<FamiliaCriadaDaApi[]>(`/family?term=${encodeURIComponent(codigo)}`);
    const criada = encontradas.find((familia) => familia.code === codigo);
    if (!criada) throw new ErroApi(500, "Família cadastrada, mas não encontrada na busca");

    return {
      id: criada.id,
      codigo: criada.code,
      nomeResponsavel: criada.name,
      telefone: nova.telefone,
      turma: criada.deliveryClassName ?? nova.turma,
      totalMembros: criada.membersCount,
      situacao: "pendente",
      membros: [],
      endereco: enderecoEmTexto(nova.endereco),
    };
  }
  // Dados de exemplo: a família entra na busca na mesma hora.
  await new Promise((resolver) => setTimeout(resolver, 300));
  return adicionarFamiliaExemplo(nova);
}
