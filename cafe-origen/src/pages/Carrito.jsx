import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../css/carrito.css";

function Carrito() {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carritoCafe");

    return guardado ? JSON.parse(guardado) : [];
  });

  const [mostrarModalEnvio, setMostrarModalEnvio] =
    useState(false);

  const [modoEnvio, setModoEnvio] =
    useState(null);

  const [comentarioEnvio, setComentarioEnvio] =
    useState("");

  const [mensajeModal, setMensajeModal] =
    useState("");

  useEffect(() => {
    localStorage.setItem(
      "carritoCafe",
      JSON.stringify(carrito)
    );
  }, [carrito]);


  const aumentarCantidad = (id) => {
    const nuevoCarrito = carrito.map((producto) =>
      producto.id === id
        ? {
            ...producto,
            cantidad: producto.cantidad + 1,
          }
        : producto
    );

    setCarrito(nuevoCarrito);
  };


  const disminuirCantidad = (id) => {
    const nuevoCarrito = carrito
      .map((producto) =>
        producto.id === id
          ? {
              ...producto,
              cantidad: producto.cantidad - 1,
            }
          : producto
      )
      .filter((producto) => producto.cantidad > 0);

    setCarrito(nuevoCarrito);
  };


  const eliminarProducto = (id) => {
    const nuevoCarrito = carrito.filter(
      (producto) => producto.id !== id
    );

    setCarrito(nuevoCarrito);
  };


  const vaciarCarrito = () => {
    setCarrito([]);
  };


  const total = carrito.reduce(
    (acumulado, producto) =>
      acumulado +
      Number(producto.precio) *
        Number(producto.cantidad),
    0
  );


  const totalProductos = carrito.reduce(
    (acumulado, producto) =>
      acumulado + Number(producto.cantidad),
    0
  );


  const formatoPrecio = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor);
  };


  const abrirModalEnvio = () => {
    setMostrarModalEnvio(true);
    setModoEnvio(null);
    setComentarioEnvio("");
    setMensajeModal("");
  };


  const cerrarModalEnvio = () => {
    setMostrarModalEnvio(false);
    setModoEnvio(null);
    setComentarioEnvio("");
    setMensajeModal("");
  };


  const seleccionarAcordarEnvio = () => {
    setModoEnvio("acordar");
    setMensajeModal("");
  };


  const seleccionarPickup = () => {
    setModoEnvio("pickup");

    setMensajeModal(
      "Has seleccionado recoger tu pedido en el punto de entrega."
    );
  };


  const enviarSolicitudEnvio = () => {
    const comentario = comentarioEnvio.trim();

    if (!comentario) {
      setMensajeModal(
        "Escribe un comentario para solicitar el envío."
      );

      return;
    }

    /*
      TEMPORAL:

      Cuando conectemos Supabase,
      aquí crearemos el pedido
      y la conversación con el cliente.
    */

    const solicitudTemporal = {
      tipo: "solicitud_envio",
      comentario,
      subtotal: total,
      productos: carrito,
      fecha: new Date().toISOString(),
    };

    localStorage.setItem(
      "solicitudEnvioTemporal",
      JSON.stringify(solicitudTemporal)
    );

    setMensajeModal(
      "Solicitud enviada. Podrás continuar la conversación con el vendedor desde Mi cuenta."
    );

    setComentarioEnvio("");
  };


  return (
    <div className="carrito-page">

      {/* =========================
          ENCABEZADO
      ========================= */}

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
            className="btn-vaciar"
            onClick={vaciarCarrito}
          >
            Vaciar carrito
          </button>

        )}

      </div>


      {/* =========================
          CARRITO
      ========================= */}

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


          {/* =========================
              PRODUCTOS
          ========================= */}

          <div className="carrito-lista">

            {carrito.map((producto) => (

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
                    onClick={() =>
                      aumentarCantidad(
                        producto.id
                      )
                    }
                  >
                    +
                  </button>

                </div>


                {/* TOTAL PRODUCTO */}

                <div className="producto-total">

                  <strong>
                    {formatoPrecio(
                      producto.precio *
                        producto.cantidad
                    )}
                  </strong>

                  <button
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


          {/* =========================
              RESUMEN
          ========================= */}

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
              className="btn-finalizar"
              onClick={abrirModalEnvio}
            >
              Finalizar compra
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


      {/* =========================
          MODAL ENTREGA
      ========================= */}

      {mostrarModalEnvio && (

        <div className="modal-overlay">

          <div className="modal-envio">


            {/* CERRAR */}

            <button
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


            {/* =========================
                OPCIONES
            ========================= */}

            {!modoEnvio && (

              <div className="modal-envio-opciones">

                <button
                  className="btn-acordar-envio"
                  onClick={seleccionarAcordarEnvio}
                >
                  🚚 Acordar precio de envío
                </button>


                <button
                  className="btn-pickup"
                  onClick={seleccionarPickup}
                >
                  📦 Recoger en punto
                </button>

              </div>

            )}


            {/* =========================
                SOLICITAR ENVÍO
            ========================= */}

            {modoEnvio === "acordar" && (

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


                <div className="solicitud-envio-botones">

                  <button
                    className="btn-volver-modal"
                    onClick={() => {
                      setModoEnvio(null);
                      setMensajeModal("");
                    }}
                  >
                    Volver
                  </button>


                  <button
                    className="btn-enviar-solicitud"
                    onClick={enviarSolicitudEnvio}
                  >
                    Enviar solicitud
                  </button>

                </div>

              </div>

            )}


            {/* =========================
                RECOGER EN PUNTO
            ========================= */}

            {modoEnvio === "pickup" && (

              <div className="pickup-info">

                <h3>
                  Recoger en punto
                </h3>


                <p>
                  No se agregará costo de envío.
                  Puedes recoger tu pedido directamente
                  en nuestro punto de entrega.
                </p>


                {/* DIRECCIÓN */}

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


                {/* WAZE */}

                <a
                  href="https://www.waze.com/ul?q=Calle%208A%20%23%2082-31%20Bogota%20Colombia&navigate=yes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-waze"
                >
                  🚗 Cómo llegar con Waze
                </a>


                {/* CAMBIAR OPCIÓN */}

                <button
                  className="btn-volver-modal"
                  onClick={() => {
                    setModoEnvio(null);
                    setMensajeModal("");
                  }}
                >
                  Cambiar opción
                </button>

              </div>

            )}


            {/* =========================
                MENSAJE
            ========================= */}

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