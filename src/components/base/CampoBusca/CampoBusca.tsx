type CampoBuscaProps = {
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder?: string;
  rotuloAcessivel?: string;
};

export function CampoBusca({
  valor,
  aoMudar,
  placeholder = "Nome, telefone ou código",
  rotuloAcessivel = "Buscar família",
}: CampoBuscaProps) {
  return (
    <div className="campo-busca">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        aria-label={rotuloAcessivel}
      />
    </div>
  );
}