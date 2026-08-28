import "../css/adminClientes.css";

function AdminClientes() {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Clientes</h1>

        <p>
          Aquí aparecerán todos los usuarios registrados,
          hayan comprado o no.
        </p>
      </div>

      <div className="admin-card">
        <h2>Aún no hay clientes</h2>

        <p>
          Cuando conectemos Firebase,
          los usuarios registrados aparecerán aquí.
        </p>
      </div>
    </div>
  );
}

export default AdminClientes;