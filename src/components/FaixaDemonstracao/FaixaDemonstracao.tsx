import { usarDadosDeExemplo } from "../../services/api";

// Aparece em todas as telas quando VITE_API_URL está vazio.
// Evita que alguém cadastre dados reais achando que estão sendo salvos.
export function FaixaDemonstracao() {
  if (!usarDadosDeExemplo) return null;

  return (
    <p className="faixa-demonstracao" role="status">
      <strong>Modo de demonstração.</strong> Os dados são fictícios e nada do que for cadastrado fica salvo.
    </p>
  );
}
