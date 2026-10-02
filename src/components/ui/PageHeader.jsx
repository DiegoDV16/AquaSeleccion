/** Encabezado estandar de las vistas internas (migas + titulo + acciones). */
export default function PageHeader({ titulo, descripcion, acciones, etiqueta }) {
  return (
    <header className="aqua-page-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
      <div>
        {etiqueta && (
          <p className="text-uppercase text-muted-aqua mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
            {etiqueta}
          </p>
        )}
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {acciones && <div className="d-flex flex-wrap gap-2">{acciones}</div>}
    </header>
  );
}