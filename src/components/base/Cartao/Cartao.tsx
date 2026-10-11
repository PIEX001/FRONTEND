import type { ReactNode } from "react";

type CartaoProps = {
  titulo?: string;
  children: ReactNode;
  className?: string;
};

export function Cartao({ titulo, children, className = "" }: CartaoProps) {
  return (
    <section className={`cartao ${className}`.trim()}>
      {titulo && <h2 className="cartao__titulo">{titulo}</h2>}
      {children}
    </section>
  );
}