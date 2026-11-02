/**
 * Paginacion
 * Navegacion accesible y reutilizable para listados paginados en cliente.
 */
export default function Paginacion({ pagina, totalPaginas, onCambiar, etiqueta = 'Paginacion' }) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  const visibles = paginas.filter(
    (numero) => numero === 1 || numero === totalPaginas || Math.abs(numero - pagina) <= 1
  );

  return (
    <nav aria-label={etiqueta}>
      <ul className="pagination pagination-sm justify-content-center mb-0">
        <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onCambiar(pagina - 1)}
            aria-label="Pagina anterior"
            disabled={pagina === 1}
          >
            Anterior
          </button>
        </li>

        {visibles.map((numero, indice) => {
          const anterior = visibles[indice - 1];
          const mostrarSeparador = anterior && numero - anterior > 1;

          return (
            <li className="page-item" key={numero}>
              {mostrarSeparador && (
                <span className="page-link" aria-hidden="true">
                  …
                </span>
              )}
              <button
                type="button"
                className={`page-link ${numero === pagina ? 'active' : ''}`}
                onClick={() => onCambiar(numero)}
                aria-current={numero === pagina ? 'page' : undefined}
                aria-label={`Pagina ${numero}`}
              >
                {numero}
              </button>
            </li>
          );
        })}

        <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onCambiar(pagina + 1)}
            aria-label="Pagina siguiente"
            disabled={pagina === totalPaginas}
          >
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  );
}
