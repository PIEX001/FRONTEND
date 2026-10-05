import type { ReactNode } from "react";

type CartaoProps = {
  titulo?: string;
  children: ReactNode;
};

export function Cartao({ titulo, children }: CartaoProps) {
  return (
    <section className="cartao">
      {titulo && <h2 className="cartao__titulo">{titulo}</h2>}
      {children}
    </section>
  );
}
