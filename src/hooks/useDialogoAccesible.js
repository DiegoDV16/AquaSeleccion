import { useEffect, useRef } from 'react';

const SELECTOR_ENFOCABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Maneja el comportamiento accesible de un dialogo modal:
 * foco inicial, trampa de Tab, cierre con Escape y restauracion del foco.
 */
export function useDialogoAccesible(visible, onCerrar) {
  const contenedorRef = useRef(null);
  const cerrarRef = useRef(onCerrar);

  cerrarRef.current = onCerrar;

  useEffect(() => {
    if (!visible) return undefined;

    const contenedor = contenedorRef.current;
    const elementoAnterior = document.activeElement;
    let frame = 0;

    const obtenerEnfocables = () =>
      Array.from(contenedor?.querySelectorAll(SELECTOR_ENFOCABLES) ?? []).filter(
        (elemento) => elemento.getAttribute('aria-hidden') !== 'true'
      );

    const enfocarPrimero = () => {
      const enfocables = obtenerEnfocables();
      const primero = enfocables[0] ?? contenedor;
      primero?.focus();
    };

    frame = window.requestAnimationFrame(enfocarPrimero);

    const manejarTecla = (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        cerrarRef.current?.();
        return;
      }

      if (evento.key !== 'Tab') return;

      const enfocables = obtenerEnfocables();

      if (enfocables.length === 0) {
        evento.preventDefault();
        contenedor?.focus();
        return;
      }

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', manejarTecla);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', manejarTecla);

      if (elementoAnterior instanceof HTMLElement) {
        elementoAnterior.focus();
      }
    };
  }, [visible]);

  return contenedorRef;
}
