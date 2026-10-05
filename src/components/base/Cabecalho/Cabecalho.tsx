type CabecalhoProps = {
  usuario: string;
  cargo?: string; // aparece só no desktop (classe so-desktop)
};

export function Cabecalho({ usuario, cargo }: CabecalhoProps) {
  return (
    <header className="topo">
      <div className="topo__marca">
        <img src="/logo.png" alt="" />
        <span className="topo__nome">Casa São Francisco <br />de Assis</span>
      </div>
      <span className="topo__usuario">
        {usuario}
        {cargo && <span className="so-desktop"> ({cargo})</span>}
      </span>
    </header>
  );
}