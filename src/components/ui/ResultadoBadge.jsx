import { buscarResultado } from '../../mock/solicitudes.js';

/** Badge del resultado de la evaluacion psicologica. */
export default function ResultadoBadge({ resultado }) {
  const definicion = buscarResultado(resultado);

  if (!definicion) {
    return <span className="text-muted-aqua">Sin resultado</span>;
  }

  return <span className={`badge badge-estado ${definicion.color}`}>{definicion.nombre}</span>;
}