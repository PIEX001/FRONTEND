type VazioProps = {
  termoBusca: string;
};

export function Vazio({ termoBusca }: VazioProps) {
  return (
    <section className="estado">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
        <path d="M8.5 11h5" />
      </svg>
      <h2>Nenhuma família encontrada para "{termoBusca}"</h2>
      <p>Confira se o nome está certo ou tente buscar pelo telefone ou pelo código da família.</p>
    </section>
  );
}