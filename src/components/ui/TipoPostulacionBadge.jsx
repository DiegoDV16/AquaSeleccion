import { tipoGestion } from '../../mock/historialSolicitudes.js';

/** Badge del origen de la postulacion: externa / interna. */
export default function TipoPostulacionBadge({ tipo }) {
  const definicion = tipoGestion(tipo);

  return <span className={`badge badge-tipo ${definicion.className}`}>{definicion.nombre}</span>;
}