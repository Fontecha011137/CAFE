import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/home.css";
import cafeImg from "../imagenes/Cafe.jpg";


function Home() {

  const navigate = useNavigate();

  const [mensaje, setMensaje] = useState("");


  const productos = [
    {
      id: 1,
      nombre: "Lavado",
      descripcion:
        "Perfil limpio, dulce y equilibrado.",
      precio: 30000,
      peso: "250 g",
      imagen: cafeImg
    },
    {
      id: 2,
      nombre: "Honey Dorado",
      descripcion:
        "Notas dulces y frutales.",
      precio: 50000,
      peso: "250 g",
      imagen: cafeImg
    },
    {
      id: 3,
      nombre: "Honey Rojo",
      descripcion:
        "Mayor cuerpo y sabores intensos.",
      precio: 60000,
      peso: "250 g",
      imagen: cafeImg
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


    const productoExistente =
      carrito.find(
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


      {/* HERO */}

      <section className="hero">


        <div className="hero-text">

          <h1>
            Café de Origen Colombia
          </h1>

          <p>
            Café colombiano especial cultivado
            directamente desde las montañas,
            con procesos Lavado y Honey.
          </p>

          <button
            onClick={irAProductos}
          >
            Comprar café
          </button>

        </div>


        <div className="hero-image">

          <img
            src={cafeImg}
            alt="Café colombiano"
          />

        </div>


      </section>



      {/* PRESENTACIÓN */}

      <section className="presentacion">

        <h2>
          Nuestro café
        </h2>

        <p>
          Seleccionamos los mejores granos de
          productores colombianos para llevar
          una experiencia auténtica de origen.
        </p>

      </section>



      {/* PRODUCTOS */}

      <section
        className="productos"
        id="productos"
      >

        <h2>
          Nuestros cafés
        </h2>


        <p className="productos-intro">
          Descubre nuestros diferentes procesos
          y encuentra el café ideal para ti.
        </p>


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

                <p>
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

                  {formatoPrecio(
                    producto.precio
                  )}

                </div>


                <button
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



      {/* MENSAJE PRODUCTO AGREGADO */}

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