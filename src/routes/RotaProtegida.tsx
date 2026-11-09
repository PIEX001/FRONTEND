import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { lerUsuarioLogado, type UsuarioLogado } from "../services/sessao";

type RotaProtegidaProps = {
  perfis?: Array<UsuarioLogado["perfil"]>;
  children: ReactNode;
};

export function RotaProtegida({ perfis, children }: RotaProtegidaProps) {
  const usuario = lerUsuarioLogado();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  if (perfis && !perfis.includes(usuario.perfil)) {
    return <Navigate to="/busca-familia" replace />;
  }
  return <>{children}</>;
}
