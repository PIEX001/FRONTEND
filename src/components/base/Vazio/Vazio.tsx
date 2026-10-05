type VazioProps = {
  titulo: string;
  texto?: string;
};

export function Vazio({ titulo, texto }: VazioProps) {
  return (
    <section className="estado">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
        <path d="M8.5 11h5" />
      </svg>
      <h2>{titulo}</h2>
      {texto && <p>{texto}</p>}
    </section>
  );
}
