import "../css/adminPedidos.css";

function AdminPedidos() {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Pedidos</h1>

        <p>
          Aquí aparecerán todos los pedidos realizados
          por los clientes.
        </p>
      </div>

      <div className="admin-card">
        <h2>Aún no hay pedidos</h2>

        <p>
          Cuando los clientes realicen compras,
          aparecerán aquí.
        </p>
      </div>
    </div>
  );
}

export default AdminPedidos;