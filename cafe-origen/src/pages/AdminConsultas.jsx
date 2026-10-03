import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import {
  ArrowLeft,
  ChevronRight,
  CircleUserRound,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Send,
  ShoppingBag,
  Truck
} from "lucide-react";

import { db } from "../firebaseConfig";

import "../css/adminConversaciones.css";


// =====================================================
// ADMIN CONSULTAS
// =====================================================

function AdminConsultas() {

  const navigate = useNavigate();

  const mensajesFinalRef = useRef(null);


  // ===================================================
  // ESTADOS
  // ===================================================

  const [
    conversaciones,
    setConversaciones
  ] = useState([]);


  const [
    conversacionSeleccionada,
    setConversacionSeleccionada
  ] = useState(null);


  const [
    mensajes,
    setMensajes
  ] = useState([]);


  const [
    nuevoMensaje,
    setNuevoMensaje
  ] = useState("");


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


  const [
    busqueda,
    setBusqueda
  ] = useState("");


  const [
    mostrarInfoCliente,
    setMostrarInfoCliente
  ] = useState(false);


  // ===================================================
  // PEDIDO
  // ===================================================

  const [
    pedidoSeleccionado,
    setPedidoSeleccionado
  ] = useState(null);


  const [
    cargandoPedido,
    setCargandoPedido
  ] = useState(false);


  // ===================================================
  // PERFIL DEL CLIENTE
  // ===================================================

  const [
    perfilCliente,
    setPerfilCliente
  ] = useState(null);


  const [
    cargandoPerfilCliente,
    setCargandoPerfilCliente
  ] = useState(false);


  // ===================================================
  // ESCUCHAR CONVERSACIONES
  // ===================================================

  useEffect(() => {

    const conversacionesRef =
      collection(db, "conversaciones");


    const unsubscribe =
      onSnapshot(
        conversacionesRef,

        (snapshot) => {

          const lista =
            snapshot.docs.map((documento) => ({
              id: documento.id,
              ...documento.data()
            }));


          // Ordenar por fecha más reciente
          lista.sort((a, b) => {

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

          });


          setConversaciones(lista);

          setCargando(false);


          // Actualizar la conversación seleccionada
          // si Firestore cambia sus datos.

          setConversacionSeleccionada(
            (actual) => {

              if (!actual) {
                return actual;
              }


              const actualizada =
                lista.find(
                  (item) =>
                    item.id === actual.id
                );


              return actualizada || actual;

            }
          );

        },

        (error) => {

          console.error(
            "Error cargando conversaciones:",
            error
          );

          setCargando(false);

        }
      );


    return () => unsubscribe();

  }, []);


  // ===================================================
  // OBTENER NOMBRE DEL CLIENTE
  // ===================================================

  const obtenerNombreCliente = (conversacion) => {

    if (!conversacion) {
      return "Cliente";
    }


    return (
      conversacion.nombreCliente ||
      conversacion.clienteNombre ||
      conversacion.nombre ||
      conversacion.usuarioNombre ||
      conversacion.cliente?.nombre ||
      "Cliente"
    );

  };


  // ===================================================
  // OBTENER UID DEL CLIENTE
  // ===================================================

  const obtenerUidCliente = (conversacion) => {

    if (!conversacion) {
      return "";
    }


    return (
      conversacion.uidCliente ||
      conversacion.clienteUid ||
      conversacion.usuarioId ||
      conversacion.uid ||
      conversacion.cliente?.uid ||
      ""
    );

  };


  // ===================================================
  // OBTENER ID DEL PEDIDO
  // ===================================================

  const obtenerPedidoId = (conversacion) => {

    if (!conversacion) {
      return "";
    }


    return (
      conversacion.pedidoId ||
      conversacion.idPedido ||
      conversacion.pedido?.id ||
      ""
    );

  };


  // ===================================================
  // OBTENER TIPO
  // ===================================================

  const obtenerTipoConversacion = (conversacion) => {

    const tipo =
      String(
        conversacion?.tipo ||
        conversacion?.tipoConsulta ||
        conversacion?.categoria ||
        ""
      ).toLowerCase();


    const pedidoId =
      obtenerPedidoId(conversacion);


    if (
      tipo.includes("envio") ||
      tipo.includes("envío") ||
      tipo.includes("pedido") ||
      pedidoId
    ) {
      return "envio";
    }


    return "consulta";

  };


  // ===================================================
  // OBTENER ESTADO
  // ===================================================

  const obtenerEstado = (conversacion) => {

    return (
      conversacion?.estado ||
      conversacion?.estadoConversacion ||
      "Pendiente"
    );

  };


  // ===================================================
  // OBTENER TEXTO DEL ÚLTIMO MENSAJE
  // ===================================================

  const obtenerUltimoMensaje = (conversacion) => {

    return (
      conversacion?.ultimoMensaje ||
      conversacion?.mensaje ||
      conversacion?.consulta ||
      conversacion?.descripcion ||
      "Sin mensajes todavía"
    );

  };


  // ===================================================
  // CARGAR PERFIL DEL CLIENTE
  // ===================================================

  const cargarPerfilCliente = async (
    conversacion
  ) => {

    setPerfilCliente(null);


    const uidCliente =
      obtenerUidCliente(conversacion);


    if (!uidCliente) {

      console.warn(
        "La conversación no contiene UID del cliente:",
        conversacion
      );

      return;

    }


    try {

      setCargandoPerfilCliente(true);


      const perfilRef =
        doc(
          db,
          "usuarios",
          uidCliente
        );


      const perfilSnap =
        await getDoc(perfilRef);


      if (perfilSnap.exists()) {

        setPerfilCliente({
          id: perfilSnap.id,
          ...perfilSnap.data()
        });

      } else {

        console.warn(
          "No existe perfil para el cliente:",
          uidCliente
        );

        setPerfilCliente(null);

      }


    } catch (error) {

      console.error(
        "Error cargando perfil del cliente:",
        error
      );


      setPerfilCliente(null);


    } finally {

      setCargandoPerfilCliente(false);

    }

  };


  // ===================================================
  // CARGAR PEDIDO
  // ===================================================

  const cargarPedido = async (
    conversacion
  ) => {

    setPedidoSeleccionado(null);


    const pedidoId =
      obtenerPedidoId(conversacion);


    if (!pedidoId) {
      return;
    }


    try {

      setCargandoPedido(true);


      const pedidoRef =
        doc(
          db,
          "pedidos",
          pedidoId
        );


      const pedidoSnap =
        await getDoc(pedidoRef);


      if (pedidoSnap.exists()) {

        setPedidoSeleccionado({
          id: pedidoSnap.id,
          ...pedidoSnap.data()
        });

      } else {

        console.warn(
          "No se encontró el pedido:",
          pedidoId
        );

      }


    } catch (error) {

      console.error(
        "Error cargando pedido:",
        error
      );


    } finally {

      setCargandoPedido(false);

    }

  };


  // ===================================================
  // SELECCIONAR CONVERSACIÓN
  // ===================================================

  const seleccionarConversacion = (
    conversacion
  ) => {

    setConversacionSeleccionada(
      conversacion
    );


    setMostrarInfoCliente(false);

    setNuevoMensaje("");

    setMensajes([]);

    setPerfilCliente(null);

    setPedidoSeleccionado(null);


    cargarPerfilCliente(
      conversacion
    );


    cargarPedido(
      conversacion
    );

  };


  // ===================================================
  // ESCUCHAR MENSAJES DE LA CONVERSACIÓN
  // ===================================================

  useEffect(() => {

    if (!conversacionSeleccionada?.id) {

      setMensajes([]);

      return;

    }


    const mensajesRef =
      collection(
        db,
        "conversaciones",
        conversacionSeleccionada.id,
        "mensajes"
      );


    const mensajesQuery =
      query(
        mensajesRef,
        orderBy("fecha", "asc")
      );


    const unsubscribe =
      onSnapshot(
        mensajesQuery,

        (snapshot) => {

          const lista =
            snapshot.docs.map(
              (documento) => ({
                id: documento.id,
                ...documento.data()
              })
            );


          setMensajes(lista);

        },

        (error) => {

          console.error(
            "Error cargando mensajes:",
            error
          );

        }
      );


    return () => unsubscribe();

  }, [
    conversacionSeleccionada?.id
  ]);


  // ===================================================
  // SCROLL AUTOMÁTICO DEL CHAT
  // ===================================================

  useEffect(() => {

    mensajesFinalRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [mensajes]);


  // ===================================================
  // ENVIAR MENSAJE
  // ===================================================

  const enviarMensaje = async (e) => {

    e?.preventDefault();


    const texto =
      nuevoMensaje.trim();


    if (
      !texto ||
      !conversacionSeleccionada?.id ||
      enviando
    ) {
      return;
    }


    try {

      setEnviando(true);


      const mensajesRef =
        collection(
          db,
          "conversaciones",
          conversacionSeleccionada.id,
          "mensajes"
        );


      await addDoc(
        mensajesRef,
        {

          texto,

          mensaje: texto,

          autor: "admin",

          remitente: "admin",

          fecha:
            serverTimestamp()

        }
      );


      const conversacionRef =
        doc(
          db,
          "conversaciones",
          conversacionSeleccionada.id
        );


      await updateDoc(
        conversacionRef,
        {

          ultimoMensaje: texto,

          estado:
            "Esperando cliente",

          actualizado:
            serverTimestamp()

        }
      );


      setNuevoMensaje("");


    } catch (error) {

      console.error(
        "Error enviando mensaje:",
        error
      );


      alert(
        "No fue posible enviar el mensaje."
      );


    } finally {

      setEnviando(false);

    }

  };


  // ===================================================
  // OBTENER DATOS DEL CLIENTE
  // ===================================================

  const obtenerEmailCliente = () => {

    return (
      perfilCliente?.email ||
      conversacionSeleccionada?.emailCliente ||
      conversacionSeleccionada?.email ||
      "No disponible"
    );

  };


  const obtenerCelularCliente = () => {

    return (
      perfilCliente?.celular ||
      perfilCliente?.telefono ||
      conversacionSeleccionada?.celular ||
      conversacionSeleccionada?.telefono ||
      conversacionSeleccionada?.celularCliente ||
      ""
    );

  };


  const obtenerDireccionCliente = () => {

    return (
      perfilCliente?.direccion ||
      conversacionSeleccionada?.direccion ||
      conversacionSeleccionada?.direccionCliente ||
      "No disponible"
    );

  };


  // ===================================================
  // WHATSAPP
  // ===================================================

  const abrirWhatsApp = () => {

    const celular =
      obtenerCelularCliente();


    if (!celular) {

      alert(
        "Este cliente no tiene un número de teléfono registrado."
      );

      return;

    }


    let numero =
      String(celular)
        .replace(/\D/g, "");


    // Colombia:
    // si el usuario guardó 10 dígitos,
    // agregamos indicativo 57.

    if (numero.length === 10) {

      numero = `57${numero}`;

    }


    if (
      numero.length < 11 ||
      numero.length > 13
    ) {

      alert(
        "El número de celular registrado no parece válido."
      );

      return;

    }


    const nombre =
      obtenerNombreCliente(
        conversacionSeleccionada
      );


    const pedidoId =
      obtenerPedidoId(
        conversacionSeleccionada
      );


    let mensaje =
      `Hola ${nombre}, te escribimos de Café de Origen`;


    if (pedidoId) {

      mensaje +=
        ` sobre tu pedido #${pedidoId}`;

    }


    mensaje += ".";


    const url =
      `https://wa.me/${numero}?text=${encodeURIComponent(
        mensaje
      )}`;


    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  };


  // ===================================================
  // FILTRAR CONVERSACIONES
  // ===================================================

  const conversacionesFiltradas =
    useMemo(() => {

      const textoBusqueda =
        busqueda
          .trim()
          .toLowerCase();


      return conversaciones.filter(
        (conversacion) => {

          const tipo =
            obtenerTipoConversacion(
              conversacion
            );


          const estado =
            String(
              obtenerEstado(
                conversacion
              )
            ).toLowerCase();


          // FILTRO

          if (
            filtro === "envios" &&
            tipo !== "envio"
          ) {
            return false;
          }


          if (
            filtro === "consultas" &&
            tipo !== "consulta"
          ) {
            return false;
          }


          if (
            filtro === "pendientes" &&
            !(
              estado.includes("pendiente") ||
              estado.includes("esperando admin")
            )
          ) {
            return false;
          }


          // BUSCADOR

          if (!textoBusqueda) {
            return true;
          }


          const nombre =
            obtenerNombreCliente(
              conversacion
            ).toLowerCase();


          const pedido =
            obtenerPedidoId(
              conversacion
            ).toLowerCase();


          const ultimoMensaje =
            obtenerUltimoMensaje(
              conversacion
            ).toLowerCase();


          return (
            nombre.includes(textoBusqueda) ||
            pedido.includes(textoBusqueda) ||
            ultimoMensaje.includes(textoBusqueda)
          );

        }
      );

    }, [
      conversaciones,
      filtro,
      busqueda
    ]);


  // ===================================================
  // CONTADORES
  // ===================================================

  const totalPendientes =
    conversaciones.filter(
      (conversacion) => {

        const estado =
          String(
            obtenerEstado(
              conversacion
            )
          ).toLowerCase();


        return (
          estado.includes("pendiente") ||
          estado.includes("esperando admin")
        );

      }
    ).length;


  const totalEnvios =
    conversaciones.filter(
      (conversacion) =>
        obtenerTipoConversacion(
          conversacion
        ) === "envio"
    ).length;
      // ===================================================
  // PRODUCTOS DEL PEDIDO
  // ===================================================

  const productosPedido =
    pedidoSeleccionado?.productos ||
    pedidoSeleccionado?.items ||
    pedidoSeleccionado?.carrito ||
    [];


  // ===================================================
  // TOTAL DE PRODUCTOS
  // ===================================================

  const totalProductosPedido =
    productosPedido.reduce(
      (total, producto) => {

        return (
          total +
          Number(
            producto.cantidad ||
            producto.qty ||
            1
          )
        );

      },
      0
    );


  // ===================================================
  // FORMATEAR FECHA
  // ===================================================

  const formatearFecha = (fecha) => {

    if (!fecha) {
      return "";
    }


    try {

      let fechaReal;


      if (fecha?.toDate) {

        fechaReal =
          fecha.toDate();

      } else if (fecha?.seconds) {

        fechaReal =
          new Date(
            fecha.seconds * 1000
          );

      } else {

        fechaReal =
          new Date(fecha);

      }


      return fechaReal.toLocaleString(
        "es-CO",
        {
          dateStyle: "short",
          timeStyle: "short"
        }
      );


    } catch {

      return "";

    }

  };


  // ===================================================
  // ABRIR INFORMACIÓN DEL CLIENTE
  // ===================================================

  const abrirInformacionCliente = async () => {

    if (!conversacionSeleccionada) {
      return;
    }


    setMostrarInfoCliente(true);


    // Volvemos a consultar los datos para que el
    // administrador siempre vea el perfil más reciente.

    await Promise.all([
      cargarPerfilCliente(
        conversacionSeleccionada
      ),

      cargarPedido(
        conversacionSeleccionada
      )
    ]);

  };


  // ===================================================
  // CERRAR INFORMACIÓN DEL CLIENTE
  // ===================================================

  const cerrarInformacionCliente = () => {

    setMostrarInfoCliente(false);

  };


  // ===================================================
  // INTERFAZ
  // ===================================================

  return (

    <div className="admin-consultas-page">


      {/* ===============================================
          CABECERA DE LA PÁGINA
      =============================================== */}

      <section className="admin-consultas-hero">

        <div className="admin-consultas-hero-contenido">

          <button
            type="button"
            className="admin-consultas-volver"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft size={18} />

            Volver al panel administrativo
          </button>


          <h1>
            Consultas de clientes
          </h1>


          <p>
            Responde preguntas sobre nuestros cafés,
            solicitudes generales y conversaciones
            relacionadas con el envío de pedidos.
          </p>


          {/* ===========================================
              CONTADORES
          =========================================== */}

          <div className="admin-consultas-resumen">


            <div className="admin-resumen-card">

              <strong>
                {conversaciones.length}
              </strong>

              <span>
                Conversaciones
              </span>

            </div>


            <div className="admin-resumen-card">

              <strong>
                {totalPendientes}
              </strong>

              <span>
                Pendientes
              </span>

            </div>


            <div className="admin-resumen-card">

              <strong>
                {totalEnvios}
              </strong>

              <span>
                Envíos
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ===============================================
          CONTENIDO PRINCIPAL
      =============================================== */}

      <main className="admin-consultas-main">


        {/* =============================================
            BARRA DE HERRAMIENTAS
        ============================================= */}

        <div className="admin-consultas-toolbar">


          {/* BUSCADOR */}

          <div className="admin-consultas-buscador">

            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar cliente o pedido..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
            />

          </div>


          {/* ===========================================
              FILTROS
          =========================================== */}

          <div className="admin-consultas-filtros">


            <button
              type="button"
              className={
                filtro === "todas"
                  ? "activo"
                  : ""
              }
              onClick={() =>
                setFiltro("todas")
              }
            >
              Todas
            </button>


            <button
              type="button"
              className={
                filtro === "pendientes"
                  ? "activo"
                  : ""
              }
              onClick={() =>
                setFiltro("pendientes")
              }
            >
              Pendientes
            </button>


            <button
              type="button"
              className={
                filtro === "envios"
                  ? "activo"
                  : ""
              }
              onClick={() =>
                setFiltro("envios")
              }
            >
              <Truck size={16} />

              Envíos
            </button>


            <button
              type="button"
              className={
                filtro === "consultas"
                  ? "activo"
                  : ""
              }
              onClick={() =>
                setFiltro("consultas")
              }
            >
              <MessageCircle size={16} />

              Consultas
            </button>

          </div>

        </div>


        {/* =============================================
            CARGANDO
        ============================================= */}

        {cargando ? (

          <div className="admin-consultas-estado">

            <p>
              Cargando conversaciones...
            </p>

          </div>

        ) : conversacionesFiltradas.length === 0 ? (

          /* ===========================================
             SIN CONVERSACIONES
          =========================================== */

          <div className="admin-consultas-estado">

            <MessageCircle size={38} />

            <h3>
              No hay conversaciones
            </h3>

            <p>
              No encontramos conversaciones
              que coincidan con este filtro.
            </p>

          </div>

        ) : (

          /* ===========================================
             LAYOUT CHAT
          =========================================== */

          <div className="admin-chat-layout">


            {/* =========================================
                LISTA DE CONVERSACIONES
            ========================================= */}

            <aside className="lista-conversaciones">


              <div className="lista-conversaciones-header">

                <h2>
                  Consultas
                </h2>

                <span>
                  {
                    conversacionesFiltradas.length
                  }
                </span>

              </div>


              <div className="lista-conversaciones-contenido">

                {conversacionesFiltradas.map(
                  (conversacion) => {

                    const tipo =
                      obtenerTipoConversacion(
                        conversacion
                      );


                    const pedidoId =
                      obtenerPedidoId(
                        conversacion
                      );


                    const activa =
                      conversacionSeleccionada?.id ===
                      conversacion.id;


                    return (

                      <button
                        type="button"
                        key={
                          conversacion.id
                        }
                        className={
                          `conversacion-item ${
                            activa
                              ? "activa"
                              : ""
                          }`
                        }
                        onClick={() =>
                          seleccionarConversacion(
                            conversacion
                          )
                        }
                      >


                        {/* =============================
                            NOMBRE
                        ============================= */}

                        <div className="conversacion-superior">

                          <strong>
                            {obtenerNombreCliente(
                              conversacion
                            )}
                          </strong>


                          <ChevronRight
                            size={18}
                          />

                        </div>


                        {/* =============================
                            TIPO
                        ============================= */}

                        <div
                          className={
                            tipo === "envio"
                              ? "conversacion-tipo envio"
                              : "conversacion-tipo consulta"
                          }
                        >

                          {tipo === "envio" ? (

                            <>
                              <Truck size={14} />
                              SOLICITUD DE ENVÍO
                            </>

                          ) : (

                            <>
                              <MessageCircle
                                size={14}
                              />
                              CONSULTA
                            </>

                          )}

                        </div>


                        {/* =============================
                            PEDIDO
                        ============================= */}

                        {pedidoId && (

                          <div className="conversacion-pedido">

                            Pedido #{pedidoId}

                          </div>

                        )}


                        {/* =============================
                            ÚLTIMO MENSAJE
                        ============================= */}

                        <p className="conversacion-preview">

                          {obtenerUltimoMensaje(
                            conversacion
                          )}

                        </p>


                        {/* =============================
                            ESTADO
                        ============================= */}

                        <span className="conversacion-estado">

                          {obtenerEstado(
                            conversacion
                          )}

                        </span>

                      </button>

                    );

                  }
                )}

              </div>

            </aside>


            {/* =========================================
                PANEL DERECHO
            ========================================= */}

            <section className="panel-chat">


              {!conversacionSeleccionada ? (

                /* =====================================
                   NINGUNA CONVERSACIÓN SELECCIONADA
                ===================================== */

                <div className="panel-chat-vacio">

                  <MessageCircle
                    size={52}
                  />

                  <h3>
                    Selecciona una conversación
                  </h3>

                  <p>
                    Elige una consulta de la lista
                    para ver los mensajes y responder
                    al cliente.
                  </p>

                </div>

              ) : (

                <>


                  {/* ===================================
                      CABECERA DEL CHAT
                  =================================== */}

                  <div className="chat-header">


                    <div className="chat-header-cliente">

                      <div className="chat-avatar">

                        <CircleUserRound
                          size={25}
                        />

                      </div>


                      <div>

                        <h2>
                          {obtenerNombreCliente(
                            conversacionSeleccionada
                          )}
                        </h2>


                        <span>
                          {
                            obtenerTipoConversacion(
                              conversacionSeleccionada
                            ) === "envio"
                              ? "Solicitud de envío"
                              : "Consulta"
                          }
                        </span>

                      </div>

                    </div>


                    {/* ===============================
                        ACCIONES
                    =============================== */}

                    <div className="chat-header-acciones">


                      <span className="chat-estado">

                        {obtenerEstado(
                          conversacionSeleccionada
                        )}

                      </span>


                      <button
                        type="button"
                        className="btn-whatsapp"
                        onClick={
                          abrirWhatsApp
                        }
                      >
                        <Phone size={17} />

                        WhatsApp
                      </button>


                      <button
                        type="button"
                        className="btn-info-cliente"
                        onClick={
                          abrirInformacionCliente
                        }
                      >
                        <Info size={17} />

                        Información del cliente
                      </button>

                    </div>

                  </div>


                  {/* ===================================
                      RESUMEN DEL PEDIDO EN EL CHAT
                  =================================== */}

                  {obtenerPedidoId(
                    conversacionSeleccionada
                  ) && (

                    <div className="chat-pedido-resumen">

                      <div className="chat-pedido-icono">

                        <ShoppingBag
                          size={21}
                        />

                      </div>


                      <div>

                        <span>
                          Pedido asociado
                        </span>

                        <strong>
                          #
                          {obtenerPedidoId(
                            conversacionSeleccionada
                          )}
                        </strong>

                      </div>


                      {cargandoPedido ? (

                        <span className="chat-pedido-cargando">
                          Cargando pedido...
                        </span>

                      ) : productosPedido.length > 0 ? (

                        <span className="chat-pedido-productos">

                          {productosPedido
                            .map(
                              (producto) => {

                                const cantidad =
                                  Number(
                                    producto.cantidad ||
                                    producto.qty ||
                                    1
                                  );


                                const nombre =
                                  producto.nombre ||
                                  producto.producto ||
                                  producto.titulo ||
                                  "Producto";


                                const presentacion =
                                  producto.presentacion ||
                                  producto.peso ||
                                  producto.tamano ||
                                  producto.tamaño ||
                                  producto.gramos ||
                                  "";


                                return `${cantidad} × ${nombre}${
                                  presentacion
                                    ? ` ${presentacion}`
                                    : ""
                                }`;

                              }
                            )
                            .join(" · ")}

                        </span>

                      ) : null}

                    </div>

                  )}


                  {/* ===================================
                      MENSAJES
                  =================================== */}

                  <div className="chat-mensajes">


                    {mensajes.length === 0 ? (

                      <div className="chat-sin-mensajes">

                        <MessageCircle
                          size={30}
                        />

                        <p>
                          Esta conversación todavía
                          no tiene mensajes.
                        </p>

                      </div>

                    ) : (

                      mensajes.map(
                        (mensaje) => {

                          const esAdmin =
                            mensaje.autor === "admin" ||
                            mensaje.remitente === "admin" ||
                            mensaje.rol === "admin";


                          const texto =
                            mensaje.texto ||
                            mensaje.mensaje ||
                            "";


                          const fechaMensaje =
                            mensaje.fecha ||
                            mensaje.creado ||
                            mensaje.fechaCreacion;


                          return (

                            <div
                              key={mensaje.id}
                              className={
                                esAdmin
                                  ? "mensaje-fila admin"
                                  : "mensaje-fila cliente"
                              }
                            >

                              <div
                                className={
                                  esAdmin
                                    ? "mensaje-burbuja admin"
                                    : "mensaje-burbuja cliente"
                                }
                              >

                                <strong>

                                  {esAdmin
                                    ? "Café de Origen"
                                    : obtenerNombreCliente(
                                        conversacionSeleccionada
                                      )}

                                </strong>


                                <p>
                                  {texto}
                                </p>


                                {fechaMensaje && (

                                  <span className="mensaje-fecha">

                                    {formatearFecha(
                                      fechaMensaje
                                    )}

                                  </span>

                                )}

                              </div>

                            </div>

                          );

                        }
                      )

                    )}


                    <div
                      ref={
                        mensajesFinalRef
                      }
                    />

                  </div>


                  {/* ===================================
                      ESCRIBIR RESPUESTA
                  =================================== */}

                <form
  className="admin-respuesta-form"
  onSubmit={
    enviarMensaje
  }
>
<textarea
  className="admin-respuesta-textarea"
  value={
    nuevoMensaje
  }
  onChange={(e) =>
    setNuevoMensaje(
      e.target.value
    )
  }
  placeholder="Escribe una respuesta al cliente..."
  rows={2}
  disabled={
    enviando
  }
  onKeyDown={(e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      enviarMensaje(e);

    }

  }}
/>

                  <button
  className="admin-respuesta-enviar"
  type="submit"
  disabled={
    enviando ||
    !nuevoMensaje.trim()
  }
>

                      <Send size={18} />

                      {enviando
                        ? "Enviando..."
                        : "Enviar"}

                    </button>

                  </form>

                </>

              )}

            </section>

          </div>

        )}
              </main>


      {/* =================================================
          MODAL INFORMACIÓN DEL CLIENTE
      ================================================= */}

      {mostrarInfoCliente &&
        conversacionSeleccionada && (

        <div
          className="cliente-modal-overlay"
          onClick={
            cerrarInformacionCliente
          }
        >

          <div
            className="cliente-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* ===========================================
                CABECERA
            =========================================== */}

            <div className="cliente-modal-header">

              <div className="cliente-modal-icono">

                <CircleUserRound
                  size={28}
                />

              </div>


              <div>

                <span className="cliente-modal-etiqueta">
                  CLIENTE
                </span>

                <h2>
                  Información del cliente
                </h2>

                <p>
                  Datos asociados a esta conversación
                </p>

              </div>

            </div>


            {/* ===========================================
                CONTENIDO
            =========================================== */}

            <div className="cliente-modal-contenido">


              {/* =========================================
                  DATOS PERSONALES
              ========================================= */}

              <div className="cliente-info-bloque">


                {/* CARGANDO */}

                {cargandoPerfilCliente && (

                  <div className="cliente-info-cargando">

                    Cargando información del cliente...

                  </div>

                )}


                {/* NOMBRE */}

                <div className="cliente-info-item">

                  <span>

                    <CircleUserRound
                      size={16}
                    />

                    NOMBRE

                  </span>

                  <strong>

                    {perfilCliente?.nombre ||
                      obtenerNombreCliente(
                        conversacionSeleccionada
                      )}

                  </strong>

                </div>


                {/* CORREO */}

                <div className="cliente-info-item">

                  <span>

                    <Mail size={16} />

                    CORREO

                  </span>

                  <strong>
                    {obtenerEmailCliente()}
                  </strong>

                </div>


                {/* CELULAR */}

                <div className="cliente-info-item">

                  <span>

                    <Phone size={16} />

                    CELULAR / WHATSAPP

                  </span>

                  <strong>

                    {obtenerCelularCliente() ||
                      "No disponible"}

                  </strong>

                </div>


                {/* DIRECCIÓN */}

                <div className="cliente-info-item">

                  <span>

                    <MapPin size={16} />

                    DIRECCIÓN

                  </span>

                  <strong>
                    {obtenerDireccionCliente()}
                  </strong>

                </div>


                {/* TIPO CLIENTE */}

                <div className="cliente-info-item">

                  <span>
                    TIPO DE CLIENTE
                  </span>

                  <strong>

                    {obtenerUidCliente(
                      conversacionSeleccionada
                    )
                      ? "Cliente registrado"
                      : "Visitante"}

                  </strong>

                </div>

              </div>


              {/* =========================================
                  PEDIDO ASOCIADO
              ========================================= */}

              {obtenerPedidoId(
                conversacionSeleccionada
              ) && (

                <div className="cliente-pedido-bloque">


                  <div className="cliente-pedido-encabezado">

                    <ShoppingBag
                      size={21}
                    />

                    <div>

                      <span>
                        PEDIDO ASOCIADO
                      </span>

                      <strong>

                        #
                        {obtenerPedidoId(
                          conversacionSeleccionada
                        )}

                      </strong>

                    </div>

                  </div>


                  {/* =====================================
                      CARGANDO PEDIDO
                  ===================================== */}

                  {cargandoPedido ? (

                    <div className="cliente-pedido-cargando">

                      Cargando información del pedido...

                    </div>

                  ) : pedidoSeleccionado ? (

                    <>


                      {/* =================================
                          PRODUCTOS
                      ================================= */}

                      <div className="cliente-productos">

                        <h3>
                          Productos solicitados
                        </h3>


                        {productosPedido.length >
                        0 ? (

                          productosPedido.map(
                            (
                              producto,
                              index
                            ) => {

                              const cantidad =
                                Number(
                                  producto.cantidad ||
                                  producto.qty ||
                                  1
                                );


                              const nombre =
                                producto.nombre ||
                                producto.producto ||
                                producto.titulo ||
                                "Producto";


                              const presentacion =
                                producto.presentacion ||
                                producto.peso ||
                                producto.tamano ||
                                producto.tamaño ||
                                producto.gramos ||
                                "";


                              return (

                                <div
                                  className="cliente-producto-item"
                                  key={
                                    producto.id ||
                                    `${nombre}-${index}`
                                  }
                                >

                                  <div className="cliente-producto-cantidad">

                                    {cantidad} ×

                                  </div>


                                  <div className="cliente-producto-info">

                                    <strong>
                                      {nombre}
                                    </strong>


                                    {presentacion && (

                                      <span>
                                        {presentacion}
                                      </span>

                                    )}

                                  </div>

                                </div>

                              );

                            }
                          )

                        ) : (

                          <p className="cliente-productos-vacio">

                            No se encontraron productos
                            asociados a este pedido.

                          </p>

                        )}

                      </div>


                      {/* =================================
                          TOTAL PRODUCTOS
                      ================================= */}

                      <div className="cliente-pedido-total">

                        <span>
                          TOTAL DE PRODUCTOS
                        </span>

                        <strong>
                          {totalProductosPedido}
                        </strong>

                      </div>


                      {/* =================================
                          ESTADO DEL PEDIDO
                      ================================= */}

                      {pedidoSeleccionado.estado && (

                        <div className="cliente-info-item">

                          <span>
                            ESTADO DEL PEDIDO
                          </span>

                          <strong>
                            {pedidoSeleccionado.estado}
                          </strong>

                        </div>

                      )}

                    </>

                  ) : (

                    <div className="cliente-pedido-cargando">

                      No fue posible encontrar la
                      información del pedido.

                    </div>

                  )}

                </div>

              )}


              {/* =========================================
                  WHATSAPP
              ========================================= */}

              <button
                type="button"
                className="btn-whatsapp-modal"
                onClick={
                  abrirWhatsApp
                }
                disabled={
                  !obtenerCelularCliente()
                }
              >

                <Phone size={19} />

                {obtenerCelularCliente()
                  ? "Contactar por WhatsApp"
                  : "WhatsApp no disponible"}

              </button>


              {/* =========================================
                  VOLVER
              ========================================= */}

              <button
                type="button"
                className="btn-volver-consulta"
                onClick={
                  cerrarInformacionCliente
                }
              >

                <ArrowLeft size={18} />

                Volver a la consulta

              </button>


            </div>

          </div>

        </div>

      )}


    </div>

  );

}


export default AdminConsultas;