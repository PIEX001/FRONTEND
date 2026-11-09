import { NavLink, useNavigate } from "react-router-dom";
import { sairDoSistema } from "../../../services/autenticacao";
import { lerUsuarioLogado } from "../../../services/sessao";

// Telas do menu. O operador só usa a entrega, então o menu aparece só para o administrador.
const MENU_ADMINISTRADOR = [
  { para: "/busca-familia", texto: "Entregas" },
  { para: "/familias", texto: "Famílias" },
  { para: "/membros", texto: "Membros" },
  { para: "/estoque", texto: "Estoque" },
  { para: "/relatorios", texto: "Relatórios" },
  { para: "/equipe", texto: "Equipe" },
];

const NOME_DO_PERFIL = { administrador: "administrador", operador: "operador" } as const;

// O cabeçalho lê o usuário da sessão, assim nenhuma tela precisa passar nome ou perfil.
export function Cabecalho() {
  const usuario = lerUsuarioLogado();
  const navegar = useNavigate();

  // Encerra o token na API também, para ele não valer mais.
  async function aoSair() {
    await sairDoSistema();
    navegar("/login", { replace: true });
  }

  return (
    <header className="topo">
      <div className="topo__linha">
        <div className="topo__marca">
          <img src="/logo.png" alt="" />
          <span className="topo__nome">
            Casa São Francisco <br />de Assis
          </span>
        </div>
        {usuario && (
          <div className="topo__conta">
            <span className="topo__usuario">
              {usuario.nome}
              {usuario.perfil === "operador" && (
                <span className="so-desktop"> ({NOME_DO_PERFIL[usuario.perfil]})</span>
              )}
            </span>
            <button type="button" className="topo__sair" onClick={aoSair}>
              Sair
            </button>
          </div>
        )}
      </div>

      {usuario?.perfil === "administrador" && (
        <nav className="menu" aria-label="Menu principal">
          {MENU_ADMINISTRADOR.map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              className={({ isActive }) => (isActive ? "menu__item menu__item--ativo" : "menu__item")}
            >
              {item.texto}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
