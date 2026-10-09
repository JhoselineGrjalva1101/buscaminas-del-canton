(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const t of o.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&n(t)}).observe(document,{childList:!0,subtree:!0});function e(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=e(i);fetch(i.href,o)}})();const c={FILAS:8,COLUMNAS:8,CANTIDAD_RIESGOS:10,RIESGOS_POR_TIPO:2,MULTIPLICADOR_GENERADOR:1664525,INCREMENTO_GENERADOR:1013904223,MODULO_GENERADOR:4294967296},E=[{tipo:"deslave",nombre:"Deslave",cantidad:c.RIESGOS_POR_TIPO,significado:"Ladera donde la tierra se puede desprender con las lluvias fuertes. En la vida real, las casas construidas debajo o encima de una ladera sin muros de contención están en peligro."},{tipo:"inundacion",nombre:"Inundación",cantidad:c.RIESGOS_POR_TIPO,significado:"Zona baja cerca de un río o quebrada que se llena cuando llueve mucho. En la vida real, la gente que vive ahí tiene que evacuar rápido en invierno."},{tipo:"falla-sismica",nombre:"Falla sísmica",cantidad:c.RIESGOS_POR_TIPO,significado:"Terreno sobre una grieta de la tierra donde los temblores se sienten más fuerte. En la vida real, conviene construir con normas antisísmicas y tener un plan de evacuación."},{tipo:"incendio",nombre:"Incendio",cantidad:c.RIESGOS_POR_TIPO,significado:"Zona con maleza seca o basura quemada que puede prenderse en verano. En la vida real, quemar basura o rastrojo cerca de las casas puede iniciar un incendio."},{tipo:"sin-alumbrado",nombre:"Zona sin alumbrado",cantidad:c.RIESGOS_POR_TIPO,significado:"Calles oscuras donde es más fácil que ocurran accidentes o robos. En la vida real, la comunidad puede pedir a la alcaldía que instale luminarias."}],N=["deslave","inundacion","falla-sismica","incendio","sin-alumbrado"];function R(a){return Number.isSafeInteger(a)}function g(a,r){return a>=0&&a<c.FILAS&&r>=0&&r<c.COLUMNAS}function y(a,r){const e=[...a];for(let n=e.length-1;n>0;n-=1){const i=Math.floor(r()*(n+1));[e[n],e[i]]=[e[i],e[n]]}return e}function $(a,r,e){let n=0;for(let i=-1;i<=1;i+=1)for(let o=-1;o<=1;o+=1){if(i===0&&o===0)continue;const t=r+i,l=e+o;g(t,l)&&a[t][l].riesgo!==null&&(n+=1)}return n}function q(a,r,e){const n=[[r,e]];let i=!1;for(;n.length>0;){const[o,t]=n.pop(),l=a.casillas[o][t];if(!(l.destapada||l.marcada||l.riesgo!==null)&&(l.destapada=!0,i=!0,l.riesgosAdyacentes===0))for(let u=-1;u<=1;u+=1)for(let b=-1;b<=1;b+=1){if(u===0&&b===0)continue;const p=o+u,m=t+b;g(p,m)&&!a.casillas[p][m].destapada&&!a.casillas[p][m].marcada&&a.casillas[p][m].riesgo===null&&n.push([p,m])}}return i}function C(a){let r=!1;for(const e of a.casillas)for(const n of e)n.destapada||(n.destapada=!0,r=!0);return r}function D(a){return a.casillas.some(e=>e.some(n=>n.riesgo===null&&!n.destapada))?!1:(a.resultado="ganada",!0)}function _(a){if(!R(a))throw new RangeError("La semilla debe ser un número entero seguro.");let r=a>>>0;return()=>(r=Math.imul(r,c.MULTIPLICADOR_GENERADOR)+c.INCREMENTO_GENERADOR>>>0,r/c.MODULO_GENERADOR)}function h(a){const r=_(a),e=Array.from({length:c.FILAS},()=>Array.from({length:c.COLUMNAS},()=>({destapada:!1,marcada:!1,riesgosAdyacentes:0,riesgo:null}))),n=y(Array.from({length:c.FILAS*c.COLUMNAS},(o,t)=>t),r),i=y(N.flatMap(o=>Array.from({length:c.RIESGOS_POR_TIPO},()=>o)),r);for(let o=0;o<c.CANTIDAD_RIESGOS;o+=1){const t=n[o],l=Math.floor(t/c.COLUMNAS),u=t%c.COLUMNAS;e[l][u].riesgo=i[o]}for(let o=0;o<c.FILAS;o+=1)for(let t=0;t<c.COLUMNAS;t+=1)e[o][t].riesgosAdyacentes=$(e,o,t);return{casillas:e,resultado:"en curso",modo:"destapar",filaSeleccionada:0,columnaSeleccionada:0,semilla:a}}function P(a){const r=a.casillas.reduce((e,n)=>e+n.filter(i=>i.marcada).length,0);return c.CANTIDAD_RIESGOS-r}function T(a){return a.resultado==="en curso"?[]:E}function A(a,r,e){if(a.resultado!=="en curso"||!g(r,e))return!1;const n=a.casillas[r][e];return n.destapada||n.marcada?!1:n.riesgo!==null?(C(a),a.resultado="perdida",!0):(q(a,r,e),D(a),!0)}function v(a,r,e){if(a.resultado!=="en curso"||!g(r,e))return!1;const n=a.casillas[r][e];return n.destapada?!1:(n.marcada=!n.marcada,!0)}function I(a){return a.resultado!=="en curso"?!1:(a.modo=a.modo==="destapar"?"marcar":"destapar",!0)}function z(a,r){if(a.resultado!=="en curso")return!1;let e=a.filaSeleccionada,n=a.columnaSeleccionada;switch(r){case"arriba":e-=1;break;case"abajo":e+=1;break;case"izquierda":n-=1;break;case"derecha":n+=1;break}return g(e,n)?(a.filaSeleccionada=e,a.columnaSeleccionada=n,!0):!1}function G(a){return a.modo==="marcar"?v(a,a.filaSeleccionada,a.columnaSeleccionada):A(a,a.filaSeleccionada,a.columnaSeleccionada)}function w(a,r){if(!R(r))return!1;const e=h(r);return a.casillas=e.casillas,a.resultado=e.resultado,a.modo=e.modo,a.filaSeleccionada=e.filaSeleccionada,a.columnaSeleccionada=e.columnaSeleccionada,a.semilla=e.semilla,!0}const d=document.querySelector("#app");if(!d)throw new Error('No se encontró el contenedor requerido con id="app".');let s=null;function L(){return crypto.getRandomValues(new Uint32Array(1))[0]}function M(){s=h(L()),f(),d.querySelector(".casilla-seleccionada")?.focus()}function S(){if(!s){M();return}if(!w(s,L()))throw new Error("No se pudo reiniciar la partida.");f(),document.querySelector("[data-reiniciar]")?.focus()}function O(){return s?s.casillas.map((a,r)=>a.map((e,n)=>{const i=s?.filaSeleccionada===r&&s.columnaSeleccionada===n;let o="casilla-tapada",t="",l=`Zona ${r+1}, ${n+1}, sin destapar`;return e.destapada&&e.riesgo!==null?(o="casilla-riesgo",t="!",l=`Zona de riesgo revelada: ${E.find(u=>u.tipo===e.riesgo)?.nombre??"riesgo"}`):e.destapada?(o="casilla-segura",t=e.riesgosAdyacentes===0?"":String(e.riesgosAdyacentes),l=e.riesgosAdyacentes===0?"Zona segura sin riesgos alrededor":`Zona segura, ${e.riesgosAdyacentes} ${e.riesgosAdyacentes===1?"riesgo":"riesgos"} alrededor`):e.marcada&&(o="casilla-marcada",t="M",l=`Zona ${r+1}, ${n+1}, marcada como sospechosa`),`<button
            class="casilla ${o}${i?" casilla-seleccionada":""}"
            type="button"
            data-fila="${r}"
            data-columna="${n}"
            aria-label="${l}"
            aria-pressed="${i}"
            ${s?.resultado!=="en curso"?"disabled":""}
          >${t}</button>`}).join("")).join(""):""}function j(){return s?T(s).map(a=>`<li class="resumen-riesgo">
        <h3>${a.nombre} (×${a.cantidad})</h3>
        <p>${a.significado}</p>
      </li>`).join(""):""}function f(){if(!s){d.innerHTML=`
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
      </main>`,document.querySelector("[data-iniciar]")?.addEventListener("click",M);return}if(s.resultado!=="en curso"){const a=s.resultado==="ganada";d.innerHTML=`
      <main class="contenedor pantalla-final">
        <header class="encabezado">
          <p class="sobrelinea">Buscaminas del Cantón</p>
          <h1>${a?"¡Ganaste!":"Zona de riesgo"}</h1>
          <p class="mensaje-final">${a?"Destapaste todas las zonas seguras.":"Se reveló el mapa completo. Conocé qué significa cada riesgo."}</p>
        </header>
        <section class="panel mapa-final" aria-label="Mapa final revelado">
          <div class="cuadricula" role="group" aria-label="Mapa final">
            ${O()}
          </div>
        </section>
        <section class="panel panel-resumen" aria-labelledby="titulo-resumen">
          <h2 id="titulo-resumen">¿Qué significa cada zona de riesgo?</h2>
          <ul class="lista-riesgos">${j()}</ul>
        </section>
        <button class="boton boton-principal" type="button" data-reiniciar>
          Reiniciar partida
        </button>
      </main>`,document.querySelector("[data-reiniciar]")?.addEventListener("click",S);return}d.innerHTML=`
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
            <strong>${P(s)}</strong>
          </p>
          <p class="aviso-modo" aria-live="polite">
            Modo: <strong>${s.modo==="destapar"?"Destapar":"Marcar"}</strong>
          </p>
        </div>
        <div class="cuadricula" role="group" aria-label="Mapa de ${c.FILAS} por ${c.COLUMNAS} zonas">
          ${O()}
        </div>
        <div class="controles">
          <button
            class="boton boton-bandera${s.modo==="marcar"?" activo":""}"
            type="button"
            data-modo
            aria-pressed="${s.modo==="marcar"}"
          >${s.modo==="marcar"?"Volver a destapar":"⚑ Marcar zona"}</button>
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
    </main>`,d.querySelector("[data-reiniciar]")?.addEventListener("click",S),d.querySelector("[data-modo]")?.addEventListener("click",()=>{I(s),f(),d.querySelector("[data-modo]")?.focus()}),d.querySelectorAll("[data-fila]").forEach(a=>{a.addEventListener("click",()=>{const r=Number(a.dataset.fila),e=Number(a.dataset.columna);s?.modo==="marcar"?v(s,r,e):s&&A(s,r,e),f(),s?.resultado==="en curso"?d.querySelector(`[data-fila="${r}"][data-columna="${e}"]`)?.focus():d.querySelector("[data-reiniciar]")?.focus()})})}function U(a){if(!s||s.resultado!=="en curso"){a.key.toLowerCase()==="r"&&S();return}const e={ArrowUp:"arriba",ArrowDown:"abajo",ArrowLeft:"izquierda",ArrowRight:"derecha"}[a.key];if(e){a.preventDefault(),z(s,e)&&(f(),d.querySelector(".casilla-seleccionada")?.focus());return}if(a.key===" "||a.key==="Enter"){if(!(a.target instanceof HTMLElement)||!a.target.matches(".casilla"))return;a.preventDefault(),G(s),f(),d.querySelector(".casilla-seleccionada")?.focus()}else a.key.toLowerCase()==="m"?(a.preventDefault(),I(s),f(),d.querySelector("[data-modo]")?.focus()):a.key.toLowerCase()==="r"&&(a.preventDefault(),S())}document.addEventListener("keydown",U);f();
