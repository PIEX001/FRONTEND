import { useEffect, useState } from "react";
import { aoMudarServidorLento } from "../../services/api";

// Aparece quando uma chamada à API passa de alguns segundos.
// O servidor gratuito dorme sem uso e pode levar até 1 minuto para acordar;
// sem este aviso, parece que o sistema travou.
export function AvisoServidor() {
  const [demorando, setDemorando] = useState(false);

  useEffect(() => aoMudarServidorLento(setDemorando), []);

  if (!demorando) return null;

  return (
    <p className="faixa-servidor" role="status">
      <strong>Conectando ao servidor.</strong> Na primeira vez do dia isso pode levar até 1 minuto. Não feche a página.
    </p>
  );
}
