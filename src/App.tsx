import { AppRoutes } from "./routes";
import { AvisoServidor } from "./components/AvisoServidor/AvisoServidor";
import { FaixaDemonstracao } from "./components/FaixaDemonstracao/FaixaDemonstracao";
import "./App.css";

function App() {
  return (
    <>
      <FaixaDemonstracao />
      <AvisoServidor />
      <AppRoutes />
    </>
  );
}

export default App;
