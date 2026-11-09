import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Cartao } from "../../components/base/Cartao";
import { Button } from "../../components/base/Button";
import { Aviso } from "../../components/base/Aviso";
import { Cabecalho } from "../../components/base/Cabecalho";
import { CamposPessoais } from "../../components/CamposPessoais/CamposPessoais";
import { ErroApi } from "../../services/api";
import { cadastrarFamilia } from "../../services/familias";
import { listarTurmas } from "../../services/turmaService";
import type { DadosPessoais, Endereco, FamiliaDetalhe } from "../../types/familia";
import { conferirDadosPessoais, DADOS_PESSOAIS_VAZIOS } from "../../utils/dadosPessoais";
import { MENSAGENS } from "../../utils/mensagens";
import { cepValido, separarNome, telefoneValido } from "../../utils/validacao";

// A maioria das famílias atendidas é de Juiz de Fora.
const ENDERECO_VAZIO: Endereco = { cep: "", rua: "", numero: "", bairro: "", complemento: "", cidade: "Juiz de Fora", uf: "MG" };

export function Familia() {
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [turma, setTurma] = useState("");
  const [turmas, setTurmas] = useState<string[]>([]);
  const [quantidade, setQuantidade] = useState("1");
  const [endereco, setEndereco] = useState<Endereco>(ENDERECO_VAZIO);
  const [responsavel, setResponsavel] = useState<DadosPessoais>(DADOS_PESSOAIS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [cadastrada, setCadastrada] = useState<FamiliaDetalhe | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarTurmas().then(setTurmas).catch(() => setTurmas([]));
  }, []);

  const mudarEndereco = (campo: Partial<Endereco>) => setEndereco((atual) => ({ ...atual, ...campo }));

  // Primeiro problema do formulário, ou "" se pode enviar.
  function conferir(): string {
    if (!nomeResponsavel.trim() || !turma || !endereco.rua.trim() || !endereco.numero.trim() || !endereco.cidade.trim()) {
      return MENSAGENS.familia.campoVazio;
    }
    if (!separarNome(nomeResponsavel)) return "Digite o nome e o sobrenome do responsável.";
    if (telefone.trim() && !telefoneValido(telefone)) return "O telefone precisa ter DDD e número, como (32) 99999-0000.";
    if (!cepValido(endereco.cep)) return "O CEP precisa ter 8 números.";
    if (!/^\d+$/.test(endereco.numero.trim()) || Number(endereco.numero) === 0) {
      return "O número da casa precisa ser só números. Sem número? Escreva no complemento.";
    }
    if (endereco.uf.trim().length !== 2) return "O estado precisa ter 2 letras, como MG.";
    const pessoas = Number(quantidade);
    if (!Number.isInteger(pessoas) || pessoas < 1) return "Informe quantas pessoas moram na casa.";
    return conferirDadosPessoais(responsavel);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    const problema = conferir();
    if (problema) {
      setErro(problema);
      return;
    }

    setEnviando(true);
    setErro("");
    setCadastrada(null);
    try {
      const familia = await cadastrarFamilia({
        nomeResponsavel: nomeResponsavel.trim(),
        endereco,
        telefone: telefone.trim() || undefined,
        turma,
        quantidadeMembros: Number(quantidade),
        responsavel,
      });
      setCadastrada(familia);
      setNomeResponsavel("");
      setTelefone("");
      setTurma("");
      setQuantidade("1");
      setEndereco(ENDERECO_VAZIO);
      setResponsavel(DADOS_PESSOAIS_VAZIOS);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (falha) {
      // 400 e 422: a API recusou algum campo (validação do back).
      const recusado = falha instanceof ErroApi && (falha.status === 400 || falha.status === 422);
      setErro(recusado ? "A API recusou algum dado. Confira CPF, CEP, número e datas." : MENSAGENS.familia.erro);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Cabecalho />
      <main className="conteudo conteudo--estreito">
        <h1>Cadastro de família</h1>
        <p className="subtitulo">Campos com * são obrigatórios.</p>

        {cadastrada && cadastrada.totalMembros > 0 && (
          <Aviso variante="ok" titulo="Cadastro realizado">
            <p className="aviso__texto">
              {MENSAGENS.familia.sucesso} Código {cadastrada.codigo}.{" "}
              <Link to={`/membros?familia=${cadastrada.id}`}>Cadastrar outros membros desta família</Link>
            </p>
          </Aviso>
        )}

        {cadastrada && cadastrada.totalMembros === 0 && (
          <Aviso variante="bloqueio" titulo="Família cadastrada, mas o responsável não entrou">
            <p className="aviso__texto">
              Código {cadastrada.codigo}. O CPF pode já estar em outra família.{" "}
              <Link to={`/membros?familia=${cadastrada.id}`}>Cadastrar o responsável pelo cadastro de membros</Link>
            </p>
          </Aviso>
        )}

        {erro && (
          <Aviso variante="bloqueio" titulo="Não foi possível salvar">
            <p className="aviso__texto">{erro}</p>
          </Aviso>
        )}

        <Cartao>
          <form onSubmit={salvar} noValidate>
            <h2 className="secao-form">Família</h2>
            <label htmlFor="responsavel">Nome completo do responsável *</label>
            <input
              id="responsavel"
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
              autoComplete="off"
            />
            <div className="campos-dupla">
              <div>
                <label htmlFor="telefone" className="campo-seguinte">Telefone</label>
                <input
                  id="telefone"
                  type="tel"
                  inputMode="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(32) 99999-0000"
                />
              </div>
              <div>
                <label htmlFor="quantidade" className="campo-seguinte">Pessoas na casa *</label>
                <input
                  id="quantidade"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>
            </div>
            <label htmlFor="turma" className="campo-seguinte">Turma *</label>
            <select id="turma" value={turma} onChange={(e) => setTurma(e.target.value)}>
              <option value="">Escolha a turma</option>
              {turmas.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>

            <h2 className="secao-form">Endereço</h2>
            <div className="campos-dupla">
              <div>
                <label htmlFor="cep" className="campo-seguinte">CEP *</label>
                <input
                  id="cep"
                  inputMode="numeric"
                  value={endereco.cep}
                  onChange={(e) => mudarEndereco({ cep: e.target.value })}
                  placeholder="36000-000"
                />
              </div>
              <div>
                <label htmlFor="bairro" className="campo-seguinte">Bairro</label>
                <input id="bairro" value={endereco.bairro} onChange={(e) => mudarEndereco({ bairro: e.target.value })} />
              </div>
            </div>
            <label htmlFor="rua" className="campo-seguinte">Rua *</label>
            <input id="rua" value={endereco.rua} onChange={(e) => mudarEndereco({ rua: e.target.value })} autoComplete="off" />
            <div className="campos-dupla">
              <div>
                <label htmlFor="numero" className="campo-seguinte">Número *</label>
                <input
                  id="numero"
                  inputMode="numeric"
                  value={endereco.numero}
                  onChange={(e) => mudarEndereco({ numero: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="complemento" className="campo-seguinte">Complemento</label>
                <input
                  id="complemento"
                  value={endereco.complemento}
                  onChange={(e) => mudarEndereco({ complemento: e.target.value })}
                  placeholder="Ex.: casa 2, fundos"
                />
              </div>
            </div>
            <div className="campos-dupla">
              <div>
                <label htmlFor="cidade" className="campo-seguinte">Cidade *</label>
                <input id="cidade" value={endereco.cidade} onChange={(e) => mudarEndereco({ cidade: e.target.value })} />
              </div>
              <div>
                <label htmlFor="uf" className="campo-seguinte">Estado *</label>
                <input
                  id="uf"
                  maxLength={2}
                  value={endereco.uf}
                  onChange={(e) => mudarEndereco({ uf: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <h2 className="secao-form">Dados do responsável</h2>
            <p className="nota">Ficam protegidos: só administrador e assistente social veem depois.</p>
            <CamposPessoais prefixo="responsavel" dados={responsavel} aoMudar={setResponsavel} />

            <Button
              type="submit"
              label={enviando ? "Salvando..." : "Salvar família"}
              desabilitado={enviando}
              className="botao--formulario"
            />
          </form>
        </Cartao>
      </main>
    </>
  );
}
