import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  LogOut
} from "lucide-react";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);

  // TEMPORAL:
  // false = usuario no ha iniciado sesión
  // true = usuario inició sesión
  //
  // Cuando conectemos Firebase, esto se reemplaza
  // por onAuthStateChanged().
  const [usuarioLogueado, setUsuarioLogueado] = useState(false);

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const cerrarSesion = () => {
    setUsuarioLogueado(false);
    setMenuAbierto(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        <Link
          to="/"
          className="logo"
          onClick={cerrarMenu}
        >
          ☕ Café de Origen-Colombiano
        </Link>

        <button
          className="menu-button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
        >
          <Menu size={28} />
        </button>

        <nav
          className={
            menuAbierto
              ? "nav-links activo"
              : "nav-links"
          }
        >

          <Link
            to="/"
            onClick={cerrarMenu}
          >
            Inicio
          </Link>

          <Link
            to="/carrito"
            onClick={cerrarMenu}
          >
            <ShoppingCart size={18} />
            Carrito
          </Link>

<Link
  to="/admin"
  onClick={cerrarMenu}
>
  Admin
</Link>

          {usuarioLogueado ? (
            <>
              <Link
                to="/perfil"
                onClick={cerrarMenu}
              >
                <User size={18} />
                Mi cuenta
              </Link>

              <button
                className="btn-cerrar-sesion"
                onClick={cerrarSesion}
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={cerrarMenu}
              >
                <LogIn size={18} />
                Ingresar
              </Link>

              <Link
                to="/register"
                onClick={cerrarMenu}
              >
                <UserPlus size={18} />
                Registrarse
              </Link>
            </>
          )}

        </nav>

      </div>
    </header>
  );
}

export default Navbar;