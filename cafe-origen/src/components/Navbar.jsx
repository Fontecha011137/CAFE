import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  Menu,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  MessageCircle
} from "lucide-react";

import {
  auth,
  db
} from "../firebaseConfig";

import logoCafe from "../imagenes/Logo cafe origen.png";


function Navbar() {

  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const [usuario, setUsuario] =
    useState(null);

  const [rol, setRol] =
    useState(null);

  const [cargandoSesion, setCargandoSesion] =
    useState(true);


  // =====================================================
  // DETECTAR SESIÓN Y ROL
  // =====================================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user) {

            setUsuario(null);
            setRol(null);
            setCargandoSesion(false);

            return;

          }


          setUsuario(user);


          // Usuario anónimo = visitante

          if (user.isAnonymous) {

            setRol("visitante");
            setCargandoSesion(false);

            return;

          }


          try {

            const usuarioRef =
              doc(
                db,
                "usuarios",
                user.uid
              );


            const usuarioSnap =
              await getDoc(usuarioRef);


            if (usuarioSnap.exists()) {

              setRol(
                usuarioSnap.data().rol ||
                "cliente"
              );

            } else {

              setRol("cliente");

            }

          } catch (error) {

            console.error(
              "Error obteniendo rol:",
              error
            );

            setRol("cliente");

          } finally {

            setCargandoSesion(false);

          }

        }
      );


    return () => unsubscribe();

  }, []);


  const cerrarMenu = () => {
    setMenuAbierto(false);
  };


  const alternarMenu = () => {

    setMenuAbierto(
      (prev) => !prev
    );

  };


  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const cerrarSesion = async () => {

    try {

      await signOut(auth);

      setMenuAbierto(false);

      navigate("/");

    } catch (error) {

      console.error(
        "Error cerrando sesión:",
        error
      );

    }

  };


  return (

    <header className="navbar">

      <div className="navbar-container">


        {/* LOGO */}

        <Link
          to={
            rol === "admin"
              ? "/admin"
              : "/"
          }
          className="logo"
          onClick={cerrarMenu}
        >

          <img
            src={logoCafe}
            alt="Café de Origen Colombiano"
            className="navbar-logo-img"
          />

          <span className="navbar-marca">
            Café de Origen-Colombiano
          </span>

        </Link>


        {/* MENÚ MÓVIL */}

        <button
          type="button"
          className="menu-button"
          onClick={alternarMenu}
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

          {!cargandoSesion && (

            <>

              {/* =========================================
                  ADMIN
              ========================================= */}

              {usuario &&
                rol === "admin" && (

                <>

                  <Link
                    to="/perfil"
                    onClick={cerrarMenu}
                  >
                    <User size={18} />

                    <span>
                      Mi Perfil
                    </span>
                  </Link>


                  <button
                    type="button"
                    className="btn-cerrar-sesion"
                    onClick={cerrarSesion}
                  >
                    <LogOut size={18} />

                    <span>
                      Cerrar sesión
                    </span>
                  </button>

                </>

              )}


              {/* =========================================
                  CLIENTE REGISTRADO
              ========================================= */}

              {usuario &&
                rol === "cliente" && (

                <>

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
                    <span>Carrito</span>
                  </Link>


                  <Link
                    to="/consultas"
                    onClick={cerrarMenu}
                  >
                    <MessageCircle size={18} />
                    <span>Consultas</span>
                  </Link>


                  <Link
                    to="/perfil"
                    onClick={cerrarMenu}
                  >
                    <User size={18} />
                    <span>Mi cuenta</span>
                  </Link>


                  <button
                    type="button"
                    className="btn-cerrar-sesion"
                    onClick={cerrarSesion}
                  >
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                  </button>

                </>

              )}


              {/* =========================================
                  VISITANTE / SIN REGISTRO
              ========================================= */}

              {(
                !usuario ||
                rol === "visitante"
              ) && (

                <>

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
                    <span>Carrito</span>
                  </Link>


                  <Link
                    to="/consultas"
                    onClick={cerrarMenu}
                  >
                    <MessageCircle size={18} />
                    <span>Consultas</span>
                  </Link>


                  <Link
                    to="/login"
                    onClick={cerrarMenu}
                  >
                    <LogIn size={18} />
                    <span>Ingresar</span>
                  </Link>


                  <Link
                    to="/register"
                    onClick={cerrarMenu}
                  >
                    <UserPlus size={18} />
                    <span>Registrarse</span>
                  </Link>

                </>

              )}

            </>

          )}

        </nav>

      </div>

    </header>

  );

}


export default Navbar;