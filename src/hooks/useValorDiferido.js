import { useEffect, useState } from 'react';

/** Retrasa un valor para evitar consultas en cada tecla. */
export function useValorDiferido(valor, retraso = 300) {
  const [valorDiferido, setValorDiferido] = useState(valor);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setValorDiferido(valor);
    }, retraso);

    return () => window.clearTimeout(temporizador);
  }, [valor, retraso]);

  return valorDiferido;
}
