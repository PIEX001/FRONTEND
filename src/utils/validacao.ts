// Conferências de formulário feitas antes de mandar para a API.

export function apenasDigitos(texto: string) {
  return texto.replace(/\D/g, "");
}

// CPF com os dois dígitos verificadores certos.
export function cpfValido(cpf: string) {
  const numeros = apenasDigitos(cpf);
  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) return false;
  for (let tamanho = 9; tamanho <= 10; tamanho++) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(numeros[i]) * (tamanho + 1 - i);
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(numeros[tamanho])) return false;
  }
  return true;
}

export function cepValido(cep: string) {
  return apenasDigitos(cep).length === 8;
}

// Telefone com DDD: 10 ou 11 dígitos.
export function telefoneValido(telefone: string) {
  const numeros = apenasDigitos(telefone);
  return numeros.length >= 10 && numeros.length <= 11;
}

// Nome e sobrenome, como a API exige.
export function separarNome(nomeCompleto: string): { nome: string; sobrenome: string } | null {
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length < 2) return null;
  return { nome: partes[0], sobrenome: partes.slice(1).join(" ") };
}
