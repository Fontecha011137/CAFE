import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Layout from "./components/Layout";
import RutaProtegida from "./components/RutaProtegida";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";
import Carrito from "./pages/Carrito";
import Consultas from "./pages/Consultas";

import Admin from "./pages/Admin";
import AdminConsultas from "./pages/AdminConsultas";
import AdminPedidos from "./pages/AdminPedidos";
import AdminClientes from "./pages/AdminClientes";


function App() {

  return (

    <Routes>

      <Route element={<Layout />}>


        {/* =========================================
            PÚBLICO
        ========================================= */}

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


        {/* =========================================
            CARRITO
            SE MANTIENE PÚBLICO POR AHORA
        ========================================= */}

        <Route
          path="/carrito"
          element={<Carrito />}
        />


        {/* =========================================
            CLIENTE AUTENTICADO
        ========================================= */}

        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <Perfil />
            </RutaProtegida>
          }
        />


        <Route
          path="/consultas"
          element={
            <RutaProtegida>
              <Consultas />
            </RutaProtegida>
          }
        />


        {/* =========================================
            ADMINISTRADOR
        ========================================= */}

        <Route
          path="/admin"
          element={
            <RutaProtegida soloAdmin>
              <Admin />
            </RutaProtegida>
          }
        />


        <Route
          path="/admin/consultas"
          element={
            <RutaProtegida soloAdmin>
              <AdminConsultas />
            </RutaProtegida>
          }
        />


        <Route
          path="/admin/pedidos"
          element={
            <RutaProtegida soloAdmin>
              <AdminPedidos />
            </RutaProtegida>
          }
        />


        <Route
          path="/admin/clientes"
          element={
            <RutaProtegida soloAdmin>
              <AdminClientes />
            </RutaProtegida>
          }
        />


        {/* =========================================
            RUTA NO ENCONTRADA
        ========================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />


      </Route>

    </Routes>

  );

}


export default App;