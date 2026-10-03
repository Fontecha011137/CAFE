import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import {
  ArrowLeft,
  CircleUserRound,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Users
} from "lucide-react";

import { db } from "../firebaseConfig";

import "../css/adminClientes.css";


function AdminClientes() {

  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState("");


  // =====================================================
  // ESCUCHAR CLIENTES EN TIEMPO REAL
  // =====================================================

  useEffect(() => {

    const usuariosRef =
      collection(db, "usuarios");


    const unsubscribe =
      onSnapshot(

        usuariosRef,

        (snapshot) => {

          const lista =
            snapshot.docs
              .map((documento) => ({
                id: documento.id,
                ...documento.data()
              }))
              .filter((usuario) => {

                const rol =
                  String(
                    usuario.rol || ""
                  )
                    .trim()
                    .toLowerCase();


                return rol === "cliente";

              });


          // Ordenar alfabéticamente por nombre

          lista.sort((a, b) => {

            const nombreA =
              String(
                a.nombre || ""
              ).toLowerCase();


            const nombreB =
              String(
                b.nombre || ""
              ).toLowerCase();


            return nombreA.localeCompare(
              nombreB,
              "es"
            );

          });


          setClientes(lista);

          setCargando(false);

        },

        (error) => {

          console.error(
            "Error cargando clientes:",
            error
          );

          setCargando(false);

        }

      );


    return () => unsubscribe();

  }, []);


  // =====================================================
  // FILTRAR CLIENTES
  // =====================================================

  const clientesFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      if (!texto) {

        return clientes;

      }


      return clientes.filter(
        (cliente) => {

          const nombre =
            String(
              cliente.nombre || ""
            ).toLowerCase();


          const email =
            String(
              cliente.email || ""
            ).toLowerCase();


          const celular =
            String(
              cliente.celular ||
              cliente.telefono ||
              ""
            ).toLowerCase();


          const direccion =
            String(
              cliente.direccion || ""
            ).toLowerCase();


          return (
            nombre.includes(texto) ||
            email.includes(texto) ||
            celular.includes(texto) ||
            direccion.includes(texto)
          );

        }
      );

    }, [
      clientes,
      busqueda
    ]);


  // =====================================================
  // WHATSAPP
  // =====================================================

  const abrirWhatsApp = (cliente) => {

    const celular =
      cliente.celular ||
      cliente.telefono ||
      "";


    if (!celular) {

      alert(
        "Este cliente no tiene un número de celular registrado."
      );

      return;

    }


    let numero =
      String(celular)
        .replace(/\D/g, "");


    // Número colombiano de 10 dígitos

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
      cliente.nombre ||
      "cliente";


    const mensaje =
      `Hola ${nombre}, te escribimos de Café de Origen.`;


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


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="admin-clientes-page">


      {/* =================================================
          VOLVER
      ================================================= */}

      <div className="admin-clientes-contenedor">

        <button
          type="button"
          className="clientes-volver-admin"
          onClick={() =>
            navigate("/admin")
          }
        >
          <ArrowLeft size={18} />

          Volver al panel administrativo
        </button>


        {/* ===============================================
            ENCABEZADO
        =============================================== */}

        <div className="admin-clientes-header">

          <h1>
            Clientes
          </h1>

          <p>
            Consulta los usuarios registrados,
            hayan realizado pedidos o no.
          </p>

        </div>


        {/* ===============================================
            RESUMEN
        =============================================== */}

        <div className="clientes-resumen">

          <div className="cliente-resumen-card">

            <Users size={24} />

            <div>

              <strong>
                {clientes.length}
              </strong>

              <span>
                Clientes registrados
              </span>

            </div>

          </div>

        </div>


        {/* ===============================================
            BUSCADOR
        =============================================== */}

        <div className="clientes-herramientas">

          <div className="clientes-buscador">

            <Search size={19} />

            <input
              type="search"
              placeholder="Buscar por nombre, correo, celular o dirección..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
            />

          </div>


          <div className="clientes-resultados">

            {clientesFiltrados.length}

            {" "}

            {clientesFiltrados.length === 1
              ? "cliente"
              : "clientes"}

          </div>

        </div>


        {/* ===============================================
            CONTENIDO
        =============================================== */}

        {cargando ? (

          <div className="clientes-estado">

            <Users size={38} />

            <h2>
              Cargando clientes...
            </h2>

          </div>

        ) : clientes.length === 0 ? (

          <div className="clientes-estado">

            <Users size={38} />

            <h2>
              Aún no hay clientes
            </h2>

            <p>
              Cuando los usuarios se registren,
              aparecerán automáticamente aquí.
            </p>

          </div>

        ) : clientesFiltrados.length === 0 ? (

          <div className="clientes-estado">

            <Search size={38} />

            <h2>
              No encontramos clientes
            </h2>

            <p>
              Prueba con otro nombre,
              correo, celular o dirección.
            </p>

          </div>

        ) : (

          <div className="admin-clientes-lista">


            {clientesFiltrados.map(
              (cliente) => {

                const celular =
                  cliente.celular ||
                  cliente.telefono ||
                  "";


                const direccion =
                  cliente.direccion ||
                  "";


                const email =
                  cliente.email ||
                  "No disponible";


                return (

                  <article
                    key={cliente.id}
                    className="admin-cliente-card"
                  >


                    {/* ===================================
                        CABECERA
                    =================================== */}

                    <div className="admin-cliente-top">

                      <div className="admin-cliente-identidad">

                        <div className="admin-cliente-avatar">

                          <CircleUserRound
                            size={32}
                          />

                        </div>


                        <div>

                          <span>
                            Cliente
                          </span>

                          <h2>
                            {
                              cliente.nombre ||
                              "Cliente"
                            }
                          </h2>

                        </div>

                      </div>


                      <span className="cliente-registrado">

                        Registrado

                      </span>

                    </div>


                    {/* ===================================
                        INFORMACIÓN
                    =================================== */}

                    <div className="admin-cliente-datos">


                      {/* CORREO */}

                      <div className="admin-cliente-dato">

                        <Mail size={18} />

                        <div>

                          <span>
                            Correo electrónico
                          </span>

                          <strong>
                            {email}
                          </strong>

                        </div>

                      </div>


                      {/* CELULAR */}

                      <div className="admin-cliente-dato">

                        <Phone size={18} />

                        <div>

                          <span>
                            Celular
                          </span>

                          <strong>

                            {
                              celular ||
                              "No disponible"
                            }

                          </strong>

                        </div>

                      </div>


                      {/* DIRECCIÓN */}

                      <div className="admin-cliente-dato">

                        <MapPin size={18} />

                        <div>

                          <span>
                            Dirección
                          </span>

                          <strong>

                            {
                              direccion ||
                              "No disponible"
                            }

                          </strong>

                        </div>

                      </div>


                    </div>


                    {/* ===================================
                        ACCIONES
                    =================================== */}

                    <div className="admin-cliente-acciones">

                      <button
                        type="button"
                        className="cliente-whatsapp-btn"
                        disabled={!celular}
                        onClick={() =>
                          abrirWhatsApp(
                            cliente
                          )
                        }
                      >

                        <MessageCircle
                          size={18}
                        />

                        {celular
                          ? "Contactar por WhatsApp"
                          : "WhatsApp no disponible"}

                      </button>

                    </div>


                  </article>

                );

              }
            )}


          </div>

        )}


      </div>

    </div>

  );

}


export default AdminClientes;