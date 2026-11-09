import { apiConfigurada, ErroApi, getJson, postJson } from "./api";
import type { Membro, NovoMembro } from "../types/familia";
import { adicionarMembroExemplo } from "./familiaService";
import { pessoaParaApi, type EnderecoDaApi } from "./pessoaApi";

type RespostaMembros = {
  message: string;
  rejected: unknown[]; // membros que a API não aceitou (ex.: CPF já cadastrado em outra família)
};

// Cadastro de membro de uma família. O endereço é o mesmo da família.
export async function cadastrarMembro(familiaId: number, novo: NovoMembro): Promise<Membro> {
  if (apiConfigurada()) {
    // Endereço da família: vem na consulta protegida, que o cadastro de membros já pode ver.
    const familia = await getJson<{ address: EnderecoDaApi | null }>(`/${familiaId}/information`);
    if (!familia.address) throw new ErroApi(422, "Família sem endereço cadastrado");

    const resposta = await postJson<RespostaMembros>(`/family/${familiaId}/members`, [
      pessoaParaApi(novo.nome, novo.parentesco, novo.autorizadoRetirar, novo.dados, familia.address),
    ]);
    if (resposta.rejected.length > 0) {
      throw new ErroApi(409, resposta.message || "Membro recusado pela API");
    }
    // A API não devolve o id do membro novo; a tela só usa o nome para o aviso.
    return { id: 0, nome: novo.nome, parentesco: novo.parentesco, autorizadoRetirar: novo.autorizadoRetirar };
  }
  // Dados de exemplo: o membro aparece na tela de entrega da família.
  await new Promise((resolver) => setTimeout(resolver, 300));
  const { dados: _dados, ...semDados } = novo;
  const membro = adicionarMembroExemplo(familiaId, semDados);
  if (!membro) throw new Error("Família não encontrada");
  return membro;
}
