/**
 * filtros.js
 * Filtros de las pantallas del Analista. Se mantienen fuera de los componentes
 * para poder probarlos con Vitest sin renderizar React.
 */

/**
 * Filtra candidatos por texto (nombre, correo o telefono) y origen.
 *
 * @param {Array<object>} candidatos
 * @param {{ busqueda?: string, tipo?: string }} opciones
 * @returns {Array<object>}
 */
export function filtrarCandidatos(candidatos, { busqueda = '', tipo = 'todas' } = {}) {
  const texto = busqueda.trim().toLowerCase();

  return candidatos.filter((candidato) => {
    const coincideTexto =
      texto === '' ||
      String(candidato.nombreCompleto ?? '').toLowerCase().includes(texto) ||
      String(candidato.correo ?? '').toLowerCase().includes(texto) ||
      String(candidato.telefono ?? '').toLowerCase().includes(texto);
    const coincideTipo = tipo === 'todas' || candidato.tipoPostulacion === tipo;

    return coincideTexto && coincideTipo;
  });
}

/**
 * Filtra solicitudes por estado, texto, cargo, evaluador y fecha de solicitud.
 *
 * @param {Array<object>} solicitudes
 * @param {{ estado?: string, texto?: string, idCargo?: string|number, idEvaluador?: string|number, fechaDesde?: string }} filtros
 * @returns {Array<object>}
 */
export function filtrarSolicitudes(
  solicitudes,
  { estado = 'todas', texto = '', idCargo = 'todos', idEvaluador = 'todos', fechaDesde = '' } = {},
) {
  const busqueda = texto.trim().toLowerCase();

  return solicitudes.filter((solicitud) => {
    const candidato = solicitud.candidato ?? {};
    const coincideEstado = estado === 'todas' || solicitud.estado === estado;
    const coincideCargo = idCargo === 'todos' || String(candidato.idCargo) === String(idCargo);
    const coincideEvaluador =
      idEvaluador === 'todos' || String(solicitud.evaluador?.id ?? '') === String(idEvaluador);
    const coincideFecha =
      fechaDesde === '' ||
      (solicitud.fechaSolicitud !== null && solicitud.fechaSolicitud >= fechaDesde);
    const coincideTexto =
      busqueda === '' ||
      String(solicitud.id).includes(busqueda) ||
      `SOL-${String(solicitud.id).padStart(4, '0')}`.toLowerCase().includes(busqueda) ||
      String(candidato.nombreCompleto ?? '').toLowerCase().includes(busqueda) ||
      String(candidato.correo ?? '').toLowerCase().includes(busqueda);

    return coincideEstado && coincideCargo && coincideEvaluador && coincideFecha && coincideTexto;
  });
}
