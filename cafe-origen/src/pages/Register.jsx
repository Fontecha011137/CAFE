import "../css/register.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebaseConfig";


function Register() {

  const navigate = useNavigate();


  // =====================================================
  // ESTADOS
  // =====================================================

  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    email: "",
    password: "",
    confirmarPassword: ""
  });

  const [mensaje, setMensaje] =
    useState("");

  const [cargando, setCargando] =
    useState(false);


  // =====================================================
  // MANEJAR CAMBIOS
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };


  // =====================================================
  // REGISTRAR USUARIO
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (cargando) {
      return;
    }


    const nombre =
      formData.nombre.trim();

    const celular =
      formData.celular.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();


    // ===================================================
    // VALIDAR NOMBRE
    // ===================================================

    if (nombre.length < 3) {

      setMensaje(
        "Ingresa un nombre válido."
      );

      return;

    }


    // ===================================================
    // VALIDAR CELULAR
    // ===================================================

    if (!/^[0-9]{10}$/.test(celular)) {

      setMensaje(
        "Ingrese un número de celular válido de 10 dígitos."
      );

      return;

    }


    // ===================================================
    // VALIDAR CONTRASEÑA
    // ===================================================

    if (formData.password.length < 6) {

      setMensaje(
        "La contraseña debe tener al menos 6 caracteres."
      );

      return;

    }


    // ===================================================
    // VALIDAR CONFIRMACIÓN
    // ===================================================

    if (
      formData.password !==
      formData.confirmarPassword
    ) {

      setMensaje(
        "Las contraseñas no coinciden."
      );

      return;

    }


    try {

      setCargando(true);

      setMensaje("");


      // =================================================
      // CREAR USUARIO EN FIREBASE AUTH
      // =================================================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          formData.password
        );


      const user =
        userCredential.user;


      // =================================================
      // GUARDAR PERFIL EN FIRESTORE
      // =================================================

      await setDoc(
        doc(
          db,
          "usuarios",
          user.uid
        ),
        {

          nombre,

          celular,

          email,

          rol: "cliente",

          creado:
            serverTimestamp()

        }
      );


      // =================================================
      // MENSAJE
      // =================================================

      setMensaje(
        `Bienvenido ${nombre}. Tu cuenta fue creada correctamente.`
      );


      // =================================================
      // REDIRECCIÓN AL HOME
      // =================================================

      setTimeout(() => {

        navigate("/");

      }, 1000);


    } catch (error) {

      console.error(
        "Error registrando usuario:",
        error
      );


      // =================================================
      // ERRORES FIREBASE
      // =================================================

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        setMensaje(
          "Este correo electrónico ya está registrado."
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
        "auth/weak-password"
      ) {

        setMensaje(
          "La contraseña es demasiado débil."
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
          "No fue posible crear la cuenta. Intenta nuevamente."
        );

      }


    } finally {

      setCargando(false);

    }

  };


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="register-page">

      <div className="register-card">


        <h1>
          Crear cuenta
        </h1>


        <p>
          Regístrate para comprar nuestros cafés
          y gestionar tus pedidos.
        </p>


        <form onSubmit={handleSubmit}>


          {/* NOMBRE */}

          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            autoComplete="name"
            required
          />


          {/* CELULAR */}

          <input
            type="tel"
            name="celular"
            placeholder="Celular"
            value={formData.celular}
            onChange={handleChange}
            maxLength={10}
            inputMode="numeric"
            autoComplete="tel"
            required
          />


          {/* CORREO */}

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />


          {/* CONTRASEÑA */}

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            autoComplete="new-password"
            required
          />


          {/* CONFIRMAR CONTRASEÑA */}

          <input
            type="password"
            name="confirmarPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmarPassword}
            onChange={handleChange}
            minLength={6}
            autoComplete="new-password"
            required
          />


          {/* BOTÓN REGISTRO */}

          <button
            type="submit"
            disabled={cargando}
          >

            {
              cargando
                ? "Creando cuenta..."
                : "Registrarme"
            }

          </button>

        </form>


        {/* MENSAJE */}

        {mensaje && (

          <p className="register-mensaje">
            {mensaje}
          </p>

        )}


        {/* YA TENGO CUENTA */}

        <button
          type="button"
          className="volver"
          onClick={() =>
            navigate("/login")
          }
        >
          Ya tengo cuenta
        </button>


      </div>

    </div>

  );

}


export default Register;