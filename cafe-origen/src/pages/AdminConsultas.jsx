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


    // =================================================
    // VALIDAR CELULAR
    // =================================================

    if (!celular) {

      alert(
        "Este cliente no tiene un número de teléfono registrado."
      );

      return;

    }


    let numero =
      String(celular)
        .replace(/\D/g, "");


    // =================================================
    // INDICATIVO COLOMBIA
    // =================================================
    // Si el usuario guardó un celular colombiano
    // de 10 dígitos, agregamos 57.

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


    // =================================================
    // NOMBRE DEL CLIENTE
    // =================================================

    const nombre =
      obtenerNombreCliente(
        conversacionSeleccionada
      );


    // =================================================
    // PRODUCTOS DEL PEDIDO
    // =================================================

    const productosWhatsApp =
      pedidoSeleccionado?.productos ||
      pedidoSeleccionado?.items ||
      pedidoSeleccionado?.carrito ||
      [];


    // =================================================
    // CONSTRUIR MENSAJE
    // =================================================

    let mensaje =
      `Hola ${nombre}, te escribimos de Café de Origen.`;


    // =================================================
    // AGREGAR PRODUCTOS
    // =================================================

    if (productosWhatsApp.length > 0) {

      mensaje +=
        `\n\nEstos son los productos de tu pedido:\n`;


      productosWhatsApp.forEach(
        (producto) => {

          const cantidad =
            Number(
              producto.cantidad ||
              producto.qty ||
              1
            );


          const nombreProducto =
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


          mensaje +=
            `\n☕ ${cantidad} × ${nombreProducto}${

              presentacion
                ? ` ${presentacion}`
                : ""

            }`;

        }
      );


      mensaje +=
        `\n\nQueremos comunicarnos contigo para coordinar tu pedido.`;

    } else {

      // Si todavía no hay información de productos,
      // NO mostramos el ID interno del pedido.

      mensaje +=
        `\n\nQueremos comunicarnos contigo para coordinar tu pedido.`;

    }


    // =================================================
    // ABRIR WHATSAPP
    // =================================================

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


          // =============================================
          // FILTRO
          // =============================================

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


          // =============================================
          // BUSCADOR
          // =============================================

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
                  {conversacionesFiltradas.length}
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
                              <MessageCircle size={14} />
                              CONSULTA
                            </>

                          )}

                        </div>


                        {pedidoId && (

                          <div className="conversacion-pedido">

                            Pedido #{pedidoId}

                          </div>

                        )}


                        <p className="conversacion-preview">

                          {obtenerUltimoMensaje(
                            conversacion
                          )}

                        </p>


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

            <section className="panel-conversacion">


              {!conversacionSeleccionada ? (

                <div className="sin-conversacion-seleccionada">

                  <MessageCircle size={46} />

                  <h2>
                    Selecciona una conversación
                  </h2>

                  <p>
                    Elige una consulta de la lista
                    para ver los mensajes y responder
                    al cliente.
                  </p>

                </div>

              ) : (

                <>


                  {/* =====================================
                      CABECERA DE LA CONVERSACIÓN
                  ===================================== */}

                  <div className="chat-header">


                    <div className="chat-header-cliente">

                      <div className="chat-avatar">

                        <CircleUserRound
                          size={28}
                        />

                      </div>


                      <div>

                        <h2>
                          {obtenerNombreCliente(
                            conversacionSeleccionada
                          )}
                        </h2>


                        <div className="chat-header-meta">

                          {obtenerTipoConversacion(
                            conversacionSeleccionada
                          ) === "envio" ? (

                            <span className="chat-tipo envio">

                              <Truck size={14} />

                              Solicitud de envío

                            </span>

                          ) : (

                            <span className="chat-tipo consulta">

                              <MessageCircle size={14} />

                              Consulta

                            </span>

                          )}


                          <span className="chat-estado">

                            {obtenerEstado(
                              conversacionSeleccionada
                            )}

                          </span>

                        </div>

                      </div>

                    </div>


                    {/* ===================================
                        ACCIONES
                    =================================== */}

                    <div className="chat-header-acciones">


                      <button
                        type="button"
                        className="chat-info-btn"
                        onClick={
                          abrirInformacionCliente
                        }
                      >
                        <Info size={18} />

                        Información del cliente
                      </button>


                      <button
                        type="button"
                        className="chat-whatsapp-btn"
                        onClick={
                          abrirWhatsApp
                        }
                      >
                        <Phone size={18} />

                        WhatsApp
                      </button>

                    </div>

                  </div>


                  {/* =====================================
                      INFORMACIÓN DEL PEDIDO
                  ===================================== */}

                  {obtenerPedidoId(
                    conversacionSeleccionada
                  ) && (

                    <div className="chat-pedido-card">


                      <div className="chat-pedido-titulo">

                        <ShoppingBag size={20} />


                        <div>

                          <strong>
                            Pedido del cliente
                          </strong>


                          <span>
                            {
                              totalProductosPedido
                            }{" "}
                            {
                              totalProductosPedido === 1
                                ? "producto"
                                : "productos"
                            }
                          </span>

                        </div>

                      </div>


                      {/* =================================
                          CARGANDO PEDIDO
                      ================================= */}

                      {cargandoPedido ? (

                        <p className="chat-pedido-cargando">
                          Cargando información del pedido...
                        </p>

                      ) : productosPedido.length > 0 ? (

                        <div className="chat-pedido-productos">


                          {productosPedido.map(
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


                              const nombreProducto =
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
                                  className="chat-pedido-producto"
                                  key={
                                    producto.id ||
                                    producto.productoId ||
                                    `${nombreProducto}-${index}`
                                  }
                                >

                                  <div className="chat-pedido-producto-icono">

                                    <ShoppingBag
                                      size={17}
                                    />

                                  </div>


                                  <div className="chat-pedido-producto-info">

                                    <strong>
                                      {nombreProducto}
                                    </strong>


                                    {presentacion && (

                                      <span>
                                        {presentacion}
                                      </span>

                                    )}

                                  </div>


                                  <div className="chat-pedido-producto-cantidad">

                                    {cantidad} ×

                                  </div>

                                </div>

                              );

                            }
                          )}

                        </div>

                      ) : (

                        <p className="chat-pedido-sin-productos">

                          No fue posible obtener
                          los productos de este pedido.

                        </p>

                      )}

                    </div>

                  )}


                  {/* =====================================
                      ÁREA DE MENSAJES
                  ===================================== */}

                  <div className="chat-mensajes">


                    {/* ===================================
                        MENSAJE INICIAL / CONSULTA
                    =================================== */}

                    {(
                      conversacionSeleccionada.mensaje ||
                      conversacionSeleccionada.consulta ||
                      conversacionSeleccionada.descripcion
                    ) &&
                    mensajes.length === 0 && (

                      <div className="mensaje-fila cliente">

                        <div className="mensaje-burbuja cliente">

                          <p>

                            {
                              conversacionSeleccionada.mensaje ||
                              conversacionSeleccionada.consulta ||
                              conversacionSeleccionada.descripcion
                            }

                          </p>


                          <span>
                            Cliente
                          </span>

                        </div>

                      </div>

                    )}


                    {/* ===================================
                        MENSAJES DE FIRESTORE
                    =================================== */}

                    {mensajes.map(
                      (mensaje) => {

                        const autor =
                          String(
                            mensaje.autor ||
                            mensaje.remitente ||
                            mensaje.tipo ||
                            "cliente"
                          ).toLowerCase();


                        const esAdmin =
                          autor === "admin" ||
                          autor === "administrador";


                        const texto =
                          mensaje.texto ||
                          mensaje.mensaje ||
                          "";


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

                              <p>
                                {texto}
                              </p>


                              <span>

                                {
                                  esAdmin
                                    ? "Administrador"
                                    : obtenerNombreCliente(
                                        conversacionSeleccionada
                                      )
                                }

                                {mensaje.fecha && (
                                  <>
                                    {" · "}
                                    {formatearFecha(
                                      mensaje.fecha
                                    )}
                                  </>
                                )}

                              </span>

                            </div>

                          </div>

                        );

                      }
                    )}


                    <div
                      ref={
                        mensajesFinalRef
                      }
                    />

                  </div>


                  {/* =====================================
                      FORMULARIO PARA RESPONDER
                  ===================================== */}

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


                      {
                        enviando
                          ? "Enviando..."
                          : "Enviar"
                      }

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
          className="modal-cliente-overlay"
          onClick={
            cerrarInformacionCliente
          }
        >

          <div
            className="modal-cliente"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* ===========================================
                CABECERA DEL MODAL
            =========================================== */}

            <div className="modal-cliente-header">

              <div>

                <span className="modal-cliente-etiqueta">
                  Información del cliente
                </span>

                <h2>
                  {obtenerNombreCliente(
                    conversacionSeleccionada
                  )}
                </h2>

              </div>


              <button
                type="button"
                className="modal-cliente-cerrar"
                onClick={
                  cerrarInformacionCliente
                }
                aria-label="Cerrar"
              >
                ×
              </button>

            </div>


            {/* ===========================================
                CARGANDO PERFIL
            =========================================== */}

            {cargandoPerfilCliente ? (

              <div className="modal-cliente-cargando">

                <p>
                  Cargando información del cliente...
                </p>

              </div>

            ) : (

              <>


                {/* =======================================
                    DATOS DEL CLIENTE
                ======================================= */}

                <div className="modal-cliente-datos">


                  {/* NOMBRE */}

                  <div className="modal-cliente-dato">

                    <div className="modal-cliente-icono">

                      <CircleUserRound
                        size={20}
                      />

                    </div>


                    <div>

                      <span>
                        Nombre
                      </span>

                      <strong>
                        {obtenerNombreCliente(
                          conversacionSeleccionada
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* CORREO */}

                  <div className="modal-cliente-dato">

                    <div className="modal-cliente-icono">

                      <Mail size={20} />

                    </div>


                    <div>

                      <span>
                        Correo electrónico
                      </span>

                      <strong>
                        {obtenerEmailCliente()}
                      </strong>

                    </div>

                  </div>


                  {/* CELULAR */}

                  <div className="modal-cliente-dato">

                    <div className="modal-cliente-icono">

                      <Phone size={20} />

                    </div>


                    <div>

                      <span>
                        Celular
                      </span>

                      <strong>

                        {
                          obtenerCelularCliente() ||
                          "No disponible"
                        }

                      </strong>

                    </div>

                  </div>


                  {/* DIRECCIÓN */}

                  <div className="modal-cliente-dato">

                    <div className="modal-cliente-icono">

                      <MapPin size={20} />

                    </div>


                    <div>

                      <span>
                        Dirección
                      </span>

                      <strong>
                        {obtenerDireccionCliente()}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* =======================================
                    BOTÓN WHATSAPP
                ======================================= */}

                <div className="modal-cliente-acciones">

                  <button
                    type="button"
                    className="modal-whatsapp-btn"
                    onClick={
                      abrirWhatsApp
                    }
                  >

                    <Phone size={18} />

                    Contactar por WhatsApp

                  </button>

                </div>


                {/* =======================================
                    INFORMACIÓN DEL PEDIDO
                ======================================= */}

                {obtenerPedidoId(
                  conversacionSeleccionada
                ) && (

                  <div className="modal-pedido">


                    <div className="modal-pedido-header">

                      <div className="modal-pedido-icono">

                        <ShoppingBag
                          size={21}
                        />

                      </div>


                      <div>

                        <span>
                          Pedido del cliente
                        </span>

                        <strong>
                          {
                            totalProductosPedido
                          }{" "}
                          {
                            totalProductosPedido === 1
                              ? "producto"
                              : "productos"
                          }
                        </strong>

                      </div>

                    </div>


                    {/* ===================================
                        CARGANDO PEDIDO
                    =================================== */}

                    {cargandoPedido ? (

                      <div className="modal-pedido-cargando">

                        Cargando pedido...

                      </div>

                    ) : productosPedido.length > 0 ? (

                      <div className="modal-pedido-productos">


                        {productosPedido.map(
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


                            const nombreProducto =
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
                                className="modal-pedido-producto"
                                key={
                                  producto.id ||
                                  producto.productoId ||
                                  `${nombreProducto}-${index}`
                                }
                              >

                                <div className="modal-pedido-producto-info">

                                  <strong>
                                    {nombreProducto}
                                  </strong>


                                  {presentacion && (

                                    <span>
                                      {presentacion}
                                    </span>

                                  )}

                                </div>


                                <div className="modal-pedido-cantidad">

                                  {cantidad} ×

                                </div>

                              </div>

                            );

                          }
                        )}

                      </div>

                    ) : (

                      <div className="modal-pedido-vacio">

                        No fue posible obtener
                        los productos del pedido.

                      </div>

                    )}

                  </div>

                )}


                {/* =======================================
                    NOTA
                ======================================= */}

                <div className="modal-cliente-nota">

                  <Info size={18} />

                  <p>
                    Estos datos corresponden al perfil
                    registrado por el cliente en
                    Café de Origen.
                  </p>

                </div>

              </>

            )}

          </div>

        </div>

      )}


    </div>

  );

}


// =====================================================
// EXPORTAR COMPONENTE
// =====================================================

export default AdminConsultas;