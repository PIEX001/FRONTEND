type CarregandoProps = {
  itens?: number; // quantos esqueletos mostrar (padrão: 3)
};

export function Carregando({ itens = 3 }: CarregandoProps) {
  return (
    <ul className="lista-familias" aria-hidden="true">
      {Array.from({ length: itens }, (_, i) => (
        <li key={i} className="esqueleto">
          <span></span>
          <span></span>
        </li>
      ))}
    </ul>
  );
}