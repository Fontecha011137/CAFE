import "../css/login.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebaseConfig";


function Login() {

  const navigate = useNavigate();


  // =====================================================
  // ESTADOS
  // =====================================================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const [recuperando, setRecuperando] =
    useState(false);


  // =====================================================
  // INICIAR SESIÓN
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (cargando) {
      return;
    }


    const correo =
      email
        .trim()
        .toLowerCase();


    if (!correo) {

      setMensaje(
        "Ingresa tu correo electrónico."
      );

      return;

    }


    if (!password) {

      setMensaje(
        "Ingresa tu contraseña."
      );

      return;

    }


    try {

      setCargando(true);

      setMensaje("");


      // =================================================
      // AUTHENTICATION
      // =================================================

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          correo,
          password
        );


      const user =
        userCredential.user;


      // =================================================
      // BUSCAR PERFIL
      // =================================================

      const usuarioRef =
        doc(
          db,
          "usuarios",
          user.uid
        );


      const usuarioSnap =
        await getDoc(
          usuarioRef
        );


      if (!usuarioSnap.exists()) {

        setMensaje(
          "La cuenta existe, pero no se encontró el perfil del usuario."
        );

        return;

      }


      const datosUsuario =
        usuarioSnap.data();


      const rol =
        datosUsuario.rol ||
        "cliente";


      // =================================================
      // REDIRECCIÓN SEGÚN ROL
      // =================================================

      if (rol === "admin") {

        navigate("/admin");

      } else {

        navigate("/");

      }


    } catch (error) {

      console.error(
        "Error iniciando sesión:",
        error
      );


      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        setMensaje(
          "Correo o contraseña incorrectos."
        );

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {

        setMensaje(
          "El correo electrónico no es válido."
        );

      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {

        setMensaje(
          "Se realizaron demasiados intentos. Espera unos minutos e intenta nuevamente."
        );

      } else if (
        error.code ===
        "auth/network-request-failed"
      ) {

        setMensaje(
          "No fue posible conectarse. Verifica tu conexión a Internet."
        );

      } else {

        setMensaje(
          "No fue posible iniciar sesión."
        );

      }


    } finally {

      setCargando(false);

    }

  };


  // =====================================================
  // RECUPERAR CONTRASEÑA
  // =====================================================

  const recuperarPassword =
    async () => {

      if (recuperando) {
        return;
      }


      const correo =
        email
          .trim()
          .toLowerCase();


      if (!correo) {

        setMensaje(
          "Ingresa tu correo electrónico primero."
        );

        return;

      }


      try {

        setRecuperando(true);

        setMensaje("");


        await sendPasswordResetEmail(
          auth,
          correo
        );


        setMensaje(
          "Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo."
        );


      } catch (error) {

        console.error(
          "Error recuperando contraseña:",
          error
        );


        if (
          error.code ===
          "auth/invalid-email"
        ) {

          setMensaje(
            "El correo electrónico no es válido."
          );

        } else if (
          error.code ===
          "auth/too-many-requests"
        ) {

          setMensaje(
            "Se realizaron demasiadas solicitudes. Espera unos minutos."
          );

        } else {

          setMensaje(
            "No fue posible enviar el correo de recuperación."
          );

        }


      } finally {

        setRecuperando(false);

      }

    };


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="login-page">

      <div className="login-card">


        {/* =============================================
            ENCABEZADO
        ============================================= */}

        <div className="login-icono">
          ☕
        </div>


        <h1>
          Iniciar sesión
        </h1>


        <p className="login-descripcion">
          Accede a tu cuenta de Café de Origen.
        </p>


        {/* =============================================
            FORMULARIO
        ============================================= */}

        <form
          onSubmit={handleSubmit}
        >


          <div className="login-campo">

            <label htmlFor="email">
              Correo electrónico
            </label>


            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              autoComplete="email"
              required
            />

          </div>


          <div className="login-campo">

            <label htmlFor="password">
              Contraseña
            </label>


            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              autoComplete="current-password"
              required
            />

          </div>


          {/* ===========================================
              OLVIDÉ CONTRASEÑA
          =========================================== */}

          <div className="login-recuperar">

            <button
              type="button"
              onClick={
                recuperarPassword
              }
              disabled={
                recuperando
              }
            >

              {
                recuperando
                  ? "Enviando..."
                  : "¿Olvidaste tu contraseña?"
              }

            </button>

          </div>


          {/* ===========================================
              MENSAJE
          =========================================== */}

          {mensaje && (

            <div className="login-mensaje">
              {mensaje}
            </div>

          )}


          {/* ===========================================
              INGRESAR
          =========================================== */}

          <button
            type="submit"
            className="login-btn"
            disabled={cargando}
          >

            {
              cargando
                ? "Ingresando..."
                : "Ingresar"
            }

          </button>


        </form>


        {/* =============================================
            REGISTRO
        ============================================= */}

        <div className="login-footer">

          <p>
            ¿Aún no tienes cuenta?
          </p>


          <button
            type="button"
            className="login-register-btn"
            onClick={() =>
              navigate("/register")
            }
          >
            Crear cuenta
          </button>

        </div>


        {/* =============================================
            VOLVER
        ============================================= */}

        <button
          type="button"
          className="login-volver"
          onClick={() =>
            navigate("/")
          }
        >
          ← Volver al inicio
        </button>


      </div>

    </div>

  );

}


export default Login;