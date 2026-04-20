# MemoTest

Juego de memoria responsive hecho con HTML, CSS y JavaScript vanilla.

## Mejoras incluidas

- Layout responsive para desktop, tablet y mobile
- Records guardados por dificultad usando `localStorage`
- Navegacion completa por teclado
- Mejoras de accesibilidad con estados y mensajes en vivo
- Reinicio de partida mas robusto, sin timers colgados
- Selector de dificultad y toggle de sonido persistente

## Como correrlo

Como es un proyecto estatico, alcanza con servir la carpeta localmente.

### Opcion con Python

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Despues abri:

```text
http://127.0.0.1:4173/
```

## Controles

- `Click` o `tap`: girar una carta
- `Flechas`: mover el foco entre cartas
- `Enter` o `Espacio`: girar la carta enfocada
- `Home` y `End`: ir a la primera o ultima carta
- `Escape`: cerrar el resumen final

## Estructura

- `index.html`: estructura principal de la interfaz
- `style.css`: estilos, responsive y estados visuales
- `script.js`: logica del juego, records y accesibilidad
- `images/`: imagenes de banderas y dorso
- `audio/`: sonidos del juego
