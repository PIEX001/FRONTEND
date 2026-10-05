type SituacaoProps = {
  estado: "pendente" | "ok" | "alerta";
  texto: string;
};

export function Situacao({ estado, texto }: SituacaoProps) {
  return <span className={`situacao situacao--${estado}`}>{texto}</span>;
}