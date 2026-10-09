export const CONFIG = {
  FILAS: 8, // casillas verticales
  COLUMNAS: 8, // casillas horizontales
  CANTIDAD_RIESGOS: 10, // zonas de riesgo
  TIPOS_RIESGO: 5, // tipos de riesgo
  RIESGOS_POR_TIPO: 2, // zonas de riesgo por tipo
  MULTIPLICADOR_GENERADOR: 1664525, // coeficiente del generador (sin unidad)
  INCREMENTO_GENERADOR: 1013904223, // unidades de estado del generador
  MODULO_GENERADOR: 4294967296, // estados posibles del generador (sin unidad)
} as const;

export type TipoRiesgo =
  | "deslave"
  | "inundacion"
  | "falla-sismica"
  | "incendio"
  | "sin-alumbrado";

export type ModoJuego = "destapar" | "marcar";
export type ResultadoPartida = "en curso" | "ganada" | "perdida";
export type Direccion = "arriba" | "abajo" | "izquierda" | "derecha";

export interface Casilla {
  destapada: boolean;
  marcada: boolean;
  riesgosAdyacentes: number;
  riesgo: TipoRiesgo | null;
}

export interface EstadoPartida {
  casillas: Casilla[][];
  resultado: ResultadoPartida;
  modo: ModoJuego;
  filaSeleccionada: number;
  columnaSeleccionada: number;
  semilla: number;
}

export interface ResumenRiesgo {
  tipo: TipoRiesgo;
  nombre: string;
  cantidad: number;
  significado: string;
}

export const RESUMEN_RIESGOS: readonly ResumenRiesgo[] = [
  {
    tipo: "deslave",
    nombre: "Deslave",
    cantidad: CONFIG.RIESGOS_POR_TIPO,
    significado:
      "Ladera donde la tierra se puede desprender con las lluvias fuertes. En la vida real, las casas construidas debajo o encima de una ladera sin muros de contención están en peligro.",
  },
  {
    tipo: "inundacion",
    nombre: "Inundación",
    cantidad: CONFIG.RIESGOS_POR_TIPO,
    significado:
      "Zona baja cerca de un río o quebrada que se llena cuando llueve mucho. En la vida real, la gente que vive ahí tiene que evacuar rápido en invierno.",
  },
  {
    tipo: "falla-sismica",
    nombre: "Falla sísmica",
    cantidad: CONFIG.RIESGOS_POR_TIPO,
    significado:
      "Terreno sobre una grieta de la tierra donde los temblores se sienten más fuerte. En la vida real, conviene construir con normas antisísmicas y tener un plan de evacuación.",
  },
  {
    tipo: "incendio",
    nombre: "Incendio",
    cantidad: CONFIG.RIESGOS_POR_TIPO,
    significado:
      "Zona con maleza seca o basura quemada que puede prenderse en verano. En la vida real, quemar basura o rastrojo cerca de las casas puede iniciar un incendio.",
  },
  {
    tipo: "sin-alumbrado",
    nombre: "Zona sin alumbrado",
    cantidad: CONFIG.RIESGOS_POR_TIPO,
    significado:
      "Calles oscuras donde es más fácil que ocurran accidentes o robos. En la vida real, la comunidad puede pedir a la alcaldía que instale luminarias.",
  },
];

const TIPOS_RIESGO: readonly TipoRiesgo[] = [
  "deslave",
  "inundacion",
  "falla-sismica",
  "incendio",
  "sin-alumbrado",
];

function semillaValida(semilla: number): boolean {
  return Number.isSafeInteger(semilla);
}

function estaDentroDelMapa(fila: number, columna: number): boolean {
  return (
    fila >= 0 &&
    fila < CONFIG.FILAS &&
    columna >= 0 &&
    columna < CONFIG.COLUMNAS
  );
}

function mezclar<T>(elementos: readonly T[], azar: () => number): T[] {
  const mezclados = [...elementos];

  for (let indice = mezclados.length - 1; indice > 0; indice -= 1) {
    const indiceAleatorio = Math.floor(azar() * (indice + 1));
    [mezclados[indice], mezclados[indiceAleatorio]] = [
      mezclados[indiceAleatorio],
      mezclados[indice],
    ];
  }

  return mezclados;
}

function contarRiesgosAdyacentes(
  casillas: Casilla[][],
  fila: number,
  columna: number,
): number {
  let cantidad = 0;

  for (let desplazamientoFila = -1; desplazamientoFila <= 1; desplazamientoFila += 1) {
    for (
      let desplazamientoColumna = -1;
      desplazamientoColumna <= 1;
      desplazamientoColumna += 1
    ) {
      if (desplazamientoFila === 0 && desplazamientoColumna === 0) {
        continue;
      }

      const filaVecina = fila + desplazamientoFila;
      const columnaVecina = columna + desplazamientoColumna;

      if (
        estaDentroDelMapa(filaVecina, columnaVecina) &&
        casillas[filaVecina][columnaVecina].riesgo !== null
      ) {
        cantidad += 1;
      }
    }
  }

  return cantidad;
}

function revelarZonasVacias(
  estado: EstadoPartida,
  filaInicial: number,
  columnaInicial: number,
): boolean {
  const pendientes: Array<[number, number]> = [[filaInicial, columnaInicial]];
  let huboCambios = false;

  while (pendientes.length > 0) {
    const [fila, columna] = pendientes.pop()!;
    const casilla = estado.casillas[fila][columna];

    if (casilla.destapada || casilla.marcada || casilla.riesgo !== null) {
      continue;
    }

    casilla.destapada = true;
    huboCambios = true;

    if (casilla.riesgosAdyacentes !== 0) {
      continue;
    }

    for (let desplazamientoFila = -1; desplazamientoFila <= 1; desplazamientoFila += 1) {
      for (
        let desplazamientoColumna = -1;
        desplazamientoColumna <= 1;
        desplazamientoColumna += 1
      ) {
        if (desplazamientoFila === 0 && desplazamientoColumna === 0) {
          continue;
        }

        const filaVecina = fila + desplazamientoFila;
        const columnaVecina = columna + desplazamientoColumna;

        if (
          estaDentroDelMapa(filaVecina, columnaVecina) &&
          !estado.casillas[filaVecina][columnaVecina].destapada &&
          !estado.casillas[filaVecina][columnaVecina].marcada &&
          estado.casillas[filaVecina][columnaVecina].riesgo === null
        ) {
          pendientes.push([filaVecina, columnaVecina]);
        }
      }
    }
  }

  return huboCambios;
}

function revelarTodoElMapa(estado: EstadoPartida): boolean {
  let huboCambios = false;

  for (const fila of estado.casillas) {
    for (const casilla of fila) {
      if (!casilla.destapada) {
        casilla.destapada = true;
        huboCambios = true;
      }
    }
  }

  return huboCambios;
}

function comprobarVictoria(estado: EstadoPartida): boolean {
  const quedanZonasSeguras = estado.casillas.some((fila) =>
    fila.some((casilla) => casilla.riesgo === null && !casilla.destapada),
  );

  if (!quedanZonasSeguras) {
    estado.resultado = "ganada";
    return true;
  }

  return false;
}

export function crearGeneradorSemilla(semilla: number): () => number {
  if (!semillaValida(semilla)) {
    throw new RangeError("La semilla debe ser un número entero seguro.");
  }

  let estadoInterno = semilla >>> 0;

  return (): number => {
    estadoInterno =
      (Math.imul(estadoInterno, CONFIG.MULTIPLICADOR_GENERADOR) +
        CONFIG.INCREMENTO_GENERADOR) >>>
      0;
    return estadoInterno / CONFIG.MODULO_GENERADOR;
  };
}

export function crearPartida(semilla: number): EstadoPartida {
  const azar = crearGeneradorSemilla(semilla);
  const casillas: Casilla[][] = Array.from({ length: CONFIG.FILAS }, () =>
    Array.from({ length: CONFIG.COLUMNAS }, () => ({
      destapada: false,
      marcada: false,
      riesgosAdyacentes: 0,
      riesgo: null,
    })),
  );
  const posiciones = mezclar(
    Array.from(
      { length: CONFIG.FILAS * CONFIG.COLUMNAS },
      (_, indice) => indice,
    ),
    azar,
  );
  const tiposRiesgo = mezclar(
    TIPOS_RIESGO.flatMap((tipo) =>
      Array.from({ length: CONFIG.RIESGOS_POR_TIPO }, () => tipo),
    ),
    azar,
  );

  for (let indice = 0; indice < CONFIG.CANTIDAD_RIESGOS; indice += 1) {
    const posicion = posiciones[indice];
    const fila = Math.floor(posicion / CONFIG.COLUMNAS);
    const columna = posicion % CONFIG.COLUMNAS;
    casillas[fila][columna].riesgo = tiposRiesgo[indice];
  }

  for (let fila = 0; fila < CONFIG.FILAS; fila += 1) {
    for (let columna = 0; columna < CONFIG.COLUMNAS; columna += 1) {
      casillas[fila][columna].riesgosAdyacentes = contarRiesgosAdyacentes(
        casillas,
        fila,
        columna,
      );
    }
  }

  return {
    casillas,
    resultado: "en curso",
    modo: "destapar",
    filaSeleccionada: 0,
    columnaSeleccionada: 0,
    semilla,
  };
}

export function obtenerRiesgosRestantes(estado: EstadoPartida): number {
  const cantidadMarcada = estado.casillas.reduce(
    (total, fila) =>
      total + fila.filter((casilla) => casilla.marcada).length,
    0,
  );

  return CONFIG.CANTIDAD_RIESGOS - cantidadMarcada;
}

export function obtenerResumenRiesgos(
  estado: EstadoPartida,
): readonly ResumenRiesgo[] {
  return estado.resultado === "en curso" ? [] : RESUMEN_RIESGOS;
}

export function destaparZona(
  estado: EstadoPartida,
  fila: number,
  columna: number,
): boolean {
  if (
    estado.resultado !== "en curso" ||
    !estaDentroDelMapa(fila, columna)
  ) {
    return false;
  }

  const casilla = estado.casillas[fila][columna];
  if (casilla.destapada || casilla.marcada) {
    return false;
  }

  if (casilla.riesgo !== null) {
    revelarTodoElMapa(estado);
    estado.resultado = "perdida";
    return true;
  }

  revelarZonasVacias(estado, fila, columna);
  comprobarVictoria(estado);
  return true;
}

export function marcarZona(
  estado: EstadoPartida,
  fila: number,
  columna: number,
): boolean {
  if (
    estado.resultado !== "en curso" ||
    !estaDentroDelMapa(fila, columna)
  ) {
    return false;
  }

  const casilla = estado.casillas[fila][columna];
  if (casilla.destapada) {
    return false;
  }

  casilla.marcada = !casilla.marcada;
  return true;
}

export function alternarModo(estado: EstadoPartida): boolean {
  if (estado.resultado !== "en curso") {
    return false;
  }

  estado.modo = estado.modo === "destapar" ? "marcar" : "destapar";
  return true;
}

export function moverSeleccion(
  estado: EstadoPartida,
  direccion: Direccion,
): boolean {
  if (estado.resultado !== "en curso") {
    return false;
  }

  let nuevaFila = estado.filaSeleccionada;
  let nuevaColumna = estado.columnaSeleccionada;

  switch (direccion) {
    case "arriba":
      nuevaFila -= 1;
      break;
    case "abajo":
      nuevaFila += 1;
      break;
    case "izquierda":
      nuevaColumna -= 1;
      break;
    case "derecha":
      nuevaColumna += 1;
      break;
  }

  if (!estaDentroDelMapa(nuevaFila, nuevaColumna)) {
    return false;
  }

  estado.filaSeleccionada = nuevaFila;
  estado.columnaSeleccionada = nuevaColumna;
  return true;
}

export function accionarSeleccionada(estado: EstadoPartida): boolean {
  if (estado.modo === "marcar") {
    return marcarZona(
      estado,
      estado.filaSeleccionada,
      estado.columnaSeleccionada,
    );
  }

  return destaparZona(
    estado,
    estado.filaSeleccionada,
    estado.columnaSeleccionada,
  );
}

export function reiniciarPartida(
  estado: EstadoPartida,
  semilla: number,
): boolean {
  if (!semillaValida(semilla)) {
    return false;
  }

  const partidaNueva = crearPartida(semilla);
  estado.casillas = partidaNueva.casillas;
  estado.resultado = partidaNueva.resultado;
  estado.modo = partidaNueva.modo;
  estado.filaSeleccionada = partidaNueva.filaSeleccionada;
  estado.columnaSeleccionada = partidaNueva.columnaSeleccionada;
  estado.semilla = partidaNueva.semilla;
  return true;
}
