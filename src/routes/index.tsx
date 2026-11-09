import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/login/Login";
import { Familia } from "../pages/familia/Familia";
import { Membros } from "../pages/membros/Membros";
import { BuscaFamilia } from "../pages/busca-familia/BuscaFamilia";
import { Entrega } from "../pages/entrega/Entrega";
import { Estoque } from "../pages/estoque/Estoque";
import { Relatorios } from "../pages/relatorios/Relatorios";
import { TrocarSenha } from "../pages/trocar-senha/TrocarSenha";
import { Usuarios } from "../pages/usuarios/Usuarios";
import { RotaProtegida } from "./RotaProtegida";

export function AppRoutes() {
  return (
    <Routes>
      {/* Quem não está logado cai no login pela RotaProtegida. */}
      <Route path="/" element={<Navigate to="/busca-familia" replace />} />
      <Route path="/login" element={<Login />} />
      {/* Fora da RotaProtegida: é para onde ela manda quem ainda precisa trocar a senha. */}
      <Route path="/trocar-senha" element={<TrocarSenha />} />
      <Route
        path="/busca-familia"
        element={
          <RotaProtegida>
            <BuscaFamilia />
          </RotaProtegida>
        }
      />
      <Route
        path="/entrega"
        element={
          <RotaProtegida>
            <Entrega />
          </RotaProtegida>
        }
      />
      <Route
        path="/familias"
        element={
          <RotaProtegida perfis={["administrador"]}>
            <Familia />
          </RotaProtegida>
        }
      />
      <Route
        path="/membros"
        element={
          <RotaProtegida perfis={["administrador"]}>
            <Membros />
          </RotaProtegida>
        }
      />
      <Route
        path="/estoque"
        element={
          <RotaProtegida perfis={["administrador"]}>
            <Estoque />
          </RotaProtegida>
        }
      />
      <Route
        path="/relatorios"
        element={
          <RotaProtegida perfis={["administrador"]}>
            <Relatorios />
          </RotaProtegida>
        }
      />
      <Route
        path="/equipe"
        element={
          <RotaProtegida perfis={["administrador"]}>
            <Usuarios />
          </RotaProtegida>
        }
      />
      {/* Endereço que não existe volta para o início. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}