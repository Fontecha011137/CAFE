import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";

import {
  ArrowLeft,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck
} from "lucide-react";

import { db } from "../firebaseConfig";

import "../css/adminPedidos.css";


// =====================================================
// ADMIN PEDIDOS
// =====================================================

function AdminPedidos() {

  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtro, setFiltro] = useState("pendiente");

  const [actualizando, setActualizando] =
    useState(null);


  // =====================================================
  // ESCUCHAR PEDIDOS EN TIEMPO REAL
  // =====================================================

  useEffect(() => {

    const pedidosRef =
      collection(db, "pedidos");


    const unsubscribe =
      onSnapshot(

        pedidosRef,

        (snapshot) => {

          const lista =
            snapshot.docs.map((documento) => ({
              id: documento.id,
              ...documento.data()
            }));


          lista.sort((a, b) => {

            const fechaA =
              a.fecha?.seconds ||
              a.fechaPedido?.seconds ||
              a.creado?.seconds ||
              a.fechaCreacion?.seconds ||
              0;


            const fechaB =
              b.fecha?.seconds ||
              b.fechaPedido?.seconds ||
              b.creado?.seconds ||
              b.fechaCreacion?.seconds ||
              0;


            return fechaB - fechaA;

          });


          setPedidos(lista);

          setCargando(false);

        },

        (error) => {

          console.error(
            "Error cargando pedidos:",
            error
          );

          setCargando(false);

        }

      );


    return () => unsubscribe();

  }, []);


  // =====================================================
  // NORMALIZAR ESTADO
  // =====================================================

  const obtenerEstadoNormalizado = (pedido) => {

    const estado =
      String(
        pedido?.estado || ""
      )
        .trim()
        .toLowerCase();


    if (
      estado === "despachado" ||
      estado === "enviado" ||
      estado === "despachada" ||
      estado === "enviada"
    ) {

      return "despachado";

    }


    return "pendiente";

  };


  // =====================================================
  // CAMBIAR ESTADO DEL PEDIDO
  // =====================================================

  const cambiarEstado = async (
    pedido,
    nuevoEstado
  ) => {

    try {

      setActualizando(pedido.id);


      const pedidoRef =
        doc(
          db,
          "pedidos",
          pedido.id
        );


      await updateDoc(
        pedidoRef,
        {
          estado: nuevoEstado
        }
      );


    } catch (error) {

      console.error(
        "Error actualizando pedido:",
        error
      );


      alert(
        "No fue posible actualizar el estado del pedido."
      );

    } finally {

      setActualizando(null);

    }

  };


  // =====================================================
  // PRODUCTOS
  // =====================================================

  const obtenerProductos = (pedido) => {

    return (
      pedido?.productos ||
      pedido?.items ||
      pedido?.carrito ||
      []
    );

  };


  // =====================================================
  // CLIENTE
  // =====================================================

  const obtenerNombreCliente = (pedido) => {

    return (
      pedido?.nombreCliente ||
      pedido?.clienteNombre ||
      pedido?.nombre ||
      pedido?.cliente?.nombre ||
      "Cliente"
    );

  };


  const obtenerCelular = (pedido) => {

    return (
      pedido?.celular ||
      pedido?.telefono ||
      pedido?.celularCliente ||
      pedido?.cliente?.celular ||
      ""
    );

  };


  const obtenerDireccion = (pedido) => {

    return (
      pedido?.direccion ||
      pedido?.direccionCliente ||
      pedido?.cliente?.direccion ||
      ""
    );

  };


  // =====================================================
  // CONTADORES
  // =====================================================

  const totalPendientes =
    pedidos.filter(
      (pedido) =>
        obtenerEstadoNormalizado(pedido) ===
        "pendiente"
    ).length;


  const totalDespachados =
    pedidos.filter(
      (pedido) =>
        obtenerEstadoNormalizado(pedido) ===
        "despachado"
    ).length;


  // =====================================================
  // FILTRAR PEDIDOS
  // =====================================================

  const pedidosFiltrados =
    useMemo(() => {

      if (filtro === "todos") {

        return pedidos;

      }


      return pedidos.filter(
        (pedido) =>
          obtenerEstadoNormalizado(pedido) ===
          filtro
      );

    }, [pedidos, filtro]);


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="admin-page">


      {/* =================================================
          VOLVER AL PANEL ADMINISTRATIVO
      ================================================= */}

      <button
        type="button"
        className="btn-volver-admin"
        onClick={() => navigate("/admin")}
      >
        <ArrowLeft size={18} />
        Volver al panel administrativo
      </button>


      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div className="admin-header">

        <h1>
          Pedidos
        </h1>

        <p>
          Administra y controla los pedidos
          realizados por los clientes.
        </p>

      </div>


      {/* =================================================
          RESUMEN
      ================================================= */}

      <div className="pedidos-resumen">


        <div className="pedido-resumen-card">

          <ShoppingBag size={22} />

          <div>

            <strong>
              {pedidos.length}
            </strong>

            <span>
              Total pedidos
            </span>

          </div>

        </div>


        <div className="pedido-resumen-card">

          <Clock3 size={22} />

          <div>

            <strong>
              {totalPendientes}
            </strong>

            <span>
              Pendientes
            </span>

          </div>

        </div>


        <div className="pedido-resumen-card">

          <Truck size={22} />

          <div>

            <strong>
              {totalDespachados}
            </strong>

            <span>
              Despachados
            </span>

          </div>

        </div>


      </div>


      {/* =================================================
          FILTROS
      ================================================= */}

      <div className="pedidos-filtros">


        <button
          type="button"
          className={
            filtro === "todos"
              ? "activo"
              : ""
          }
          onClick={() =>
            setFiltro("todos")
          }
        >
          Todos

          <span>
            {pedidos.length}
          </span>
        </button>


        <button
          type="button"
          className={
            filtro === "pendiente"
              ? "activo"
              : ""
          }
          onClick={() =>
            setFiltro("pendiente")
          }
        >
          <Clock3 size={17} />

          Pendientes

          <span>
            {totalPendientes}
          </span>

        </button>


        <button
          type="button"
          className={
            filtro === "despachado"
              ? "activo"
              : ""
          }
          onClick={() =>
            setFiltro("despachado")
          }
        >
          <Truck size={17} />

          Despachados

          <span>
            {totalDespachados}
          </span>

        </button>


      </div>


      {/* =================================================
          CONTENIDO
      ================================================= */}

      {cargando ? (

        <div className="admin-card">

          <h2>
            Cargando pedidos...
          </h2>

        </div>

      ) : pedidosFiltrados.length === 0 ? (

        <div className="admin-card">

          <ShoppingBag size={36} />

          <h2>

            {filtro === "despachado"
              ? "No hay pedidos despachados"
              : filtro === "pendiente"
              ? "No hay pedidos pendientes"
              : "Aún no hay pedidos"}

          </h2>

          <p>

            {filtro === "despachado"
              ? "Los pedidos despachados aparecerán aquí."
              : filtro === "pendiente"
              ? "No tienes pedidos pendientes en este momento."
              : "Cuando los clientes realicen compras, aparecerán automáticamente aquí."}

          </p>

        </div>

      ) : (

        <div className="admin-pedidos-lista">


          {pedidosFiltrados.map(
            (pedido) => {

              const productos =
                obtenerProductos(pedido);


              const celular =
                obtenerCelular(pedido);


              const direccion =
                obtenerDireccion(pedido);


              const estado =
                obtenerEstadoNormalizado(
                  pedido
                );


              const estaActualizando =
                actualizando === pedido.id;


              return (

                <article
                  key={pedido.id}
                  className={`admin-pedido-card estado-${estado}`}
                >


                  {/* =====================================
                      CABECERA
                  ===================================== */}

                  <div className="admin-pedido-top">


                    <div className="admin-pedido-cliente">

                      <CircleUserRound
                        size={30}
                      />


                      <div>

                        <span>
                          Cliente
                        </span>

                        <h2>
                          {obtenerNombreCliente(
                            pedido
                          )}
                        </h2>

                      </div>

                    </div>


                    <span
                      className={`admin-pedido-estado ${estado}`}
                    >

                      {estado === "despachado"
                        ? "Despachado"
                        : "Pendiente de envío"}

                    </span>


                  </div>


                  {/* =====================================
                      DATOS DEL CLIENTE
                  ===================================== */}

                  <div className="admin-pedido-datos">


                    {celular && (

                      <div>

                        <Phone size={17} />

                        <span>
                          {celular}
                        </span>

                      </div>

                    )}


                    {direccion && (

                      <div>

                        <MapPin size={17} />

                        <span>
                          {direccion}
                        </span>

                      </div>

                    )}


                  </div>


                  {/* =====================================
                      PRODUCTOS
                  ===================================== */}

                  <div className="admin-pedido-productos">


                    <div className="admin-pedido-productos-titulo">

                      <Package size={19} />

                      <strong>
                        Productos solicitados
                      </strong>

                    </div>


                    {productos.map(
                      (producto, index) => {

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
                            key={
                              producto.id ||
                              producto.productoId ||
                              index
                            }
                            className="admin-pedido-producto"
                          >

                            <span>

                              <strong>
                                {cantidad} × {nombre}
                              </strong>

                              {presentacion && (
                                <>
                                  {" "}
                                  {presentacion}
                                </>
                              )}

                            </span>

                          </div>

                        );

                      }
                    )}


                  </div>


                  {/* =====================================
                      ACCIONES
                  ===================================== */}

                  <div className="admin-pedido-acciones">


                    {estado === "pendiente" ? (

                      <button
                        type="button"
                        className="btn-despachar"
                        disabled={
                          estaActualizando
                        }
                        onClick={() =>
                          cambiarEstado(
                            pedido,
                            "Despachado"
                          )
                        }
                      >

                        <Truck size={18} />

                        {estaActualizando
                          ? "Actualizando..."
                          : "Marcar como despachado"}

                      </button>

                    ) : (

                      <button
                        type="button"
                        className="btn-despachado"
                        disabled
                      >

                        <CheckCircle2
                          size={18}
                        />

                        Pedido despachado

                      </button>

                    )}


                  </div>


                  {/* =====================================
                      ID DEL PEDIDO
                  ===================================== */}

                  <div className="admin-pedido-id">

                    Pedido #{pedido.id}

                  </div>


                </article>

              );

            }
          )}


        </div>

      )}


    </div>

  );

}


export default AdminPedidos;