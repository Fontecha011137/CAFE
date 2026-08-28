import { useState } from "react";
import "../css/adminConversaciones.css";

function AdminConversaciones() {
  const [conversaciones, setConversaciones] = useState([
    {
      id: 1,
      pedidoId: "1042",
      cliente: "Juan Pérez",

      email: "juan@email.com",
      celular: "3001234567",

      ultimoMensaje:
        "Quiero saber cuánto vale el envío",

      noLeidos: 1,

      estado: "Esperando admin",

      metodoEntrega: "Por definir",
      costoEnvio: 0,

      totalPedidos: 3,
      totalComprado: 285000,

      mensajes: [
        {
          id: 1,
          autor: "cliente",
          texto:
            "Hola, quiero saber cuánto vale el envío a Suba."
        }
      ]
    },

    {
      id: 2,
      pedidoId: "1041",
      cliente: "Ana Gómez",

      email: "ana@email.com",
      celular: "3019876543",

      ultimoMensaje:
        "Perfecto, acepto el envío",

      noLeidos: 0,

      estado: "Esperando cliente",

      metodoEntrega: "Domicilio",
      costoEnvio: 12000,

      totalPedidos: 2,
      totalComprado: 172000,

      mensajes: [
        {
          id: 1,
          autor: "cliente",
          texto:
            "¿Cuánto vale el envío?"
        },
        {
          id: 2,
          autor: "admin",
          texto:
            "El envío tiene un costo de $12.000."
        },
        {
          id: 3,
          autor: "cliente",
          texto:
            "Perfecto, acepto el envío."
        }
      ]
    }
  ]);

  const [
    conversacionActiva,
    setConversacionActiva
  ] = useState(null);

  const [
    mensajeNuevo,
    setMensajeNuevo
  ] = useState("");

  const [
    mostrarInfoCliente,
    setMostrarInfoCliente
  ] = useState(false);

  const abrirConversacion = (conversacion) => {
    const conversacionLeida = {
      ...conversacion,
      noLeidos: 0
    };

    setConversacionActiva(
      conversacionLeida
    );

    setConversaciones((prev) =>
      prev.map((item) =>
        item.id === conversacion.id
          ? {
              ...item,
              noLeidos: 0
            }
          : item
      )
    );
  };

  const enviarMensaje = () => {
    const texto =
      mensajeNuevo.trim();

    if (
      !texto ||
      !conversacionActiva
    ) {
      return;
    }

    const nuevoMensaje = {
      id: Date.now(),
      autor: "admin",
      texto
    };

    const conversacionesActualizadas =
      conversaciones.map((item) => {
        if (
          item.id ===
          conversacionActiva.id
        ) {
          return {
            ...item,

            mensajes: [
              ...item.mensajes,
              nuevoMensaje
            ],

            ultimoMensaje: texto,

            estado:
              "Esperando cliente"
          };
        }

        return item;
      });

    setConversaciones(
      conversacionesActualizadas
    );

    const actualizada =
      conversacionesActualizadas.find(
        (item) =>
          item.id ===
          conversacionActiva.id
      );

    setConversacionActiva(
      actualizada
    );

    setMensajeNuevo("");
  };

  const formatoPrecio = (valor) => {
    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
      }
    ).format(valor);
  };

  return (
    <div className="admin-conversaciones-page">

      <div className="admin-conversaciones-header">

        <h1>
          Conversaciones de envío
        </h1>

        <p>
          Gestiona solicitudes de entrega y
          conversa con los clientes.
        </p>

      </div>

      <div className="admin-chat-layout">

        {/* LISTA DE CONVERSACIONES */}

        <aside className="lista-conversaciones">

          <h2>
            Conversaciones
          </h2>

          {conversaciones.map(
            (conversacion) => (

              <button
                key={conversacion.id}
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
                    {conversacion.cliente}
                  </strong>

                  {conversacion.noLeidos >
                    0 && (

                    <span className="badge-no-leido">
                      {
                        conversacion.noLeidos
                      }
                    </span>

                  )}

                </div>

                <span className="pedido-numero">
                  Pedido #
                  {
                    conversacion.pedidoId
                  }
                </span>

                <p>
                  {
                    conversacion.ultimoMensaje
                  }
                </p>

                <small>
                  {conversacion.estado}
                </small>

              </button>

            )
          )}

        </aside>


        {/* PANEL DEL CHAT */}

        <section className="panel-chat">

          {!conversacionActiva ? (

            <div className="chat-vacio">

              <h2>
                Selecciona una conversación
              </h2>

              <p>
                Aquí podrás hablar con el
                cliente y acordar el envío.
              </p>

            </div>

          ) : (

            <>

              {/* HEADER DEL CHAT */}

              <div className="chat-header">

                <div>

                  <h2>
                    {
                      conversacionActiva.cliente
                    }
                  </h2>

                  <span>
                    Pedido #
                    {
                      conversacionActiva.pedidoId
                    }
                  </span>

                </div>

                <div className="chat-header-acciones">

                  <span className="estado-conversacion">
                    {
                      conversacionActiva.estado
                    }
                  </span>

                  <button
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


              {/* MENSAJES */}

              <div className="chat-mensajes">

                {conversacionActiva.mensajes.map(
                  (mensaje) => (

                    <div
                      key={mensaje.id}
                      className={`mensaje ${
                        mensaje.autor ===
                        "admin"
                          ? "mensaje-admin"
                          : "mensaje-cliente"
                      }`}
                    >

                      <span className="mensaje-autor">

                        {mensaje.autor ===
                        "admin"
                          ? "Café de Origen"
                          : conversacionActiva.cliente}

                      </span>

                      <p>
                        {mensaje.texto}
                      </p>

                    </div>

                  )
                )}

              </div>


              {/* ESCRIBIR MENSAJE */}

              <div className="chat-input-area">

                <textarea
                  value={mensajeNuevo}
                  onChange={(e) =>
                    setMensajeNuevo(
                      e.target.value
                    )
                  }
                  placeholder="Escribe un mensaje..."
                />

                <button
                  onClick={enviarMensaje}
                >
                  Enviar
                </button>

              </div>

            </>

          )}

        </section>

      </div>


      {/* =====================================
          MODAL INFORMACIÓN DEL CLIENTE
      ===================================== */}

      {mostrarInfoCliente &&
        conversacionActiva && (

        <div className="modal-cliente-overlay">

          <div className="modal-cliente">

            <button
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


            {/* DATOS PERSONALES */}

            <div className="cliente-info-bloque">

              <div className="cliente-info-item">

                <span>
                  Nombre
                </span>

                <strong>
                  {
                    conversacionActiva.cliente
                  }
                </strong>

              </div>


              <div className="cliente-info-item">

                <span>
                  Correo
                </span>

                <strong>
                  {
                    conversacionActiva.email ||
                    "No disponible"
                  }
                </strong>

              </div>


              <div className="cliente-info-item">

                <span>
                  Celular
                </span>

                <strong>
                  {
                    conversacionActiva.celular ||
                    "No disponible"
                  }
                </strong>

              </div>

            </div>


            {/* PEDIDO ACTUAL */}

            <div className="cliente-info-seccion">

              <h3>
                Pedido actual
              </h3>


              <div className="cliente-info-item">

                <span>
                  Número de pedido
                </span>

                <strong>
                  #
                  {
                    conversacionActiva.pedidoId
                  }
                </strong>

              </div>


              <div className="cliente-info-item">

                <span>
                  Estado
                </span>

                <strong>
                  {
                    conversacionActiva.estado
                  }
                </strong>

              </div>


              <div className="cliente-info-item">

                <span>
                  Método de entrega
                </span>

                <strong>
                  {
                    conversacionActiva.metodoEntrega ||
                    "Por definir"
                  }
                </strong>

              </div>


              <div className="cliente-info-item">

                <span>
                  Costo de envío
                </span>

                <strong>

                  {
                    conversacionActiva.costoEnvio >
                    0
                      ? formatoPrecio(
                          conversacionActiva.costoEnvio
                        )
                      : "Por definir"
                  }

                </strong>

              </div>

            </div>


            {/* HISTORIAL */}

            <div className="cliente-info-seccion">

              <h3>
                Historial del cliente
              </h3>


              <div className="cliente-info-item">

                <span>
                  Pedidos realizados
                </span>

                <strong>
                  {
                    conversacionActiva.totalPedidos ||
                    0
                  }
                </strong>

              </div>


              <div className="cliente-info-item">

                <span>
                  Total comprado
                </span>

                <strong>
                  {formatoPrecio(
                    conversacionActiva.totalComprado ||
                    0
                  )}
                </strong>

              </div>

            </div>


            {/* VOLVER AL CHAT */}

            <button
              className="btn-volver-chat"
              onClick={() =>
                setMostrarInfoCliente(
                  false
                )
              }
            >
              Volver a la conversación
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminConversaciones;