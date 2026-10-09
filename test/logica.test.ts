import { describe, expect, it } from "vitest";
import {
  CONFIG,
  RESUMEN_RIESGOS,
  accionarSeleccionada,
  alternarModo,
  crearPartida,
  crearGeneradorSemilla,
  destaparZona,
  marcarZona,
  moverSeleccion,
  obtenerResumenRiesgos,
  obtenerRiesgosRestantes,
  reiniciarPartida,
  type EstadoPartida,
} from "../src/logica";

function buscarCasilla(
  estado: EstadoPartida,
  condicion: (fila: number, columna: number) => boolean,
): [number, number] {
  for (let fila = 0; fila < estado.casillas.length; fila += 1) {
    for (let columna = 0; columna < estado.casillas[fila].length; columna += 1) {
      if (condicion(fila, columna)) {
        return [fila, columna];
      }
    }
  }

  throw new Error("No se encontró una casilla que cumpla la condición.");
}

describe("Lógica de Buscaminas del Cantón", () => {
  it("crea el mapa tapado con diez riesgos y dos de cada tipo", () => {
    const estado = crearPartida(12345);
    const riesgos = estado.casillas.flatMap((fila) =>
      fila.map((casilla) => casilla.riesgo).filter((riesgo) => riesgo !== null),
    );

    expect(estado.casillas).toHaveLength(CONFIG.FILAS);
    expect(estado.casillas.every((fila) => fila.length === CONFIG.COLUMNAS)).toBe(
      true,
    );
    expect(estado.resultado).toBe("en curso");
    expect(estado.modo).toBe("destapar");
    expect(estado.filaSeleccionada).toBe(0);
    expect(estado.columnaSeleccionada).toBe(0);
    expect(
      estado.casillas.flat().every((casilla) => !casilla.destapada && !casilla.marcada),
    ).toBe(true);
    expect(riesgos).toHaveLength(CONFIG.CANTIDAD_RIESGOS);

    for (const resumen of RESUMEN_RIESGOS) {
      expect(riesgos.filter((riesgo) => riesgo === resumen.tipo)).toHaveLength(
        resumen.cantidad,
      );
    }
  });

  it("genera el mismo mapa y la misma secuencia al repetir una semilla", () => {
    const primeraSecuencia = crearGeneradorSemilla(9876);
    const segundaSecuencia = crearGeneradorSemilla(9876);

    expect(crearPartida(9876).casillas).toEqual(crearPartida(9876).casillas);
    expect(Array.from({ length: 8 }, () => primeraSecuencia())).toEqual(
      Array.from({ length: 8 }, () => segundaSecuencia()),
    );
    expect(() => crearGeneradorSemilla(Number.NaN)).toThrow(RangeError);
  });

  it("destapa una zona segura y rechaza casillas marcadas, repetidas o fuera del mapa", () => {
    const estado = crearPartida(2468);
    const [fila, columna] = buscarCasilla(
      estado,
      (f, c) =>
        estado.casillas[f][c].riesgo === null &&
        estado.casillas[f][c].riesgosAdyacentes > 0,
    );

    expect(destaparZona(estado, fila, columna)).toBe(true);
    expect(estado.casillas[fila][columna].destapada).toBe(true);
    expect(destaparZona(estado, fila, columna)).toBe(false);

    const [filaMarcada, columnaMarcada] = buscarCasilla(
      estado,
      (f, c) =>
        estado.casillas[f][c].riesgo === null &&
        !estado.casillas[f][c].destapada,
    );
    expect(marcarZona(estado, filaMarcada, columnaMarcada)).toBe(true);
    expect(destaparZona(estado, filaMarcada, columnaMarcada)).toBe(false);
    expect(destaparZona(estado, -1, columna)).toBe(false);
  });

  it("marca y desmarca zonas, cuenta las banderas y no permite marcar una zona destapada", () => {
    const estado = crearPartida(1357);
    const [fila, columna] = buscarCasilla(
      estado,
      (f, c) => estado.casillas[f][c].riesgo === null,
    );

    expect(obtenerRiesgosRestantes(estado)).toBe(CONFIG.CANTIDAD_RIESGOS);
    expect(marcarZona(estado, fila, columna)).toBe(true);
    expect(estado.casillas[fila][columna].marcada).toBe(true);
    expect(obtenerRiesgosRestantes(estado)).toBe(CONFIG.CANTIDAD_RIESGOS - 1);
    expect(marcarZona(estado, fila, columna)).toBe(true);
    expect(estado.casillas[fila][columna].marcada).toBe(false);
    expect(obtenerRiesgosRestantes(estado)).toBe(CONFIG.CANTIDAD_RIESGOS);

    expect(destaparZona(estado, fila, columna)).toBe(true);
    expect(marcarZona(estado, fila, columna)).toBe(false);
    expect(marcarZona(estado, CONFIG.FILAS, 0)).toBe(false);
  });

  it("alterna el modo, mueve la selección y ejecuta la acción seleccionada", () => {
    const estado = crearPartida(8642);
    const [fila, columna] = buscarCasilla(
      estado,
      (f, c) =>
        estado.casillas[f][c].riesgo === null &&
        !estado.casillas[f][c].destapada &&
        !estado.casillas[f][c].marcada &&
        (f !== 0 || c !== 0),
    );

    expect(estado.modo).toBe("destapar");
    expect(alternarModo(estado)).toBe(true);
    expect(estado.modo).toBe("marcar");
    expect(accionarSeleccionada(estado)).toBe(true);
    expect(estado.casillas[0][0].marcada).toBe(true);

    expect(moverSeleccion(estado, "derecha")).toBe(true);
    expect(estado.columnaSeleccionada).toBe(1);
    expect(moverSeleccion(estado, "abajo")).toBe(true);
    expect(estado.filaSeleccionada).toBe(1);
    expect(moverSeleccion(estado, "arriba")).toBe(true);
    expect(moverSeleccion(estado, "izquierda")).toBe(true);
    expect(moverSeleccion(estado, "arriba")).toBe(false);
    expect(moverSeleccion(estado, "izquierda")).toBe(false);

    expect(alternarModo(estado)).toBe(true);
    estado.filaSeleccionada = fila;
    estado.columnaSeleccionada = columna;
    expect(accionarSeleccionada(estado)).toBe(true);
    expect(estado.casillas[fila][columna].destapada).toBe(true);
  });

  it("gana al destapar todas las zonas seguras y entonces muestra el resumen", () => {
    const estado = crearPartida(97531);

    expect(obtenerResumenRiesgos(estado)).toEqual([]);

    for (let fila = 0; fila < CONFIG.FILAS; fila += 1) {
      for (let columna = 0; columna < CONFIG.COLUMNAS; columna += 1) {
        const casilla = estado.casillas[fila][columna];
        if (
          estado.resultado === "en curso" &&
          casilla.riesgo === null &&
          !casilla.destapada
        ) {
          expect(destaparZona(estado, fila, columna)).toBe(true);
        }
      }
    }

    expect(estado.resultado).toBe("ganada");
    expect(
      estado.casillas.flat().every((casilla) => casilla.riesgo !== null || casilla.destapada),
    ).toBe(true);
    expect(obtenerResumenRiesgos(estado)).toEqual(RESUMEN_RIESGOS);
  });

  it("pierde al destapar un riesgo, revela todos y muestra el mismo resumen", () => {
    const estado = crearPartida(112233);
    const [fila, columna] = buscarCasilla(
      estado,
      (f, c) => estado.casillas[f][c].riesgo !== null,
    );

    expect(destaparZona(estado, fila, columna)).toBe(true);
    expect(estado.resultado).toBe("perdida");
    expect(estado.casillas.flat().every((casilla) => casilla.destapada)).toBe(
      true,
    );
    expect(obtenerResumenRiesgos(estado)).toEqual(RESUMEN_RIESGOS);
    expect(destaparZona(estado, 0, 0)).toBe(false);
    expect(marcarZona(estado, 0, 0)).toBe(false);
    expect(alternarModo(estado)).toBe(false);
    expect(moverSeleccion(estado, "derecha")).toBe(false);
  });

  it("reinicia la partida con un mapa nuevo y rechaza una semilla inválida", () => {
    const estado = crearPartida(42);
    const mapaAnterior = estado.casillas;
    const [filaSegura, columnaSegura] = buscarCasilla(
      estado,
      (f, c) =>
        estado.casillas[f][c].riesgo === null &&
        estado.casillas[f][c].riesgosAdyacentes > 0,
    );

    expect(destaparZona(estado, filaSegura, columnaSegura)).toBe(true);
    const estadoAntesDeSemillaInvalida = structuredClone(estado);
    expect(reiniciarPartida(estado, Number.NaN)).toBe(false);
    expect(estado).toEqual(estadoAntesDeSemillaInvalida);

    expect(reiniciarPartida(estado, 31415)).toBe(true);
    expect(estado.casillas).not.toBe(mapaAnterior);
    expect(estado).toEqual(crearPartida(31415));
  });
});
