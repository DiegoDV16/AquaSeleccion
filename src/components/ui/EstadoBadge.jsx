import { buscarEstadoSolicitud } from '../../mock/solicitudes.js';

/** Badge del estado de la solicitud: pendiente / en proceso / finalizada. */
export default function EstadoBadge({ estado }) {
  const definicion = buscarEstadoSolicitud(estado);

  return (
    <span className={`badge badge-estado ${definicion.color}`}>
      <i className={`bi bi-${definicion.icono} me-1`} aria-hidden="true" />
      {definicion.nombre}
    </span>
  );
}