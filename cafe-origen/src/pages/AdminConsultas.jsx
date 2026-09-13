import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import {
  ArrowLeft,
  MessageCircle,
  Truck,
  Coffee,
  Phone
} from "lucide-react";

import {
  db
} from "../firebaseConfig";

import "../css/adminConversaciones.css";


function AdminConsultas() {

  const navigate = useNavigate();


  // =====================================================
  // ESTADOS
  // =====================================================

  const [
    conversaciones,
    setConversaciones
  ] = useState([]);


  const [
    conversacionActiva,
    setConversacionActiva
  ] = useState(null);


  const [
    mensajes,
    setMensajes
  ] = useState([]);


  const [
    mensajeNuevo,
    setMensajeNuevo
  ] = useState("");


  const [
    mostrarInfoCliente,
    setMostrarInfoCliente
  ] = useState(false);


  const [
    cargando,
    setCargando
  ] = useState(true);


  const [
    enviando,
    setEnviando
  ] = useState(false);


  const [
    filtro,
    setFiltro
  ] = useState("todas");


  // =====================================================
  // ESCUCHAR CONSULTAS DE FIREBASE
  // =====================================================

  useEffect(() => {

    const referencia =
      collection(
        db,
        "conversaciones"
      );


    const unsubscribe =
      onSnapshot(
        referencia,

        (snapshot) => {

          const lista =
            snapshot.docs.map(
              (documento) => ({
                id: documento.id,
                ...documento.data()
              })
            );


          // =============================================
          // MÁS RECIENTES PRIMERO
          // =============================================

          lista.sort(
            (a, b) => {

              const fechaA =
                a.actualizado?.seconds ||
                a.fechaActualizacion?.seconds ||
                a.creado?.seconds ||
                a.fechaCreacion?.seconds ||
                0;


              const fechaB =
                b.actualizado?.seconds ||
                b.fechaActualizacion?.seconds ||
                b.creado?.seconds ||
                b.fechaCreacion?.seconds ||
                0;


              return fechaB - fechaA;

            }
          );


          setConversaciones(
            lista
          );


          // =============================================
          // MANTENER ACTUALIZADA LA CONVERSACIÓN ABIERTA
          // =============================================

          setConversacionActiva(
            (actual) => {

              if (!actual) {
                return null;
              }


              const actualizada =
                lista.find(
                  (item) =>
                    item.id === actual.id
                );


              return actualizada || actual;

            }
          );


          setCargando(false);

        },

        (error) => {

          console.error(
            "Error cargando consultas:",
            error
          );

          setCargando(false);

        }
      );


    return () => {

      unsubscribe();

    };

  }, []);


  // =====================================================
  // ESCUCHAR MENSAJES
  // =====================================================

  useEffect(() => {

    if (!conversacionActiva) {

      setMensajes([]);

      return;

    }


    const referenciaMensajes =
      collection(
        db,
        "conversaciones",
        conversacionActiva.id,
        "mensajes"
      );


    const unsubscribe =
      onSnapshot(
        referenciaMensajes,

        (snapshot) => {

          const lista =
            snapshot.docs.map(
              (documento) => ({
                id: documento.id,
                ...documento.data()
              })
            );


          lista.sort(
            (a, b) => {

              const fechaA =
                a.creado?.seconds ||
                a.fecha?.seconds ||
                0;


              const fechaB =
                b.creado?.seconds ||
                b.fecha?.seconds ||
                0;


              return fechaA - fechaB;

            }
          );


          setMensajes(
            lista
          );

        },

        (error) => {

          console.error(
            "Error cargando mensajes:",
            error
          );

        }
      );


    return () => {

      unsubscribe();

    };

  }, [conversacionActiva?.id]);


  // =====================================================
  // ABRIR CONSULTA
  // =====================================================

  const abrirConversacion =
    async (conversacion) => {

      setConversacionActiva(
        conversacion
      );

      setMostrarInfoCliente(
        false
      );


      try {

        await updateDoc(
          doc(
            db,
            "conversaciones",
            conversacion.id
          ),
          {
            noLeidos: 0,
            noLeidosAdmin: 0
          }
        );


      } catch (error) {

        console.error(
          "Error marcando consulta como leída:",
          error
        );

      }

    };


  // =====================================================
  // ENVIAR RESPUESTA
  // =====================================================

  const enviarMensaje =
    async () => {

      const texto =
        mensajeNuevo.trim();


      if (
        !texto ||
        !conversacionActiva ||
        enviando
      ) {

        return;

      }


      try {

        setEnviando(true);


        // ===============================================
        // GUARDAR MENSAJE
        // ===============================================

        await addDoc(
          collection(
            db,
            "conversaciones",
            conversacionActiva.id,
            "mensajes"
          ),
          {
            autor: "admin",
            remitente: "admin",

            texto,

            creado:
              serverTimestamp()
          }
        );


        // ===============================================
        // ACTUALIZAR CONVERSACIÓN
        // ===============================================

        await updateDoc(
          doc(
            db,
            "conversaciones",
            conversacionActiva.id
          ),
          {
            ultimoMensaje:
              texto,

            estado:
              "Esperando cliente",

            esperando:
              "cliente",

            actualizado:
              serverTimestamp(),

            noLeidos:
              0,

            noLeidosCliente:
              1
          }
        );


        setMensajeNuevo("");


      } catch (error) {

        console.error(
          "Error enviando mensaje:",
          error
        );


      } finally {

        setEnviando(false);

      }

    };


  // =====================================================
  // ENTER PARA ENVIAR
  // =====================================================

  const manejarTecla =
    (e) => {

      if (
        e.key === "Enter" &&
        !e.shiftKey
      ) {

        e.preventDefault();

        enviarMensaje();

      }

    };


  // =====================================================
  // CAPITALIZAR NOMBRE
  // =====================================================

  const capitalizarNombre =
    (nombre = "") => {

      return nombre
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map(
          (palabra) =>
            palabra
              .charAt(0)
              .toUpperCase() +
            palabra.slice(1)
        )
        .join(" ");

    };


  // =====================================================
  // NOMBRE CLIENTE
  // =====================================================

  const obtenerNombre =
    (conversacion) => {

      return capitalizarNombre(
        conversacion?.cliente ||
        conversacion?.nombreCliente ||
        conversacion?.nombre ||
        "Visitante"
      );

    };


  // =====================================================
  // CELULAR
  // =====================================================

  const obtenerCelular =
    (conversacion) => {

      return (
        conversacion?.celularCliente ||
        conversacion?.celular ||
        ""
      );

    };


  // =====================================================
  // TIPO
  // =====================================================

  const obtenerTipo =
    (conversacion) => {

      if (
        conversacion?.tipo ===
          "envio" ||
        conversacion?.pedidoId
      ) {

        return "envio";

      }


      return "consulta";

    };


  // =====================================================
  // ESTADO
  // =====================================================

  const obtenerEstado =
    (conversacion) => {

      if (
        conversacion?.estado
      ) {

        return conversacion.estado;

      }


      if (
        conversacion?.esperando ===
        "cliente"
      ) {

        return "Esperando cliente";

      }


      return "Esperando admin";

    };


  // =====================================================
  // WHATSAPP DEL CLIENTE
  // =====================================================

  const abrirWhatsApp =
    (conversacion) => {

      // ===============================================
      // OBTENER EL NÚMERO GUARDADO
      // ===============================================

      const celularGuardado =
        obtenerCelular(
          conversacion
        );


      if (!celularGuardado) {

        alert(
          "Este cliente no tiene un número de celular registrado."
        );

        return;

      }


      // ===============================================
      // LIMPIAR NÚMERO
      // ===============================================

      let celular =
        String(
          celularGuardado
        ).replace(
          /\D/g,
          ""
        );


      // ===============================================
      // NORMALIZAR NÚMERO COLOMBIANO
      // ===============================================
      //
      // 3057823390
      // ↓
      // 573057823390
      // ===============================================

      if (
        celular.length === 10
      ) {

        celular =
          `57${celular}`;

      }


      // ===============================================
      // SI VIENE COMO 057...
      // ===============================================

      if (
        celular.length === 13 &&
        celular.startsWith(
          "057"
        )
      ) {

        celular =
          celular.substring(1);

      }


      // ===============================================
      // VALIDAR NÚMERO COLOMBIANO
      // ===============================================

      if (
        !celular.startsWith(
          "57"
        ) ||
        celular.length !== 12
      ) {

        alert(
          `El número ${celularGuardado} no parece ser un celular colombiano válido.`
        );

        return;

      }


      // ===============================================
      // MENSAJE
      // ===============================================

      const nombre =
        obtenerNombre(
          conversacion
        );


      const mensaje =
        `Hola ${nombre}, te escribimos de Café de Origen Colombiano en respuesta a tu consulta.`;


      // ===============================================
      // CREAR URL
      // ===============================================

      const url =
        `https://wa.me/${celular}?text=${encodeURIComponent(
          mensaje
        )}`;


      // ===============================================
      // VERIFICAR EN CONSOLA
      // ===============================================

      console.log(
        "Celular guardado:",
        celularGuardado
      );

      console.log(
        "Celular WhatsApp:",
        celular
      );

      console.log(
        "URL WhatsApp:",
        url
      );


      // ===============================================
      // ABRIR WHATSAPP
      // ===============================================

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

    };


  // =====================================================
  // FILTRAR
  // =====================================================

  const conversacionesFiltradas =
    conversaciones.filter(
      (conversacion) => {

        if (
          filtro === "todas"
        ) {

          return true;

        }


        return (
          obtenerTipo(
            conversacion
          ) === filtro
        );

      }
    );


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="admin-conversaciones-page">


      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div className="admin-conversaciones-header">


        <div className="admin-conversaciones-header-superior">


          <button
            type="button"
            className="btn-volver-admin"
            onClick={() =>
              navigate(
                "/admin"
              )
            }
          >

            <ArrowLeft
              size={19}
            />

            Volver al panel administrador

          </button>


        </div>


        <h1>
          Consultas de clientes
        </h1>


        <p>
          Responde preguntas sobre nuestros cafés,
          solicitudes generales y conversaciones
          relacionadas con el envío de pedidos.
        </p>


        {/* ===============================================
            FILTROS
        =============================================== */}

        <div className="admin-consultas-filtros">


          <button
            type="button"
            className={
              filtro === "todas"
                ? "activo"
                : ""
            }
            onClick={() =>
              setFiltro(
                "todas"
              )
            }
          >
            Todas
          </button>


          <button
            type="button"
            className={
              filtro === "consulta"
                ? "activo"
                : ""
            }
            onClick={() =>
              setFiltro(
                "consulta"
              )
            }
          >

            <MessageCircle
              size={16}
            />

            Consultas

          </button>


          <button
            type="button"
            className={
              filtro === "envio"
                ? "activo"
                : ""
            }
            onClick={() =>
              setFiltro(
                "envio"
              )
            }
          >

            <Truck
              size={16}
            />

            Envíos

          </button>


        </div>


      </div>


      {/* =================================================
          CONTENIDO
      ================================================= */}

      <div className="admin-chat-layout">


        {/* =================================================
            LISTA
        ================================================= */}

        <aside className="lista-conversaciones">


          <h2>
            Consultas
          </h2>


          {cargando ? (

            <div className="conversaciones-sin-datos">

              Cargando consultas...

            </div>

          ) : conversacionesFiltradas.length === 0 ? (

            <div className="conversaciones-sin-datos">


              <strong>
                No hay consultas
              </strong>


              <p>
                Las preguntas de los clientes y
                solicitudes para acordar el envío
                aparecerán aquí automáticamente.
              </p>


            </div>

          ) : (

            conversacionesFiltradas.map(
              (conversacion) => {

                const tipo =
                  obtenerTipo(
                    conversacion
                  );


                const noLeidos =
                  Number(
                    conversacion
                      .noLeidosAdmin ??
                    conversacion
                      .noLeidos ??
                    0
                  );


                return (

                  <button
                    type="button"
                    key={
                      conversacion.id
                    }
                    className={`conversacion-item ${
                      conversacionActiva?.id ===
                      conversacion.id
                        ? "activa"
                        : ""
                    }`}
                    onClick={() =>
                      abrirConversacion(
                        conversacion
                      )
                    }
                  >


                    <div className="conversacion-superior">


                      <strong>

                        {obtenerNombre(
                          conversacion
                        )}

                      </strong>


                      {noLeidos > 0 && (

                        <span className="badge-no-leido">

                          {noLeidos}

                        </span>

                      )}


                    </div>


                    {/* TIPO */}

                    <div
                      className={`tipo-consulta tipo-${tipo}`}
                    >

                      {tipo === "envio" ? (

                        <>

                          <Truck
                            size={14}
                          />

                          Solicitud de envío

                        </>

                      ) : (

                        <>

                          <MessageCircle
                            size={14}
                          />

                          Consulta

                        </>

                      )}

                    </div>


                    {/* PRODUCTO */}

                    {conversacion
                      .productoNombre && (

                      <span className="consulta-producto-admin">

                        <Coffee
                          size={14}
                        />

                        {
                          conversacion
                            .productoNombre
                        }

                      </span>

                    )}


                    {/* PEDIDO */}

                    {conversacion
                      .pedidoId && (

                      <span className="pedido-numero">

                        Pedido #

                        {
                          conversacion
                            .pedidoId
                        }

                      </span>

                    )}


                    {/* ÚLTIMO MENSAJE */}

                    <p>

                      {
                        conversacion
                          .ultimoMensaje ||
                        "Consulta iniciada"
                      }

                    </p>


                    {/* ESTADO */}

                    <small>

                      {obtenerEstado(
                        conversacion
                      )}

                    </small>


                  </button>

                );

              }
            )

          )}


        </aside>


        {/* =================================================
            CHAT
        ================================================= */}

        <section className="panel-chat">


          {!conversacionActiva ? (

            <div className="chat-vacio">


              <MessageCircle
                size={42}
              />


              <h2>
                Selecciona una consulta
              </h2>


              <p>
                Aquí podrás responder las preguntas
                de los clientes y gestionar las
                solicitudes de envío.
              </p>


            </div>

          ) : (

            <>


              {/* ===========================================
                  HEADER CHAT
              =========================================== */}

              <div className="chat-header">


                <div>


                  <h2>

                    {obtenerNombre(
                      conversacionActiva
                    )}

                  </h2>


                  <span>

                    {
                      obtenerTipo(
                        conversacionActiva
                      ) === "envio"

                        ? "Solicitud de envío"

                        : conversacionActiva
                            .productoNombre

                          ? `Consulta sobre ${conversacionActiva.productoNombre}`

                          : "Consulta general"
                    }

                  </span>


                </div>


                <div className="chat-header-acciones">


                  {/* ESTADO */}

                  <span className="estado-conversacion">

                    {obtenerEstado(
                      conversacionActiva
                    )}

                  </span>


                  {/* WHATSAPP */}

                  {obtenerCelular(
                    conversacionActiva
                  ) && (

                    <button
                      type="button"
                      className="btn-whatsapp-admin"
                      onClick={() =>
                        abrirWhatsApp(
                          conversacionActiva
                        )
                      }
                    >

                      <Phone
                        size={17}
                      />

                      WhatsApp

                    </button>

                  )}


                  {/* INFORMACIÓN */}

                  <button
                    type="button"
                    className="btn-info-cliente"
                    onClick={() =>
                      setMostrarInfoCliente(
                        true
                      )
                    }
                  >

                    Información del cliente

                  </button>


                </div>


              </div>


              {/* ===========================================
                  MENSAJES
              =========================================== */}

              <div className="chat-mensajes">


                {mensajes.length === 0 ? (

                  <div className="chat-mensajes-vacio">

                    Aún no hay mensajes.

                  </div>

                ) : (

                  mensajes.map(
                    (mensaje) => {

                      const esAdmin =
                        mensaje.autor ===
                          "admin" ||
                        mensaje.remitente ===
                          "admin";


                      return (

                        <div
                          key={
                            mensaje.id
                          }
                          className={`mensaje ${
                            esAdmin
                              ? "mensaje-admin"
                              : "mensaje-cliente"
                          }`}
                        >


                          <span className="mensaje-autor">

                            {
                              esAdmin
                                ? "Café de Origen"
                                : obtenerNombre(
                                    conversacionActiva
                                  )
                            }

                          </span>


                          <p>
                            {mensaje.texto}
                          </p>


                        </div>

                      );

                    }
                  )

                )}


              </div>


              {/* ===========================================
                  RESPONDER
              =========================================== */}

              <div className="chat-input-area">


                <textarea
                  value={
                    mensajeNuevo
                  }
                  onChange={(e) =>
                    setMensajeNuevo(
                      e.target.value
                    )
                  }
                  onKeyDown={
                    manejarTecla
                  }
                  placeholder="Escribe una respuesta..."
                  disabled={
                    enviando
                  }
                />


                <button
                  type="button"
                  onClick={
                    enviarMensaje
                  }
                  disabled={
                    enviando ||
                    !mensajeNuevo.trim()
                  }
                >

                  {
                    enviando
                      ? "Enviando..."
                      : "Enviar"
                  }

                </button>


              </div>


            </>

          )}


        </section>


      </div>


      {/* =================================================
          MODAL INFORMACIÓN CLIENTE
      ================================================= */}

      {mostrarInfoCliente &&
        conversacionActiva && (

        <div className="modal-cliente-overlay">


          <div className="modal-cliente">


            {/* CERRAR */}

            <button
              type="button"
              className="modal-cliente-cerrar"
              onClick={() =>
                setMostrarInfoCliente(
                  false
                )
              }
            >
              ×
            </button>


            <h2>
              Información del cliente
            </h2>


            {/* ===========================================
                DATOS CLIENTE
            =========================================== */}

            <div className="cliente-info-bloque">


              <div className="cliente-info-item">

                <span>
                  Nombre
                </span>

                <strong>

                  {obtenerNombre(
                    conversacionActiva
                  )}

                </strong>

              </div>


              <div className="cliente-info-item">

                <span>
                  Celular / WhatsApp
                </span>

                <strong>

                  {
                    obtenerCelular(
                      conversacionActiva
                    ) ||
                    "No disponible"
                  }

                </strong>

              </div>


              <div className="cliente-info-item">

                <span>
                  Tipo de cliente
                </span>

                <strong>

                  {
                    conversacionActiva
                      .origen ===
                    "visitante"

                      ? "Visitante"

                      : "Cliente registrado"
                  }

                </strong>

              </div>


            </div>


            {/* ===========================================
                PRODUCTO
            =========================================== */}

            {conversacionActiva
              .productoNombre && (

              <div className="cliente-info-seccion">


                <h3>
                  Producto consultado
                </h3>


                <div className="cliente-info-item">

                  <span>
                    Café
                  </span>

                  <strong>

                    {
                      conversacionActiva
                        .productoNombre
                    }

                  </strong>

                </div>


              </div>

            )}


            {/* ===========================================
                PEDIDO
            =========================================== */}

            {conversacionActiva
              .pedidoId && (

              <div className="cliente-info-seccion">


                <h3>
                  Pedido
                </h3>


                <div className="cliente-info-item">

                  <span>
                    Número de pedido
                  </span>

                  <strong>

                    #

                    {
                      conversacionActiva
                        .pedidoId
                    }

                  </strong>

                </div>


              </div>

            )}


            {/* ===========================================
                WHATSAPP
            =========================================== */}

            {obtenerCelular(
              conversacionActiva
            ) && (

              <button
                type="button"
                className="btn-whatsapp-modal"
                onClick={() =>
                  abrirWhatsApp(
                    conversacionActiva
                  )
                }
              >

                <Phone
                  size={18}
                />

                Contactar por WhatsApp

              </button>

            )}


            {/* ===========================================
                VOLVER
            =========================================== */}

            <button
              type="button"
              className="btn-volver-chat"
              onClick={() =>
                setMostrarInfoCliente(
                  false
                )
              }
            >

              Volver a la consulta

            </button>


          </div>


        </div>

      )}


    </div>

  );

}


export default AdminConsultas;