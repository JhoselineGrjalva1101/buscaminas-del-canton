import './estilo.css';
import {
  CONFIG,
  RESUMEN_RIESGOS,
  accionarSeleccionada,
  alternarModo,
  crearPartida,
  destaparZona,
  marcarZona,
  moverSeleccion,
  obtenerResumenRiesgos,
  obtenerRiesgosRestantes,
  reiniciarPartida,
  type Direccion,
  type EstadoPartida,
} from "./logica";

const aplicacion = document.querySelector<HTMLDivElement>("#app");

if (!aplicacion) {
  throw new Error('No se encontró el contenedor requerido con id="app".');
}

let partida: EstadoPartida | null = null;

function obtenerSemilla(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

function iniciarPartida(): void {
  partida = crearPartida(obtenerSemilla());
  dibujar();
  aplicacion
    .querySelector<HTMLButtonElement>(".casilla-seleccionada")
    ?.focus();
}

function reiniciar(): void {
  if (!partida) {
    iniciarPartida();
    return;
  }

  if (!reiniciarPartida(partida, obtenerSemilla())) {
    throw new Error("No se pudo reiniciar la partida.");
  }

  dibujar();
  document.querySelector<HTMLButtonElement>("[data-reiniciar]")?.focus();
}

function dibujarCasillas(): string {
  if (!partida) {
    return "";
  }

  return partida.casillas
    .map((fila, indiceFila) =>
      fila
        .map((casilla, indiceColumna) => {
          const seleccionada =
            partida?.filaSeleccionada === indiceFila &&
            partida.columnaSeleccionada === indiceColumna;
          let clase = "casilla-tapada";
          let contenido = "";
          let descripcion = `Zona ${indiceFila + 1}, ${indiceColumna + 1}, sin destapar`;

          if (casilla.destapada && casilla.riesgo !== null) {
            clase = "casilla-riesgo";
            contenido = "!";
            descripcion = `Zona de riesgo revelada: ${
              RESUMEN_RIESGOS.find((riesgo) => riesgo.tipo === casilla.riesgo)
                ?.nombre ?? "riesgo"
            }`;
          } else if (casilla.destapada) {
            clase = "casilla-segura";
            contenido =
              casilla.riesgosAdyacentes === 0
                ? ""
                : String(casilla.riesgosAdyacentes);
            descripcion =
              casilla.riesgosAdyacentes === 0
                ? "Zona segura sin riesgos alrededor"
                : `Zona segura, ${casilla.riesgosAdyacentes} ${
                    casilla.riesgosAdyacentes === 1 ? "riesgo" : "riesgos"
                  } alrededor`;
          } else if (casilla.marcada) {
            clase = "casilla-marcada";
            contenido = "M";
            descripcion = `Zona ${indiceFila + 1}, ${
              indiceColumna + 1
            }, marcada como sospechosa`;
          }

          return `<button
            class="casilla ${clase}${seleccionada ? " casilla-seleccionada" : ""}"
            type="button"
            data-fila="${indiceFila}"
            data-columna="${indiceColumna}"
            aria-label="${descripcion}"
            aria-pressed="${seleccionada}"
            ${partida?.resultado !== "en curso" ? "disabled" : ""}
          >${contenido}</button>`;
        })
        .join(""),
    )
    .join("");
}

function dibujarResumen(): string {
  if (!partida) {
    return "";
  }

  return obtenerResumenRiesgos(partida)
    .map(
      (riesgo) => `<li class="resumen-riesgo">
        <h3>${riesgo.nombre} (×${riesgo.cantidad})</h3>
        <p>${riesgo.significado}</p>
      </li>`,
    )
    .join("");
}

function dibujar(): void {
  if (!partida) {
    aplicacion.innerHTML = `
      <main class="contenedor pantalla-inicio">
        <section class="panel bienvenida" aria-labelledby="titulo-juego">
          <p class="sobrelinea">Un mapa para conocer tu comunidad</p>
          <h1 id="titulo-juego">Buscaminas del Cantón</h1>
          <p class="introduccion">
            Destapá las zonas seguras, marcá las sospechosas y descubrí qué
            significan los riesgos de tu cantón.
          </p>
          <button class="boton boton-principal" type="button" data-iniciar>
            Empezar partida
          </button>
        </section>
      </main>`;
    document
      .querySelector<HTMLButtonElement>("[data-iniciar]")
      ?.addEventListener("click", iniciarPartida);
    return;
  }

  if (partida.resultado !== "en curso") {
    const gano = partida.resultado === "ganada";
    aplicacion.innerHTML = `
      <main class="contenedor pantalla-final">
        <header class="encabezado">
          <p class="sobrelinea">Buscaminas del Cantón</p>
          <h1>${gano ? "¡Ganaste!" : "Zona de riesgo"}</h1>
          <p class="mensaje-final">${
            gano
              ? "Destapaste todas las zonas seguras."
              : "Se reveló el mapa completo. Conocé qué significa cada riesgo."
          }</p>
        </header>
        <section class="panel mapa-final" aria-label="Mapa final revelado">
          <div class="cuadricula" role="group" aria-label="Mapa final">
            ${dibujarCasillas()}
          </div>
        </section>
        <section class="panel panel-resumen" aria-labelledby="titulo-resumen">
          <h2 id="titulo-resumen">¿Qué significa cada zona de riesgo?</h2>
          <ul class="lista-riesgos">${dibujarResumen()}</ul>
        </section>
        <button class="boton boton-principal" type="button" data-reiniciar>
          Reiniciar partida
        </button>
      </main>`;
    document
      .querySelector<HTMLButtonElement>("[data-reiniciar]")
      ?.addEventListener("click", reiniciar);
    return;
  }

  aplicacion.innerHTML = `
    <main class="contenedor pantalla-juego">
      <header class="encabezado encabezado-juego">
        <div>
          <p class="sobrelinea">Buscaminas del Cantón</p>
          <h1>Encontrá las zonas seguras</h1>
        </div>
        <button class="boton boton-secundario" type="button" data-reiniciar>
          Reiniciar
        </button>
      </header>
      <section class="panel panel-juego" aria-label="Partida">
        <div class="barra-estado">
          <p class="contador" aria-live="polite">
            Zonas de riesgo por marcar:
            <strong>${obtenerRiesgosRestantes(partida)}</strong>
          </p>
          <p class="aviso-modo" aria-live="polite">
            Modo: <strong>${
              partida.modo === "destapar" ? "Destapar" : "Marcar"
            }</strong>
          </p>
        </div>
        <div class="cuadricula" role="group" aria-label="Mapa de ${
          CONFIG.FILAS
        } por ${CONFIG.COLUMNAS} zonas">
          ${dibujarCasillas()}
        </div>
        <div class="controles">
          <button
            class="boton boton-bandera${partida.modo === "marcar" ? " activo" : ""}"
            type="button"
            data-modo
            aria-pressed="${partida.modo === "marcar"}"
          >${partida.modo === "marcar" ? "Volver a destapar" : "⚑ Marcar zona"}</button>
          <p class="ayuda-controles">
            Tocá una zona para destaparla. Usá la bandera para marcar. Teclado:
            flechas, Espacio o Enter, M y R.
          </p>
        </div>
      </section>
      <section class="leyenda" aria-label="Significado de los colores">
        <p><span class="muestra muestra-tapada"></span>Sin destapar</p>
        <p><span class="muestra muestra-segura"></span>Segura</p>
        <p><span class="muestra muestra-marcada"></span>Marcada</p>
        <p><span class="muestra muestra-riesgo"></span>Riesgo revelado</p>
      </section>
    </main>`;

  aplicacion
    .querySelector<HTMLButtonElement>("[data-reiniciar]")
    ?.addEventListener("click", reiniciar);
  aplicacion
    .querySelector<HTMLButtonElement>("[data-modo]")
    ?.addEventListener("click", () => {
      alternarModo(partida!);
      dibujar();
      aplicacion
        .querySelector<HTMLButtonElement>("[data-modo]")
        ?.focus();
    });

  aplicacion.querySelectorAll<HTMLButtonElement>("[data-fila]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const fila = Number(boton.dataset.fila);
      const columna = Number(boton.dataset.columna);

      if (partida?.modo === "marcar") {
        marcarZona(partida, fila, columna);
      } else if (partida) {
        destaparZona(partida, fila, columna);
      }

      dibujar();
      if (partida?.resultado === "en curso") {
        aplicacion
          .querySelector<HTMLButtonElement>(
            `[data-fila="${fila}"][data-columna="${columna}"]`,
          )
          ?.focus();
      } else {
        aplicacion
          .querySelector<HTMLButtonElement>("[data-reiniciar]")
          ?.focus();
      }
    });
  });
}

function manejarTeclado(evento: KeyboardEvent): void {
  if (!partida || partida.resultado !== "en curso") {
    if (evento.key.toLowerCase() === "r") {
      reiniciar();
    }
    return;
  }

  const direcciones: Record<string, Direccion> = {
    ArrowUp: "arriba",
    ArrowDown: "abajo",
    ArrowLeft: "izquierda",
    ArrowRight: "derecha",
  };
  const direccion = direcciones[evento.key];

  if (direccion) {
    evento.preventDefault();
    if (moverSeleccion(partida, direccion)) {
      dibujar();
      aplicacion
        .querySelector<HTMLButtonElement>(".casilla-seleccionada")
        ?.focus();
    }
    return;
  }

  if (evento.key === " " || evento.key === "Enter") {
    if (
      !(evento.target instanceof HTMLElement) ||
      !evento.target.matches(".casilla")
    ) {
      return;
    }

    evento.preventDefault();
    accionarSeleccionada(partida);
    dibujar();
    aplicacion
      .querySelector<HTMLButtonElement>(".casilla-seleccionada")
      ?.focus();
  } else if (evento.key.toLowerCase() === "m") {
    evento.preventDefault();
    alternarModo(partida);
    dibujar();
    aplicacion
      .querySelector<HTMLButtonElement>("[data-modo]")
      ?.focus();
  } else if (evento.key.toLowerCase() === "r") {
    evento.preventDefault();
    reiniciar();
  }
}

document.addEventListener("keydown", manejarTeclado);
dibujar();
