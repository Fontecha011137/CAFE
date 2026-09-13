import {
  useEffect,
  useState
} from "react";

import {
  useSearchParams
} from "react-router-dom";

import {
  onAuthStateChanged,
  signInAnonymously
} from "firebase/auth";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import {
  MessageCircle,
  Send,
  Coffee,
  Phone
} from "lucide-react";

import {
  auth,
  db
} from "../firebaseConfig";

import "../css/consultas.css";


function Consultas() {

  const [searchParams] =
    useSearchParams();


  const productoParametro =
    searchParams.get("producto") || "";


  // =====================================================
  // ESTADOS
  // =====================================================

  const [usuario, setUsuario] =
    useState(null);

  const [perfil, setPerfil] =
    useState(null);

  const [nombre, setNombre] =
    useState("");

  const [celular, setCelular] =
    useState("");

  const [consulta, setConsulta] =
    useState("");

  const [conversaciones, setConversaciones] =
    useState([]);

  const [conversacionActiva, setConversacionActiva] =
    useState(null);

  const [mensajes, setMensajes] =
    useState([]);

  const [mensajeNuevo, setMensajeNuevo] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [enviando, setEnviando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState("");


  // =====================================================
  // AUTENTICACIÓN
  // =====================================================

  useEffect(() => {

    const iniciar = async () => {

      if (!auth.currentUser) {

        try {

          await signInAnonymously(auth);

        } catch (error) {

          console.error(
            "Error iniciando sesión anónima:",
            error
          );

        }

      }

    };


    iniciar();


    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user) {
            return;
          }


          setUsuario(user);


          // =============================================
          // USUARIO REGISTRADO
          // =============================================

          if (!user.isAnonymous) {

            try {

              const ref =
                doc(
                  db,
                  "usuarios",
                  user.uid
                );


              const snap =
                await getDoc(ref);


              if (snap.exists()) {

                const datos =
                  snap.data();


                setPerfil(datos);

                setNombre(
                  datos.nombre || ""
                );

                setCelular(
                  datos.celular || ""
                );

              }

            } catch (error) {

              console.error(
                "Error cargando perfil:",
                error
              );

            }

          }


          setCargando(false);

        }
      );


    return () => unsubscribe();

  }, []);


  // =====================================================
  // ESCUCHAR CONVERSACIONES DEL USUARIO
  // =====================================================

  useEffect(() => {

    if (!usuario) {
      return;
    }


    const ref =
      collection(
        db,
        "conversaciones"
      );


    const unsubscribe =
      onSnapshot(
        ref,
        (snapshot) => {

          const lista =
            snapshot.docs
              .map(
                (documento) => ({
                  id: documento.id,
                  ...documento.data()
                })
              )
              .filter(
                (item) =>
                  item.uidCliente ===
                  usuario.uid
              );


          lista.sort(
            (a, b) => {

              const fechaA =
                a.actualizado?.seconds ||
                a.creado?.seconds ||
                0;

              const fechaB =
                b.actualizado?.seconds ||
                b.creado?.seconds ||
                0;

              return fechaB - fechaA;

            }
          );


          setConversaciones(lista);

        }
      );


    return () => unsubscribe();

  }, [usuario]);


  // =====================================================
  // ESCUCHAR MENSAJES
  // =====================================================

  useEffect(() => {

    if (!conversacionActiva) {

      setMensajes([]);

      return;

    }


    const ref =
      collection(
        db,
        "conversaciones",
        conversacionActiva.id,
        "mensajes"
      );


    const unsubscribe =
      onSnapshot(
        ref,
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
                a.creado?.seconds || 0;

              const fechaB =
                b.creado?.seconds || 0;

              return fechaA - fechaB;

            }
          );


          setMensajes(lista);

        }
      );


    return () => unsubscribe();

  }, [conversacionActiva?.id]);


  // =====================================================
  // CREAR CONSULTA
  // =====================================================

  const crearConsulta =
    async (e) => {

      e.preventDefault();


      if (!usuario) {
        return;
      }


      const nombreFinal =
        nombre.trim();

      const celularFinal =
        celular.trim();

      const texto =
        consulta.trim();


      if (!nombreFinal) {

        setMensaje(
          "Ingresa tu nombre."
        );

        return;

      }


      if (
        !/^[0-9]{10}$/.test(
          celularFinal
        )
      ) {

        setMensaje(
          "Ingresa un celular válido de 10 dígitos."
        );

        return;

      }


      if (!texto) {

        setMensaje(
          "Cuéntanos en qué podemos ayudarte."
        );

        return;

      }


      try {

        setEnviando(true);
        setMensaje("");


        // ===============================================
        // CREAR CONVERSACIÓN
        // ===============================================

        const conversacionRef =
          await addDoc(
            collection(
              db,
              "conversaciones"
            ),
            {
              tipo: "consulta",

              origen:
                usuario.isAnonymous
                  ? "visitante"
                  : "registrado",

              uidCliente:
                usuario.uid,

              nombreCliente:
                nombreFinal,

              celularCliente:
                celularFinal,

              productoNombre:
                productoParametro,

              asunto:
                productoParametro
                  ? `Consulta sobre ${productoParametro}`
                  : "Consulta general",

              ultimoMensaje:
                texto,

              estado:
                "Esperando admin",

              esperando:
                "admin",

              noLeidosAdmin: 1,

              noLeidosCliente: 0,

              creado:
                serverTimestamp(),

              actualizado:
                serverTimestamp()
            }
          );


        // ===============================================
        // PRIMER MENSAJE
        // ===============================================

        await addDoc(
          collection(
            db,
            "conversaciones",
            conversacionRef.id,
            "mensajes"
          ),
          {
            autor: "cliente",

            remitente: "cliente",

            texto,

            creado:
              serverTimestamp()
          }
        );


        setConsulta("");


        setMensaje(
          "¡Consulta enviada! ☕ Te responderemos por la aplicación o podremos contactarte por WhatsApp."
        );


        setConversacionActiva({
          id: conversacionRef.id,

          nombreCliente:
            nombreFinal,

          celularCliente:
            celularFinal,

          productoNombre:
            productoParametro,

          tipo: "consulta"
        });


      } catch (error) {

        console.error(
          "Error creando consulta:",
          error
        );


        setMensaje(
          "No fue posible enviar tu consulta."
        );


      } finally {

        setEnviando(false);

      }

    };


  // =====================================================
  // RESPONDER EN CHAT
  // =====================================================

  const responder =
    async (e) => {

      e.preventDefault();


      const texto =
        mensajeNuevo.trim();


      if (
        !texto ||
        !conversacionActiva
      ) {
        return;
      }


      try {

        setEnviando(true);


        await addDoc(
          collection(
            db,
            "conversaciones",
            conversacionActiva.id,
            "mensajes"
          ),
          {
            autor: "cliente",

            remitente: "cliente",

            texto,

            creado:
              serverTimestamp()
          }
        );


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
              "Esperando admin",

            esperando:
              "admin",

            actualizado:
              serverTimestamp()
          }
        );


        setMensajeNuevo("");


      } catch (error) {

        console.error(
          error
        );


      } finally {

        setEnviando(false);

      }

    };


  // =====================================================
  // CARGANDO
  // =====================================================

  if (cargando) {

    return (

      <div className="consultas-cargando">
        Cargando consultas...
      </div>

    );

  }


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="consultas-page">


      <section className="consultas-encabezado">

        <MessageCircle size={35} />

        <h1>
          Consultas
        </h1>

        <p>
          ¿En qué podemos ayudarte?
        </p>

      </section>


      <div className="consultas-layout">


        {/* =================================================
            NUEVA CONSULTA
        ================================================= */}

        <section className="consulta-nueva">


          <h2>
            Nueva consulta
          </h2>


          {productoParametro && (

            <div className="consulta-producto">

              <Coffee size={20} />

              Consulta sobre:

              <strong>
                {productoParametro}
              </strong>

            </div>

          )}


          <form
            onSubmit={crearConsulta}
          >


            {/* VISITANTE */}

            <div className="consulta-campo">

              <label>
                Nombre
              </label>

              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
                disabled={
                  Boolean(
                    perfil?.nombre
                  )
                }
                required
              />

            </div>


            <div className="consulta-campo">

              <label>
                Celular / WhatsApp
              </label>

              <input
                type="tel"
                placeholder="3001234567"
                value={celular}
                onChange={(e) =>
                  setCelular(
                    e.target.value
                  )
                }
                maxLength={10}
                disabled={
                  Boolean(
                    perfil?.celular
                  )
                }
                required
              />

            </div>


            <div className="consulta-campo">

              <label>
                ¿En qué podemos ayudarte?
              </label>

              <textarea
                placeholder="Cuéntanos tu duda o solicitud..."
                value={consulta}
                onChange={(e) =>
                  setConsulta(
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* INFORMACIÓN WHATSAPP */}

            <div className="consulta-aviso">

              <Phone size={19} />

              <p>
                Te responderemos por medio de la
                aplicación o podremos contactarte
                por WhatsApp, según lo que resulte
                más práctico para atender tu consulta.
              </p>

            </div>


            <button
              type="submit"
              className="btn-enviar-consulta"
              disabled={enviando}
            >

              <Send size={18} />

              {
                enviando
                  ? "Enviando..."
                  : "Enviar consulta"
              }

            </button>

          </form>


          {mensaje && (

            <div className="consulta-mensaje">
              {mensaje}
            </div>

          )}

        </section>


        {/* =================================================
            CONVERSACIONES
        ================================================= */}

        <section className="mis-consultas">


          <h2>
            Mis consultas
          </h2>


          {conversaciones.length === 0 ? (

            <div className="consultas-vacio">

              <MessageCircle size={32} />

              <p>
                Todavía no tienes consultas.
              </p>

            </div>

          ) : (

            <div className="consultas-lista">

              {conversaciones.map(
                (item) => (

                  <button
                    type="button"
                    key={item.id}
                    onClick={() =>
                      setConversacionActiva(
                        item
                      )
                    }
                    className={
                      conversacionActiva?.id ===
                      item.id
                        ? "consulta-item activa"
                        : "consulta-item"
                    }
                  >

                    <strong>

                      {item.productoNombre
                        ? `Consulta sobre ${item.productoNombre}`
                        : "Consulta general"}

                    </strong>

                    <span>
                      {item.ultimoMensaje}
                    </span>

                    <small>
                      {item.estado}
                    </small>

                  </button>

                )
              )}

            </div>

          )}


          {/* CHAT */}

          {conversacionActiva && (

            <div className="consulta-chat">


              <div className="consulta-chat-mensajes">

                {mensajes.map(
                  (item) => (

                    <div
                      key={item.id}
                      className={
                        item.autor === "admin"
                          ? "consulta-chat-mensaje mensaje-respuesta-admin"
                          : "consulta-chat-mensaje mensaje-consulta-cliente"
                      }
                    >

                      <strong>

                        {item.autor === "admin"
                          ? "Café de Origen"
                          : "Tú"}

                      </strong>

                      <p>
                        {item.texto}
                      </p>

                    </div>

                  )
                )}

              </div>


              <form
                className="consulta-chat-form"
                onSubmit={responder}
              >

                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={mensajeNuevo}
                  onChange={(e) =>
                    setMensajeNuevo(
                      e.target.value
                    )
                  }
                />


                <button
                  type="submit"
                  disabled={
                    enviando ||
                    !mensajeNuevo.trim()
                  }
                >
                  <Send size={18} />
                </button>

              </form>


            </div>

          )}


        </section>


      </div>

    </div>

  );

}


export default Consultas;