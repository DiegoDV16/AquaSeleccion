/**
 * calendar.gs — Web App de Google Apps Script para agendar evaluaciones en Google Calendar.
 *
 * Antes de publicar: en el proyecto, Configuración > Zona horaria = America/Santiago.
 * Implementar > Aplicación web: Ejecutar como "Yo", Quién tiene acceso "Cualquier persona".
 */

const TOKEN = 'reemplazar-por-token-local';
const DURACION_MS = 60 * 60 * 1000;
const HORAS_INICIO = [9, 10, 11];
const MAX_REUNIONES_POR_DIA = 3;
const DIAS_BUSQUEDA = 30;

function doPost(e) {
  try {
    const parametros = e.parameter;

    if (parametros.token !== TOKEN) {
      return respuesta(401, 'No autorizado.');
    }

    const candidato = (parametros.candidato || '').trim();
    const evaluador = (parametros.evaluador || '').trim();

    if (!candidato || !evaluador) {
      return respuesta(400, 'Faltan datos para agendar la reunión.');
    }

    const calendario = CalendarApp.getDefaultCalendar();
    const inicio = buscarBloqueLibre(calendario);

    if (!inicio) {
      return respuesta(409, 'No hay cupo disponible en el calendario.');
    }

    const evento = calendario.createEvent(
      'Evaluación - ' + candidato,
      inicio,
      new Date(inicio.getTime() + DURACION_MS),
      { guests: evaluador, sendInvites: true }
    );

    return respuesta(200, 'Reunión agendada.', {
      idEvento: evento.getId(),
      inicio: inicio.toISOString(),
    });
  } catch (error) {
    console.error('Error al agendar la reunión.');
    return respuesta(500, 'No se pudo agendar la reunión.');
  }
}

function buscarBloqueLibre(calendario) {
  const hoy = new Date();

  for (let i = 1; i <= DIAS_BUSQUEDA; i++) {
    const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
    const diaSemana = dia.getDay();

    if (diaSemana === 0 || diaSemana === 6) {
      continue;
    }

    const reunionesDelDia = calendario.getEventsForDay(dia).filter(function (evento) {
      const hora = evento.getStartTime().getHours();
      return !evento.isAllDayEvent() && hora >= 9 && hora <= 11;
    });

    if (reunionesDelDia.length >= MAX_REUNIONES_POR_DIA) {
      continue;
    }

    for (const hora of HORAS_INICIO) {
      const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), hora, 0, 0);
      const ocupados = calendario.getEvents(inicio, new Date(inicio.getTime() + DURACION_MS));

      if (ocupados.length === 0) {
        return inicio;
      }
    }
  }

  return null;
}

function respuesta(codigo, mensaje, datos) {
  const cuerpo = Object.assign({ ok: codigo === 200, mensaje: mensaje }, datos || {});
  return ContentService.createTextOutput(JSON.stringify(cuerpo))
    .setMimeType(ContentService.MimeType.JSON);
}
