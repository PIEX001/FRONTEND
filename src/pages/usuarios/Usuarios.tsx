import { useState, type FormEvent } from "react";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { Aviso } from "../../components/base/Aviso";
import { Cabecalho } from "../../components/base/Cabecalho";
import { ErroApi } from "../../services/api";
import { cadastrarUsuario, FUNCOES, gerarNovaSenha, gerarSenhaInicial, type SenhaNova } from "../../services/usuarios";
import { cpfValido, separarNome, telefoneValido } from "../../utils/validacao";

type Criado = { nome: string; email: string; senha: string };

// Maior de idade: a API recusa usuários com menos de 18 anos.
function temDezoitoAnos(data: string) {
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() - 18);
  return data <= limite.toISOString().slice(0, 10);
}

// Página da administradora para criar o login dos funcionários e voluntários.
export function Usuarios() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cargo, setCargo] = useState<number>(FUNCOES[0].cargo);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [criado, setCriado] = useState<Criado | null>(null);
  // "Esqueceu a senha?"
  const [emailEsqueceu, setEmailEsqueceu] = useState("");
  const [gerando, setGerando] = useState(false);
  const [erroSenha, setErroSenha] = useState("");
  const [senhaNova, setSenhaNova] = useState<SenhaNova | null>(null);

  function conferir() {
    if (!nome.trim() || !email.trim() || !cpf.trim() || !telefone.trim() || !dataNascimento) {
      return "Preencha todos os campos.";
    }
    if (!separarNome(nome)) return "Digite o nome e o sobrenome.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "O e-mail não está correto.";
    if (!cpfValido(cpf)) return "O CPF não está correto. Confira os números.";
    if (!telefoneValido(telefone)) return "O telefone precisa ter DDD e número, como (32) 99999-0000.";
    if (!temDezoitoAnos(dataNascimento)) return "A pessoa precisa ter 18 anos ou mais.";
    return "";
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    const problema = conferir();
    if (problema) {
      setErro(problema);
      return;
    }

    const senha = gerarSenhaInicial(nome);
    setEnviando(true);
    setErro("");
    setCriado(null);
    try {
      await cadastrarUsuario({ nome, email, cpf, telefone, dataNascimento, cargo, senhaInicial: senha });
      setCriado({ nome: nome.trim(), email: email.trim().toLowerCase(), senha });
      setNome("");
      setEmail("");
      setCpf("");
      setTelefone("");
      setDataNascimento("");
      setCargo(FUNCOES[0].cargo);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (falha) {
      if (falha instanceof ErroApi && falha.status === 409) setErro("Já existe um login com este e-mail.");
      else if (falha instanceof ErroApi && falha.status === 403) setErro("Só administradores podem criar logins.");
      else if (falha instanceof ErroApi && (falha.status === 400 || falha.status === 422)) setErro("A API recusou algum dado. Confira CPF, telefone e data de nascimento.");
      else setErro("Não foi possível criar o login. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function novaSenha(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (gerando) return;
    if (!/^\S+@\S+\.\S+$/.test(emailEsqueceu.trim())) {
      setErroSenha("Digite o e-mail de login da pessoa.");
      return;
    }
    setGerando(true);
    setErroSenha("");
    setSenhaNova(null);
    try {
      setSenhaNova(await gerarNovaSenha(emailEsqueceu));
      setEmailEsqueceu("");
    } catch (falha) {
      if (falha instanceof ErroApi && falha.status === 404) setErroSenha("Não existe login com este e-mail.");
      else if (falha instanceof ErroApi && falha.status === 403) setErroSenha("Só administradores podem gerar nova senha.");
      else if (falha instanceof ErroApi && falha.status === 422) setErroSenha("Para mudar a sua própria senha, use o endereço /trocar-senha.");
      else setErroSenha("Não foi possível gerar a nova senha. Tente novamente.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <>
      <Cabecalho />
      <main className="conteudo conteudo--estreito">
        <h1>Equipe</h1>
        <p className="subtitulo">Crie o login de funcionários e voluntários. A senha inicial é o primeiro nome com @ e números, como Carlos@4821.</p>

        {criado && (
          <Aviso variante="ok" titulo={`Login de ${criado.nome.split(" ")[0]} criado`}>
            <dl className="dados">
              <dt>E-mail</dt>
              <dd>{criado.email}</dd>
              <dt>Senha inicial</dt>
              <dd className="senha-inicial">{criado.senha}</dd>
            </dl>
            <p className="aviso__texto">
              Anote e entregue para a pessoa. No primeiro acesso o sistema pede para ela criar uma senha só dela.
            </p>
          </Aviso>
        )}

        {erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível criar">
            <p className="aviso__texto">{erro}</p>
          </Aviso>
        )}

        <Cartao>
          <form onSubmit={salvar} noValidate>
            <label htmlFor="usuario-nome">Nome completo *</label>
            <input id="usuario-nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" />
            <label htmlFor="usuario-email" className="campo-seguinte">E-mail *</label>
            <input
              id="usuario-email"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
            <p className="nota">É com este e-mail que a pessoa vai entrar no sistema.</p>
            <div className="campos-dupla">
              <div>
                <label htmlFor="usuario-cpf" className="campo-seguinte">CPF *</label>
                <input id="usuario-cpf" inputMode="numeric" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div>
                <label htmlFor="usuario-telefone" className="campo-seguinte">Telefone *</label>
                <input
                  id="usuario-telefone"
                  type="tel"
                  inputMode="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(32) 99999-0000"
                />
              </div>
            </div>
            <label htmlFor="usuario-nascimento" className="campo-seguinte">Data de nascimento *</label>
            <input id="usuario-nascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />

            <fieldset className="campo-seguinte funcoes">
              <legend>Função *</legend>
              {FUNCOES.map((funcao) => (
                <label key={funcao.cargo} className="funcoes__opcao">
                  <input
                    type="radio"
                    name="funcao"
                    value={funcao.cargo}
                    checked={cargo === funcao.cargo}
                    onChange={() => setCargo(funcao.cargo)}
                  />
                  <span>
                    <strong>{funcao.nome}</strong>
                    <small>{funcao.descricao}</small>
                  </span>
                </label>
              ))}
            </fieldset>

            <Button
              type="submit"
              label={enviando ? "Criando..." : "Criar login"}
              desabilitado={enviando}
              className="botao--formulario"
            />
          </form>
        </Cartao>

        <h2 className="titulo-secao" id="esqueceu">Esqueceu a senha?</h2>
        <p className="subtitulo">Gere uma senha nova para a pessoa. A antiga deixa de funcionar na hora.</p>

        {senhaNova && (
          <Aviso variante="ok" titulo={`Nova senha de ${senhaNova.nome.split(" ")[0]}`}>
            <dl className="dados">
              <dt>E-mail</dt>
              <dd>{senhaNova.email}</dd>
              <dt>Nova senha</dt>
              <dd className="senha-inicial">{senhaNova.senha}</dd>
            </dl>
            <p className="aviso__texto">Entregue para a pessoa. Ao entrar, ela vai criar uma senha só dela de novo.</p>
          </Aviso>
        )}

        {erroSenha && (
          <Aviso variante="bloqueio" titulo="Não foi possível gerar">
            <p className="aviso__texto">{erroSenha}</p>
          </Aviso>
        )}

        <Cartao>
          <form onSubmit={novaSenha} noValidate>
            <label htmlFor="email-esqueceu">E-mail de login da pessoa</label>
            <input
              id="email-esqueceu"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              value={emailEsqueceu}
              onChange={(e) => setEmailEsqueceu(e.target.value)}
              autoComplete="off"
            />
            <Button
              type="submit"
              variante="secundario"
              label={gerando ? "Gerando..." : "Gerar nova senha"}
              desabilitado={gerando}
              className="botao--formulario"
            />
          </form>
        </Cartao>
      </main>
    </>
  );
}
