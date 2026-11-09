export const MENSAGENS = {
  login: {
    erro: "Usuário ou senha inválidos. Verifique os dados e tente novamente.",
    campoVazio: "Preencha todos os campos para continuar.",
    sessaoExpirada: "Sua sessão terminou. Entre de novo para continuar.",
  },
  senha: {
    regra: "Pelo menos 8 caracteres, com letra maiúscula, letra minúscula, número e um símbolo (como @ ou #).",
    naoConfere: "As duas senhas novas não são iguais. Digite de novo.",
    igualAtual: "A nova senha precisa ser diferente da atual.",
    atualErrada: "A senha atual não confere. Verifique e tente de novo.",
  },
  familia: {
    sucesso: "Família cadastrada com sucesso.",
    erro: "Não foi possível cadastrar a família. Tente novamente.",
    campoVazio: "Preencha os campos obrigatórios do cadastro.",
  },
  membros: {
    sucesso: "Membro cadastrado com sucesso.",
    erro: "Não foi possível cadastrar o membro. Tente novamente.",
    campoVazio: "Preencha os campos obrigatórios do cadastro.",
  },
  geral: {
    semConexao: "Serviço indisponível no momento. Tente mais tarde.",
    operacaoBloqueada: "Esta operação não pode ser concluída.",
  },
} as const;