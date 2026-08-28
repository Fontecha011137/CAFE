import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";
import Carrito from "./pages/Carrito";

import Admin from "./pages/Admin";
import AdminConversaciones from "./pages/AdminConversaciones";
import AdminPedidos from "./pages/AdminPedidos";
import AdminClientes from "./pages/AdminClientes";

function App() {
  return (
    <Routes>

      <Route element={<Layout />}>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/perfil"
          element={<Perfil />}
        />

        <Route
          path="/carrito"
          element={<Carrito />}
        />

        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route
          path="/admin/conversaciones"
          element={<AdminConversaciones />}
        />

        <Route
          path="/admin/pedidos"
          element={<AdminPedidos />}
        />

        <Route
          path="/admin/clientes"
          element={<AdminClientes />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Route>

    </Routes>
  );
}

export default App;