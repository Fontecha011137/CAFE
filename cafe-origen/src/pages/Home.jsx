import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coffee,
  Mountain,
  Bean
} from "lucide-react";

import "../css/home.css";

import cafeImg from "../imagenes/Cafe.jpg";
import cafeLavadoImg from "../imagenes/cafe lavado.png";
import honeyDoradoImg from "../imagenes/Honey dorado.png";
import honeyRojoImg from "../imagenes/honey rojo.png";

function Home() {
  const navigate = useNavigate();

  const [mensaje, setMensaje] = useState("");

  const productos = [
    {
      id: 1,
      nombre: "Lavado",
      descripcion: "Perfil limpio, dulce y equilibrado.",
      precio: 30000,
      peso: "250 g",
      imagen: cafeLavadoImg
    },
    {
      id: 2,
      nombre: "Honey Dorado",
      descripcion: "Notas dulces y frutales.",
      precio: 50000,
      peso: "250 g",
      imagen: honeyDoradoImg
    },
    {
      id: 3,
      nombre: "Honey Rojo",
      descripcion: "Mayor cuerpo y sabores intensos.",
      precio: 60000,
      peso: "250 g",
      imagen: honeyRojoImg
    }
  ];

  const formatoPrecio = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(valor);
  };

  const irAProductos = () => {
    const seccionProductos =
      document.getElementById("productos");

    if (seccionProductos) {
      seccionProductos.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  const agregarAlCarrito = (producto) => {
    const carritoGuardado =
      localStorage.getItem("carritoCafe");

    let carrito = carritoGuardado
      ? JSON.parse(carritoGuardado)
      : [];

    const productoExistente = carrito.find(
      (item) => item.id === producto.id
    );

    if (productoExistente) {
      carrito = carrito.map((item) =>
        item.id === producto.id
          ? {
              ...item,
              cantidad: item.cantidad + 1
            }
          : item
      );
    } else {
      carrito.push({
        ...producto,
        cantidad: 1
      });
    }

    localStorage.setItem(
      "carritoCafe",
      JSON.stringify(carrito)
    );

    setMensaje(
      `${producto.nombre} agregado al carrito`
    );

    setTimeout(() => {
      setMensaje("");
    }, 2500);
  };

  return (
    <div className="home">

      {/* =========================
          HERO
      ========================= */}

      <section className="hero">

        <div className="hero-text">

          <h1>
            Café de Origen
            <span> Colombia</span>
          </h1>

          <p>
            Café colombiano especial cultivado
            directamente desde las montañas,
            con procesos Lavado y Honey.
          </p>

          <button
            className="btn-comprar-cafe"
            onClick={irAProductos}
          >
            Comprar café
          </button>

        </div>

        <div className="hero-image">

          <img
            src={cafeImg}
            alt="Café colombiano de origen"
          />

        </div>

      </section>


      {/* =========================
          NUESTRO CAFÉ
      ========================= */}

      <section className="presentacion">

        <div className="presentacion-decoracion presentacion-decoracion-izquierda">
          ☕
        </div>

        <div className="presentacion-decoracion presentacion-decoracion-derecha">
          ☕
        </div>

        <div className="presentacion-contenedor">

          <span className="presentacion-etiqueta">
            Café colombiano de origen
          </span>

          <h2>
            Nuestro café
          </h2>

          <div className="presentacion-separador">

            <span></span>

            <div className="presentacion-grano">
              ◆
            </div>

            <span></span>

          </div>

          <p className="presentacion-texto">
            Seleccionamos cuidadosamente cafés
            cultivados en las montañas colombianas,
            buscando resaltar el sabor, el aroma
            y la esencia de cada proceso.
          </p>

          <div className="presentacion-beneficios">

            <article className="beneficio-cafe">

              <div className="beneficio-icono">
                <Coffee size={31} />
              </div>

              <h3>
                Selección especial
              </h3>

              <p>
                Granos seleccionados para ofrecer
                una taza equilibrada y llena de sabor.
              </p>

            </article>

            <article className="beneficio-cafe">

              <div className="beneficio-icono">
                <Mountain size={31} />
              </div>

              <h3>
                Origen colombiano
              </h3>

              <p>
                Café cultivado en nuestras montañas
                y trabajado por productores
                colombianos.
              </p>

            </article>

            <article className="beneficio-cafe">

              <div className="beneficio-icono">
                <Bean size={31} />
              </div>

              <h3>
                Procesos únicos
              </h3>

              <p>
                Lavado, Honey Dorado y Honey Rojo,
                cada uno con un perfil diferente.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* =========================
          PRODUCTOS
      ========================= */}

      <section
        className="productos"
        id="productos"
      >

        <div className="productos-encabezado">

          <h2>
            Nuestros cafés
          </h2>

          <div className="productos-separador">

            <span></span>

            <div>
              ◆
            </div>

            <span></span>

          </div>

          <p className="productos-intro">
            Descubre nuestros diferentes procesos
            y encuentra el café ideal para ti.
          </p>

        </div>

        <div className="cards">

          {productos.map((producto) => (

            <article
              className="producto-card"
              key={producto.id}
            >

              <div className="producto-card-imagen">

                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                />

              </div>

              <div className="producto-card-contenido">

                <h3>
                  {producto.nombre}
                </h3>

                <p className="producto-descripcion">
                  {producto.descripcion}
                </p>

                <div className="producto-presentacion">

                  <span>
                    Presentación
                  </span>

                  <strong>
                    {producto.peso}
                  </strong>

                </div>

                <div className="producto-precio">
                  {formatoPrecio(producto.precio)}
                </div>

                <button
                  type="button"
                  className="btn-agregar-carrito"
                  onClick={() =>
                    agregarAlCarrito(producto)
                  }
                >
                  Agregar al carrito
                </button>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* =========================
          MENSAJE CARRITO
      ========================= */}

      {mensaje && (

        <div className="mensaje-carrito">

          <span>
            ✓ {mensaje}
          </span>

          <button
            onClick={() =>
              navigate("/carrito")
            }
          >
            Ver carrito
          </button>

        </div>

      )}

    </div>
  );
}

export default Home;