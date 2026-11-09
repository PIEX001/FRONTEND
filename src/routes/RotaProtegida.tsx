import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { lerUsuarioLogado, precisaTrocarSenha, type UsuarioLogado } from "../services/sessao";

type RotaProtegidaProps = {
  perfis?: Array<UsuarioLogado["perfil"]>;
  children: ReactNode;
};

export function RotaProtegida({ perfis, children }: RotaProtegidaProps) {
  const usuario = lerUsuarioLogado();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  // Primeiro acesso: nenhuma tela abre antes de trocar a senha recebida.
  if (precisaTrocarSenha()) {
    return <Navigate to="/trocar-senha" replace />;
  }
  if (perfis && !perfis.includes(usuario.perfil)) {
    return <Navigate to="/busca-familia" replace />;
  }
  return <>{children}</>;
}
