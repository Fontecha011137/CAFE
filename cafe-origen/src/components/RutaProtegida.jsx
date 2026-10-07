import {
  useEffect,
  useState
} from "react";

import {
  Navigate
} from "react-router-dom";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebaseConfig";


function RutaProtegida({
  children,
  soloAdmin = false
}) {

  const [cargando, setCargando] =
    useState(true);

  const [permitido, setPermitido] =
    useState(false);


  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          // =========================================
          // NO HAY SESIÓN
          // =========================================

          if (!user || user.isAnonymous) {

            setPermitido(false);
            setCargando(false);

            return;
          }


          // =========================================
          // RUTA DE CLIENTE
          // =========================================

          if (!soloAdmin) {

            setPermitido(true);
            setCargando(false);

            return;
          }


          // =========================================
          // RUTA DE ADMINISTRADOR
          // =========================================

          try {

            const usuarioRef =
              doc(
                db,
                "usuarios",
                user.uid
              );

            const usuarioSnap =
              await getDoc(usuarioRef);


            if (
              usuarioSnap.exists() &&
              usuarioSnap.data().rol === "admin"
            ) {

              setPermitido(true);

            } else {

              setPermitido(false);

            }

          } catch (error) {

            console.error(
              "Error verificando permisos:",
              error
            );

            setPermitido(false);

          } finally {

            setCargando(false);

          }

        }
      );


    return () => unsubscribe();

  }, [soloAdmin]);


  // ===============================================
  // ESPERAR A FIREBASE
  // ===============================================

  if (cargando) {

    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center"
        }}
      >
        Verificando sesión...
      </div>
    );

  }


  // ===============================================
  // ACCESO DENEGADO
  // ===============================================

  if (!permitido) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  // ===============================================
  // ACCESO PERMITIDO
  // ===============================================

  return children;

}


export default RutaProtegida;