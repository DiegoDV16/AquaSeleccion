/**
 * Tarjeta de metrica del dashboard. `pie` muestra el detalle y `variacion` la
 * tendencia; ambos son datos simulados en esta etapa.
 */
export default function StatCard({ titulo, valor, pie, icono, tinte = 'bg-tint-primary', variacion }) {
  return (
    <div className="aqua-stat">
      <span className={`stat-icon ${tinte}`} aria-hidden="true">
        <i className={`bi bi-${icono}`} />
      </span>
      <div className="flex-grow-1">
        <p className="stat-label mb-1">{titulo}</p>
        <p className="stat-value mb-1">{valor}</p>
        <p className="stat-foot mb-0">{pie}</p>
        {variacion && (
          <p className="stat-foot mb-0 fst-italic">
            <i className="bi bi-arrow-right-short" aria-hidden="true" />
            {variacion}
          </p>
        )}
      </div>
    </div>
  );
}

/** Version compacta usada en las tarjetas del modulo evaluador. */
export function StatCardCompacta({ titulo, valor, icono, tinte = 'bg-tint-primary' }) {
  return (
    <div className="aqua-stat py-3">
      <span className={`stat-icon ${tinte}`} style={{ width: 38, height: 38, flexBasis: 38, fontSize: '1.1rem' }} aria-hidden="true">
        <i className={`bi bi-${icono}`} />
      </span>
      <div>
        <p className="stat-value" style={{ fontSize: '1.3rem' }}>
          {valor}
        </p>
        <p className="stat-label mb-0">{titulo}</p>
      </div>
    </div>
  );
}