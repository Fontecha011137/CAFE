import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebaseConfig";

import "../css/carrito.css";


function Carrito() {

  // =====================================================
  // CARRITO
  // =====================================================

  const [
    carrito,
    setCarrito
  ] = useState(() => {

    const guardado =
      localStorage.getItem(
        "carritoCafe"
      );

    return guardado
      ? JSON.parse(guardado)
      : [];

  });


  // =====================================================
  // USUARIO
  // =====================================================

  const [
    usuario,
    setUsuario
  ] = useState(null);


  const [
    perfil,
    setPerfil
  ] = useState(null);


  const [
    cargandoUsuario,
    setCargandoUsuario
  ] = useState(true);


  // =====================================================
  // MODAL ENVÍO
  // =====================================================

  const [
    mostrarModalEnvio,
    setMostrarModalEnvio
  ] = useState(false);


  const [
    modoEnvio,
    setModoEnvio
  ] = useState(null);


  const [
    comentarioEnvio,
    setComentarioEnvio
  ] = useState("");


  const [
    mensajeModal,
    setMensajeModal
  ] = useState("");


  const [
    enviandoPedido,
    setEnviandoPedido
  ] = useState(false);


  // =====================================================
  // DATOS DEL VISITANTE
  // =====================================================

  const [
    nombreVisitante,
    setNombreVisitante
  ] = useState("");


  const [
    celularVisitante,
    setCelularVisitante
  ] = useState("");


  // =====================================================
  // GUARDAR CARRITO
  // =====================================================

  useEffect(() => {

    localStorage.setItem(
      "carritoCafe",
      JSON.stringify(carrito)
    );

  }, [carrito]);


  // =====================================================
  // DETECTAR USUARIO
  // =====================================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {

          if (!firebaseUser) {

            setUsuario(null);
            setPerfil(null);
            setCargandoUsuario(false);

            return;

          }


          setUsuario(firebaseUser);


          // Si es anónimo, lo tratamos como visitante
          if (firebaseUser.isAnonymous) {

            setPerfil(null);
            setCargandoUsuario(false);

            return;

          }


          try {

            const usuarioRef =
              doc(
                db,
                "usuarios",
                firebaseUser.uid
              );


            const usuarioSnap =
              await getDoc(
                usuarioRef
              );


            if (usuarioSnap.exists()) {

              setPerfil({
                uid: firebaseUser.uid,
                ...usuarioSnap.data()
              });

            } else {

              setPerfil({
                uid: firebaseUser.uid,
                nombre:
                  firebaseUser.displayName ||
                  "",
                email:
                  firebaseUser.email ||
                  ""
              });

            }

          } catch (error) {

            console.error(
              "Error cargando perfil:",
              error
            );

          } finally {

            setCargandoUsuario(false);

          }

        }
      );


    return () => {
      unsubscribe();
    };

  }, []);


  // =====================================================
  // CANTIDADES
  // =====================================================

  const aumentarCantidad = (id) => {

    const nuevoCarrito =
      carrito.map(
        (producto) =>
          producto.id === id
            ? {
                ...producto,
                cantidad:
                  producto.cantidad + 1
              }
            : producto
      );


    setCarrito(
      nuevoCarrito
    );

  };


  const disminuirCantidad = (id) => {

    const nuevoCarrito =
      carrito
        .map(
          (producto) =>
            producto.id === id
              ? {
                  ...producto,
                  cantidad:
                    producto.cantidad - 1
                }
              : producto
        )
        .filter(
          (producto) =>
            producto.cantidad > 0
        );


    setCarrito(
      nuevoCarrito
    );

  };


  const eliminarProducto = (id) => {

    const nuevoCarrito =
      carrito.filter(
        (producto) =>
          producto.id !== id
      );


    setCarrito(
      nuevoCarrito
    );

  };


  const vaciarCarrito = () => {

    setCarrito([]);

  };


  // =====================================================
  // TOTALES
  // =====================================================

  const total =
    carrito.reduce(
      (
        acumulado,
        producto
      ) =>
        acumulado +
        Number(
          producto.precio
        ) *
        Number(
          producto.cantidad
        ),
      0
    );


  const totalProductos =
    carrito.reduce(
      (
        acumulado,
        producto
      ) =>
        acumulado +
        Number(
          producto.cantidad
        ),
      0
    );


  // =====================================================
  // PRECIO
  // =====================================================

  const formatoPrecio =
    (valor) => {

      return new Intl.NumberFormat(
        "es-CO",
        {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0
        }
      ).format(valor);

    };


  // =====================================================
  // ABRIR MODAL
  // =====================================================

  const abrirModalEnvio = () => {

    setMostrarModalEnvio(true);

    setModoEnvio(null);

    setComentarioEnvio("");

    setMensajeModal("");


    // Si el cliente está registrado,
    // no necesitamos pedir los datos manualmente.

    if (perfil) {

      setNombreVisitante("");
      setCelularVisitante("");

    }

  };


  // =====================================================
  // CERRAR MODAL
  // =====================================================

  const cerrarModalEnvio = () => {

    setMostrarModalEnvio(false);

    setModoEnvio(null);

    setComentarioEnvio("");

    setMensajeModal("");

  };


  // =====================================================
  // OPCIONES DE ENTREGA
  // =====================================================

  const seleccionarAcordarEnvio = () => {

    setModoEnvio("acordar");

    setMensajeModal("");

  };


  const seleccionarPickup = () => {

    setModoEnvio("pickup");

    setMensajeModal("");

  };


  // =====================================================
  // OBTENER DATOS DEL CLIENTE
  // =====================================================

  const obtenerDatosCliente = () => {

    if (
      usuario &&
      !usuario.isAnonymous &&
      perfil
    ) {

      return {
        origen: "registrado",

        uidCliente:
          usuario.uid,

        nombreCliente:
          perfil.nombre || "",

        celularCliente:
          perfil.celular || "",

        emailCliente:
          perfil.email ||
          usuario.email ||
          ""
      };

    }


    return {
      origen: "visitante",

      uidCliente:
        usuario?.uid || null,

      nombreCliente:
        nombreVisitante.trim(),

      celularCliente:
        celularVisitante.trim(),

      emailCliente: ""
    };

  };


  // =====================================================
  // VALIDAR DATOS
  // =====================================================

  const validarDatosCliente = () => {

    // Cliente registrado

    if (
      usuario &&
      !usuario.isAnonymous &&
      perfil
    ) {

      if (!perfil.nombre) {

        setMensajeModal(
          "Tu perfil no tiene nombre registrado."
        );

        return false;

      }


      if (
        !/^[0-9]{10}$/.test(
          String(
            perfil.celular || ""
          ).replace(
            /\D/g,
            ""
          )
        )
      ) {

        setMensajeModal(
          "Tu perfil no tiene un celular válido. Actualízalo desde Mi cuenta."
        );

        return false;

      }


      return true;

    }


    // Visitante

    if (
      nombreVisitante
        .trim()
        .length < 2
    ) {

      setMensajeModal(
        "Ingresa tu nombre."
      );

      return false;

    }


    const celularLimpio =
      celularVisitante
        .replace(
          /\D/g,
          ""
        );


    if (
      !/^[0-9]{10}$/.test(
        celularLimpio
      )
    ) {

      setMensajeModal(
        "Ingresa un número de celular válido de 10 dígitos."
      );

      return false;

    }


    return true;

  };


  // =====================================================
  // CREAR PEDIDO EN FIRESTORE
  // =====================================================

  const crearPedido =
    async (
      metodoEntrega,
      comentario = ""
    ) => {

      if (
        carrito.length === 0
      ) {

        setMensajeModal(
          "El carrito está vacío."
        );

        return;

      }


      if (
        !validarDatosCliente()
      ) {

        return;

      }


      try {

        setEnviandoPedido(true);
        setMensajeModal("");


        const datosCliente =
          obtenerDatosCliente();


        // ===============================================
        // GUARDAR PEDIDO
        // ===============================================

        const pedidoRef =
          await addDoc(
            collection(
              db,
              "pedidos"
            ),
            {
              ...datosCliente,

              productos:
                carrito.map(
                  (producto) => ({
                    id:
                      producto.id,

                    nombre:
                      producto.nombre,

                    precio:
                      Number(
                        producto.precio
                      ),

                    cantidad:
                      Number(
                        producto.cantidad
                      ),

                    peso:
                      producto.peso ||
                      "500 g",

                    subtotal:
                      Number(
                        producto.precio
                      ) *
                      Number(
                        producto.cantidad
                      )
                  })
                ),

              cantidadProductos:
                totalProductos,

              subtotal:
                total,

              total:
                total,

              costoEnvio:
                0,

              metodoEntrega,

              comentarioEntrega:
                comentario,

              estado:
                metodoEntrega ===
                "pickup"
                  ? "Pendiente"
                  : "Pendiente de acordar envío",

              creado:
                serverTimestamp(),

              actualizado:
                serverTimestamp()
            }
          );


        // ===============================================
        // CREAR CONVERSACIÓN SI ES ENVÍO
        // ===============================================

        if (
          metodoEntrega ===
          "acordar_envio"
        ) {

          const textoInicial =
            comentario ||
            "Quiero acordar el medio y costo del envío.";


          const conversacionRef =
            await addDoc(
              collection(
                db,
                "conversaciones"
              ),
              {
                tipo:
                  "envio",

                origen:
                  datosCliente.origen,

                uidCliente:
                  datosCliente.uidCliente,

                nombreCliente:
                  datosCliente.nombreCliente,

                celularCliente:
                  datosCliente.celularCliente,

                emailCliente:
                  datosCliente.emailCliente,

                pedidoId:
                  pedidoRef.id,

                asunto:
                  "Acordar medio de envío",

                ultimoMensaje:
                  textoInicial,

                estado:
                  "Esperando admin",

                esperando:
                  "admin",

                noLeidosAdmin:
                  1,

                noLeidosCliente:
                  0,

                metodoEntrega:
                  "Por definir",

                costoEnvio:
                  0,

                creado:
                  serverTimestamp(),

                actualizado:
                  serverTimestamp()
              }
            );


          // =============================================
          // PRIMER MENSAJE
          // =============================================

          await addDoc(
            collection(
              db,
              "conversaciones",
              conversacionRef.id,
              "mensajes"
            ),
            {
              autor:
                "cliente",

              remitente:
                "cliente",

              texto:
                textoInicial,

              creado:
                serverTimestamp()
            }
          );

        }


        // ===============================================
        // MENSAJE FINAL
        // ===============================================

        if (
          metodoEntrega ===
          "pickup"
        ) {

          setMensajeModal(
            "Pedido registrado correctamente. Has seleccionado recogerlo en el punto de entrega."
          );

        } else {

          setMensajeModal(
            "Pedido registrado correctamente. Tu solicitud de envío fue enviada. Podremos responderte por la aplicación o contactarte por WhatsApp."
          );

        }


        // ===============================================
        // VACIAR CARRITO
        // ===============================================

        setCarrito([]);

        localStorage.removeItem(
          "carritoCafe"
        );


        setComentarioEnvio("");


      } catch (error) {

        console.error(
          "Error creando pedido:",
          error
        );


        setMensajeModal(
          "No fue posible registrar el pedido. Intenta nuevamente."
        );


      } finally {

        setEnviandoPedido(false);

      }

    };


  // =====================================================
  // ENVIAR SOLICITUD DE ENVÍO
  // =====================================================

  const enviarSolicitudEnvio =
    async () => {

      const comentario =
        comentarioEnvio.trim();


      if (!comentario) {

        setMensajeModal(
          "Escribe un comentario para solicitar el envío."
        );

        return;

      }


      await crearPedido(
        "acordar_envio",
        comentario
      );

    };


  // =====================================================
  // CONFIRMAR RECOGIDA
  // =====================================================

  const confirmarPickup =
    async () => {

      await crearPedido(
        "pickup",
        "Cliente recogerá el pedido en el punto de entrega."
      );

    };


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="carrito-page">


      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div className="carrito-titulo">


        <div>

          <h1>
            Mi carrito
          </h1>


          <p>
            Revisa tus cafés antes de finalizar
            la compra.
          </p>

        </div>


        {carrito.length > 0 && (

          <button
            type="button"
            className="btn-vaciar"
            onClick={vaciarCarrito}
          >
            Vaciar carrito
          </button>

        )}


      </div>


      {/* =================================================
          CARRITO
      ================================================= */}

      {carrito.length === 0 ? (

        <div className="carrito-vacio">


          <h2>
            Tu carrito está vacío
          </h2>


          <p>
            Todavía no has agregado ningún café.
          </p>


          <Link
            to="/"
            className="btn-volver-comprar"
          >
            Ver nuestros cafés
          </Link>


        </div>

      ) : (

        <div className="carrito-contenedor">


          {/* ===============================================
              PRODUCTOS
          =============================================== */}

          <div className="carrito-lista">


            {carrito.map(
              (producto) => (

              <div
                className="carrito-producto"
                key={producto.id}
              >


                {producto.imagen && (

                  <div className="producto-imagen">

                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                    />

                  </div>

                )}


                <div className="producto-info">


                  <h2>
                    {producto.nombre}
                  </h2>


                  {producto.descripcion && (

                    <p>
                      {producto.descripcion}
                    </p>

                  )}


                  {producto.peso && (

                    <p>
                      Presentación: {producto.peso}
                    </p>

                  )}


                  <strong>

                    {formatoPrecio(
                      producto.precio
                    )}

                  </strong>


                </div>


                {/* CANTIDAD */}

                <div className="producto-cantidad">


                  <button
                    type="button"
                    onClick={() =>
                      disminuirCantidad(
                        producto.id
                      )
                    }
                  >
                    -
                  </button>


                  <span>
                    {producto.cantidad}
                  </span>


                  <button
                    type="button"
                    onClick={() =>
                      aumentarCantidad(
                        producto.id
                      )
                    }
                  >
                    +
                  </button>


                </div>


                {/* TOTAL */}

                <div className="producto-total">


                  <strong>

                    {formatoPrecio(
                      producto.precio *
                      producto.cantidad
                    )}

                  </strong>


                  <button
                    type="button"
                    className="btn-eliminar"
                    onClick={() =>
                      eliminarProducto(
                        producto.id
                      )
                    }
                  >
                    Eliminar
                  </button>


                </div>


              </div>

            ))}


          </div>


          {/* ===============================================
              RESUMEN
          =============================================== */}

          <div className="carrito-resumen">


            <h2>
              Resumen de compra
            </h2>


            <div className="resumen-fila">

              <span>
                Productos
              </span>

              <span>
                {totalProductos}
              </span>

            </div>


            <div className="resumen-fila">

              <span>
                Subtotal
              </span>

              <span>
                {formatoPrecio(total)}
              </span>

            </div>


            <p className="texto-envio">
              El costo del envío está por definir.
            </p>


            <div className="resumen-total">

              <span>
                Total actual
              </span>

              <strong>
                {formatoPrecio(total)}
              </strong>

            </div>


            <button
              type="button"
              className="btn-finalizar"
              onClick={abrirModalEnvio}
              disabled={cargandoUsuario}
            >

              {
                cargandoUsuario
                  ? "Cargando..."
                  : "Finalizar compra"
              }

            </button>


            <Link
              to="/"
              className="seguir-comprando"
            >
              Seguir comprando
            </Link>


          </div>


        </div>

      )}


      {/* =================================================
          MODAL ENTREGA
      ================================================= */}

      {mostrarModalEnvio && (

        <div className="modal-overlay">


          <div className="modal-envio">


            {/* CERRAR */}

            <button
              type="button"
              className="modal-cerrar"
              onClick={cerrarModalEnvio}
              aria-label="Cerrar"
            >
              ×
            </button>


            <h2>
              Información de entrega
            </h2>


            <p className="modal-envio-destacado">
              El precio del envío todavía está por definir.
            </p>


            <p>
              Puedes hablar directamente con nosotros
              para acordar el método y el valor de la
              entrega.
            </p>


            {/* =============================================
                DATOS VISITANTE
            ============================================= */}

            {!perfil && (

              <div className="datos-visitante-pedido">


                <h3>
                  Datos de contacto
                </h3>


                <p>
                  Necesitamos tu nombre y celular para
                  identificar el pedido y poder contactarte
                  por WhatsApp si es necesario.
                </p>


                <div className="campo-visitante">

                  <label>
                    Nombre
                  </label>

                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={nombreVisitante}
                    onChange={(e) =>
                      setNombreVisitante(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="campo-visitante">

                  <label>
                    Celular / WhatsApp
                  </label>

                  <input
                    type="tel"
                    placeholder="3001234567"
                    value={celularVisitante}
                    onChange={(e) =>
                      setCelularVisitante(
                        e.target.value
                      )
                    }
                    maxLength={10}
                    inputMode="numeric"
                  />

                </div>


              </div>

            )}


            {/* =============================================
                CLIENTE REGISTRADO
            ============================================= */}

            {perfil && (

              <div className="datos-cliente-pedido">


                <strong>
                  {perfil.nombre}
                </strong>


                <span>
                  {perfil.celular}
                </span>


                <small>
                  Usaremos los datos registrados en tu cuenta.
                </small>


              </div>

            )}


            {/* =============================================
                OPCIONES
            ============================================= */}

            {!modoEnvio && (

              <div className="modal-envio-opciones">


                <button
                  type="button"
                  className="btn-acordar-envio"
                  onClick={seleccionarAcordarEnvio}
                >
                  🚚 Acordar precio de envío
                </button>


                <button
                  type="button"
                  className="btn-pickup"
                  onClick={seleccionarPickup}
                >
                  📦 Recoger en punto
                </button>


              </div>

            )}


            {/* =============================================
                ACORDAR ENVÍO
            ============================================= */}

            {modoEnvio ===
              "acordar" && (

              <div className="solicitud-envio">


                <h3>
                  Solicitar envío
                </h3>


                <p>
                  Cuéntanos dónde necesitas recibir
                  tu pedido o cualquier información
                  que nos ayude a calcular el envío.
                </p>


                <textarea
                  value={comentarioEnvio}
                  onChange={(e) =>
                    setComentarioEnvio(
                      e.target.value
                    )
                  }
                  placeholder="Ejemplo: Quiero envío a Suba, barrio La Campiña. ¿Cuánto cuesta?"
                />


                <p className="aviso-contacto-envio">
                  Podremos responderte por medio de la
                  aplicación o contactarte por WhatsApp,
                  según lo que resulte más práctico.
                </p>


                <div className="solicitud-envio-botones">


                  <button
                    type="button"
                    className="btn-volver-modal"
                    disabled={enviandoPedido}
                    onClick={() => {

                      setModoEnvio(null);

                      setMensajeModal("");

                    }}
                  >
                    Volver
                  </button>


                  <button
                    type="button"
                    className="btn-enviar-solicitud"
                    onClick={enviarSolicitudEnvio}
                    disabled={enviandoPedido}
                  >

                    {
                      enviandoPedido
                        ? "Enviando..."
                        : "Enviar solicitud"
                    }

                  </button>


                </div>


              </div>

            )}


            {/* =============================================
                PICKUP
            ============================================= */}

            {modoEnvio ===
              "pickup" && (

              <div className="pickup-info">


                <h3>
                  Recoger en punto
                </h3>


                <p>
                  No se agregará costo de envío.
                  Puedes recoger tu pedido directamente
                  en nuestro punto de entrega.
                </p>


                <div className="pickup-direccion">


                  <span className="pickup-icono">
                    📍
                  </span>


                  <div>

                    <span className="pickup-label">
                      Punto de recogida
                    </span>

                    <strong>
                      Calle 8A # 82-31
                    </strong>

                    <span>
                      Bogotá, Colombia
                    </span>

                  </div>


                </div>


                <a
                  href="https://www.waze.com/ul?q=Calle%208A%20%23%2082-31%20Bogota%20Colombia&navigate=yes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-waze"
                >
                  🚗 Cómo llegar con Waze
                </a>


                <button
                  type="button"
                  className="btn-confirmar-pickup"
                  onClick={confirmarPickup}
                  disabled={enviandoPedido}
                >

                  {
                    enviandoPedido
                      ? "Registrando pedido..."
                      : "Confirmar pedido para recoger"
                  }

                </button>


                <button
                  type="button"
                  className="btn-volver-modal"
                  disabled={enviandoPedido}
                  onClick={() => {

                    setModoEnvio(null);

                    setMensajeModal("");

                  }}
                >
                  Cambiar opción
                </button>


              </div>

            )}


            {/* =============================================
                MENSAJE
            ============================================= */}

            {mensajeModal && (

              <div className="mensaje-modal-envio">

                {mensajeModal}

              </div>

            )}


          </div>


        </div>

      )}


    </div>

  );

}


export default Carrito;