import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/login/Login";
import { Familia } from "../pages/familia/Familia";
import { Membros } from "../pages/membros/Membros";
import { BuscaFamilia } from "../pages/busca-familia/BuscaFamilia";
import { Entrega } from "../pages/entrega/Entrega";
import { Estoque } from "../pages/estoque/Estoque";
import { Relatorios } from "../pages/relatorios/Relatorios";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/familias" element={<Familia />} />
      <Route path="/membros" element={<Membros />} />
      <Route path="/busca-familia" element={<BuscaFamilia />} />
      <Route path="/entrega" element={<Entrega />} />
      <Route path="/estoque" element={<Estoque />} />
      <Route path="/relatorios" element={<Relatorios />} />
    </Routes>
  );
}
