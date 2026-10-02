/**
 * Tarjeta de metrica del dashboard.
 * - `acento`: color solido del borde izquierdo y del icono (contraste AA con blanco).
 * - `tinte`: fondo claro de la pastilla de tendencia.
 * - `pie`: detalle en texto; `variacion`: tendencia del periodo.
 */
export default function StatCard({ titulo, valor, pie, icono, tinte = 'bg-tint-primary', variacion, acento }) {
  return (
    <div className="aqua-stat" style={acento ? { '--stat-accent': acento } : undefined}>
      <span className="stat-icon is-solid" aria-hidden="true">
        <i className={`bi bi-${icono}`} />
      </span>
      <div className="flex-grow-1">
        <p className="stat-label mb-1">{titulo}</p>
        <p className="stat-value mb-1">{valor}</p>
        <p className="stat-foot mb-0">{pie}</p>
        {variacion && <span className={`stat-pill ${tinte}`}>{variacion}</span>}
      </div>
    </div>
  );
}

/** Version compacta usada en las tarjetas del modulo evaluador. */
export function StatCardCompacta({ titulo, valor, icono, acento = 'var(--aqua-solid-primary)' }) {
  return (
    <div className="aqua-stat py-3" style={{ '--stat-accent': acento }}>
      <span
        className="stat-icon is-solid"
        style={{ width: 40, height: 40, flexBasis: 40, fontSize: '1.15rem' }}
        aria-hidden="true"
      >
        <i className={`bi bi-${icono}`} />
      </span>
      <div>
        <p className="stat-value mb-1" style={{ fontSize: '1.4rem' }}>
          {valor}
        </p>
        <p className="stat-label mb-0">{titulo}</p>
      </div>
    </div>
  );
}