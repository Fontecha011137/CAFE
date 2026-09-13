import { Link } from "react-router-dom";
import "../css/admin.css";

function Admin() {
  return (
    <div className="admin-page">

      <div className="admin-header">
        <h1>Panel Administrador</h1>

        <p>
          Gestiona pedidos, clientes y consultas de los usuarios.
        </p>
      </div>

      <div className="admin-opciones">

        <Link
          to="/admin/consultas"
          className="admin-card"
        >
          <h2>Consultas</h2>

          <p>
            Responde preguntas sobre productos y
            solicitudes relacionadas con el envío.
          </p>

          <span>
            Ver consultas →
          </span>
        </Link>


        <Link
          to="/admin/pedidos"
          className="admin-card"
        >
          <h2>Pedidos</h2>

          <p>
            Gestiona los pedidos realizados
            por los clientes.
          </p>

          <span>
            Ver pedidos →
          </span>
        </Link>


        <Link
          to="/admin/clientes"
          className="admin-card"
        >
          <h2>Clientes</h2>

          <p>
            Consulta la información de todos
            los clientes registrados.
          </p>

          <span>
            Ver clientes →
          </span>
        </Link>

      </div>

    </div>
  );
}

export default Admin;