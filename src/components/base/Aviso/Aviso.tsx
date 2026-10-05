import type { ReactNode } from "react";

type AvisoProps = {
  variante: "ok" | "bloqueio";
  titulo: string;
  nivelTitulo?: "h1" | "h2"; // h1 quando o aviso é o assunto principal da tela
  children?: ReactNode; // texto (className="aviso__texto") ou dados extras
};

export function Aviso({ variante, titulo, nivelTitulo = "h2", children }: AvisoProps) {
  const Titulo = nivelTitulo;

  return (
    <section className={`aviso aviso--${variante}`}>
      <div className="aviso__cabecalho">
        <span className="aviso__icone">
          {variante === "ok" ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5" />
              <path d="M12 16.2v.3" />
            </svg>
          )}
        </span>
        <Titulo className="aviso__titulo">{titulo}</Titulo>
      </div>
      {children}
    </section>
  );
}
