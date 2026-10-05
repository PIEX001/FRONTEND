type ButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variante?: "primario" | "secundario";
  desabilitado?: boolean;
  className?: string;
};

export function Button({
  label,
  onClick,
  type = "button",
  variante = "primario",
  desabilitado = false,
  className = "",
}: ButtonProps) {
  const classeBase =
    variante === "secundario" ? "botao botao--secundario" : "botao";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={desabilitado}
      className={`${classeBase} ${className}`.trim()}
    >
      {label}
    </button>
  );
}