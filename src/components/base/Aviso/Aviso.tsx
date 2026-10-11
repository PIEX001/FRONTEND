import type { ReactNode } from "react";

type AvisoProps = {
  variante: "ok" | "bloqueio";
  titulo: string;
  children: ReactNode;
};

export function Aviso({ variante, titulo, children }: AvisoProps) {
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
        <h1 className="aviso__titulo">{titulo}</h1>
      </div>
      {children}
    </section>
  );
}