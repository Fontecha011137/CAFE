import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

import "../css/perfil.css";

function Perfil() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);

  const [perfil, setPerfil] = useState({
    nombre: "",
    celular: "",
    email: ""
  });

  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    email: ""
  });

  const [passwordData, setPasswordData] = useState({
    passwordActual: "",
    nuevaPassword: "",
    confirmarPassword: ""
  });

  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setCargando(false);
          navigate("/login");
          return;
        }

        setUsuario(user);

        try {
          const referencia = doc(
            db,
            "usuarios",
            user.uid
          );

          const documento = await getDoc(referencia);

          if (documento.exists()) {
            const datos = documento.data();

            const datosPerfil = {
              nombre: datos.nombre || "",
              celular: datos.celular || "",
              email: datos.email || user.email || ""
            };

            setPerfil(datosPerfil);
            setFormData(datosPerfil);
          } else {
            const datosPerfil = {
              nombre: "",
              celular: "",
              email: user.email || ""
            };

            setPerfil(datosPerfil);
            setFormData(datosPerfil);
          }
        } catch (error) {
          console.error(
            "Error cargando perfil:",
            error
          );

          mostrarMensaje(
            "No se pudo cargar la información del perfil.",
            "error"
          );
        } finally {
          setCargando(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const activarEdicion = () => {
    setFormData(perfil);

    setMensaje("");
    setTipoMensaje("");

    setCambiandoPassword(false);
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setFormData(perfil);

    setEditando(false);

    setMensaje("");
    setTipoMensaje("");
  };

  const activarCambioPassword = () => {
    setPasswordData({
      passwordActual: "",
      nuevaPassword: "",
      confirmarPassword: ""
    });

    setMensaje("");
    setTipoMensaje("");

    setEditando(false);
    setCambiandoPassword(true);
  };

  const cancelarCambioPassword = () => {
    setPasswordData({
      passwordActual: "",
      nuevaPassword: "",
      confirmarPassword: ""
    });

    setCambiandoPassword(false);

    setMensaje("");
    setTipoMensaje("");
  };

  const guardarCambios = async (e) => {
    e.preventDefault();

    if (!usuario) {
      return;
    }

    if (!formData.nombre.trim()) {
      mostrarMensaje(
        "El nombre no puede estar vacío.",
        "error"
      );

      return;
    }

    if (!formData.celular.trim()) {
      mostrarMensaje(
        "El celular no puede estar vacío.",
        "error"
      );

      return;
    }

    try {
      setGuardando(true);
      setMensaje("");
      setTipoMensaje("");

      const referencia = doc(
        db,
        "usuarios",
        usuario.uid
      );

      await updateDoc(referencia, {
        nombre: formData.nombre.trim(),
        celular: formData.celular.trim()
      });

      const perfilActualizado = {
        ...perfil,
        nombre: formData.nombre.trim(),
        celular: formData.celular.trim()
      };

      setPerfil(perfilActualizado);
      setFormData(perfilActualizado);

      setEditando(false);

      mostrarMensaje(
        "Perfil actualizado correctamente.",
        "exito"
      );
    } catch (error) {
      console.error(
        "Error actualizando perfil:",
        error
      );

      mostrarMensaje(
        "No se pudieron guardar los cambios.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();

    if (!usuario) {
      return;
    }

    if (!passwordData.passwordActual) {
      mostrarMensaje(
        "Escribe tu contraseña actual.",
        "error"
      );

      return;
    }

    if (passwordData.nuevaPassword.length < 6) {
      mostrarMensaje(
        "La nueva contraseña debe tener mínimo 6 caracteres.",
        "error"
      );

      return;
    }

    if (
      passwordData.nuevaPassword !==
      passwordData.confirmarPassword
    ) {
      mostrarMensaje(
        "Las nuevas contraseñas no coinciden.",
        "error"
      );

      return;
    }

    if (
      passwordData.passwordActual ===
      passwordData.nuevaPassword
    ) {
      mostrarMensaje(
        "La nueva contraseña debe ser diferente a la actual.",
        "error"
      );

      return;
    }

    try {
      setGuardando(true);
      setMensaje("");
      setTipoMensaje("");

      const credential =
        EmailAuthProvider.credential(
          usuario.email,
          passwordData.passwordActual
        );

      await reauthenticateWithCredential(
        usuario,
        credential
      );

      await updatePassword(
        usuario,
        passwordData.nuevaPassword
      );

      setPasswordData({
        passwordActual: "",
        nuevaPassword: "",
        confirmarPassword: ""
      });

      setCambiandoPassword(false);

      mostrarMensaje(
        "Contraseña actualizada correctamente.",
        "exito"
      );
    } catch (error) {
      console.error(
        "Error cambiando contraseña:",
        error
      );

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        mostrarMensaje(
          "La contraseña actual es incorrecta.",
          "error"
        );

        return;
      }

      if (error.code === "auth/weak-password") {
        mostrarMensaje(
          "La nueva contraseña es demasiado débil.",
          "error"
        );

        return;
      }

      if (error.code === "auth/too-many-requests") {
        mostrarMensaje(
          "Demasiados intentos. Espera un momento e inténtalo nuevamente.",
          "error"
        );

        return;
      }

      mostrarMensaje(
        "No se pudo cambiar la contraseña.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);

      navigate("/");
    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );

      mostrarMensaje(
        "No se pudo cerrar la sesión.",
        "error"
      );
    }
  };

  if (cargando) {
    return (
      <div className="perfil-cargando">
        Cargando cuenta...
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="perfil-page">
      <section className="perfil-card">

        <div className="perfil-avatar">
          {perfil.nombre
            ? perfil.nombre
                .charAt(0)
                .toUpperCase()
            : "U"}
        </div>

        <h1>Mi cuenta</h1>

        <p className="perfil-bienvenida">
          Bienvenido a Café de Origen Colombia
        </p>

        {!editando && !cambiandoPassword && (
          <>
            <div className="perfil-datos">

              <div className="perfil-dato">
                <span>Nombre</span>

                <strong>
                  {perfil.nombre ||
                    "No registrado"}
                </strong>
              </div>

              <div className="perfil-dato">
                <span>
                  Correo electrónico
                </span>

                <strong>
                  {perfil.email ||
                    usuario.email}
                </strong>
              </div>

              <div className="perfil-dato">
                <span>Celular</span>

                <strong>
                  {perfil.celular ||
                    "No registrado"}
                </strong>
              </div>

            </div>

            <div className="perfil-opciones">

              <button
                className="btn-editar-perfil"
                onClick={activarEdicion}
              >
                Editar perfil
              </button>

              <button
                className="btn-cambiar-password"
                onClick={activarCambioPassword}
              >
                Cambiar contraseña
              </button>

              <button
                className="btn-pedidos"
                onClick={() =>
                  alert(
                    "Próximamente podrás consultar tus pedidos."
                  )
                }
              >
                Mis pedidos
              </button>

              <button
                className="btn-cerrar-sesion"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </button>

            </div>
          </>
        )}

        {editando && (
          <form
            className="perfil-formulario"
            onSubmit={guardarCambios}
          >

            <h2>Editar perfil</h2>

            <div className="perfil-campo">

              <label htmlFor="nombre">
                Nombre completo
              </label>

              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />

            </div>

            <div className="perfil-campo">

              <label htmlFor="celular">
                Celular
              </label>

              <input
                id="celular"
                type="tel"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                required
              />

            </div>

            <div className="perfil-campo">

              <label htmlFor="email">
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                value={formData.email}
                disabled
              />

              <small>
                El correo de inicio de sesión no se
                modifica desde esta sección.
              </small>

            </div>

            <div className="perfil-botones-edicion">

              <button
                type="submit"
                className="btn-guardar"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>

              <button
                type="button"
                className="btn-cancelar"
                onClick={cancelarEdicion}
                disabled={guardando}
              >
                Cancelar
              </button>

            </div>

          </form>
        )}

        {cambiandoPassword && (
          <form
            className="perfil-formulario"
            onSubmit={cambiarPassword}
          >

            <h2>
              Cambiar contraseña
            </h2>

            <div className="perfil-campo">

              <label htmlFor="passwordActual">
                Contraseña actual
              </label>

              <input
                id="passwordActual"
                type="password"
                name="passwordActual"
                value={
                  passwordData.passwordActual
                }
                onChange={handlePasswordChange}
                autoComplete="current-password"
                required
              />

            </div>

            <div className="perfil-campo">

              <label htmlFor="nuevaPassword">
                Nueva contraseña
              </label>

              <input
                id="nuevaPassword"
                type="password"
                name="nuevaPassword"
                value={
                  passwordData.nuevaPassword
                }
                onChange={handlePasswordChange}
                autoComplete="new-password"
                minLength="6"
                required
              />

              <small>
                Debe tener mínimo 6 caracteres.
              </small>

            </div>

            <div className="perfil-campo">

              <label htmlFor="confirmarPassword">
                Confirmar nueva contraseña
              </label>

              <input
                id="confirmarPassword"
                type="password"
                name="confirmarPassword"
                value={
                  passwordData.confirmarPassword
                }
                onChange={handlePasswordChange}
                autoComplete="new-password"
                minLength="6"
                required
              />

            </div>

            <div className="perfil-botones-edicion">

              <button
                type="submit"
                className="btn-guardar"
                disabled={guardando}
              >
                {guardando
                  ? "Actualizando..."
                  : "Actualizar contraseña"}
              </button>

              <button
                type="button"
                className="btn-cancelar"
                onClick={
                  cancelarCambioPassword
                }
                disabled={guardando}
              >
                Cancelar
              </button>

            </div>

          </form>
        )}

        {mensaje && (
          <p
            className={
              tipoMensaje === "exito"
                ? "perfil-mensaje perfil-mensaje-exito"
                : "perfil-mensaje perfil-mensaje-error"
            }
          >
            {mensaje}
          </p>
        )}

      </section>
    </div>
  );
}

export default Perfil;