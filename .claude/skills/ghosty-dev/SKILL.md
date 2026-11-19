---
name: ghosty-dev
description: Trabajar con la bitácora del repo (pendientes en GitHub Issues que se cierran con evidencia). Úsala al empezar cualquier tarea de código en un repo con etiquetas ghosty-dev:*, cuando pidan «toma el siguiente pendiente», «cierra el #n» o cuando descubras trabajo nuevo.
---

# Bitácora: el trabajo vive en GitHub Issues, no en tu sesión

Tu sesión se puede tirar en cualquier momento. Lo que importa queda en el **pendiente** (un issue con etiqueta
`ghosty-dev:*`). Tres leyes, sin excepción:

1. **El trabajo vive en la bitácora, no en la sesión.** Lo pendiente, lo decidido y lo descubierto se escribe en
   el issue, no en tu contexto ni en un TODO de markdown.
2. **Se revisa la evidencia, no el código.** Nunca digas «ya quedó» sin evidencia; nunca cierres sin el
   comentario de evidencia.
3. **Se espera por evento, no se sondea.** Nunca preguntes una y otra vez por el CI (`sleep`, loops). Espéralo
   con UNA sola llamada que se bloquea (`ghosty-dev wait <n> --watch`, tope 5 min); si tarda más, toma otro
   pendiente o termina.

## El ciclo

```sh
ghosty-dev ready --json            # qué se puede tomar (listo, desbloqueado o CI ya resuelto)
ghosty-dev claim <n>               # te lo asigna y crea su worktree y su rama ghosty-dev/<n>-…
cd ../<repo>-<n>                 # trabaja SÓLO ahí: un pendiente, un worktree, un escritor
# … código y tests …
git push -u origin HEAD && gh pr create --fill --body "Closes #<n>"
ghosty-dev wait <n> --watch        # espera al CI en una sola llamada (en Claude Code, timeout 360000)
```

- **CI verde** → pide la revisión (abajo) y, cuando no tenga hallazgos abiertos, publica la evidencia.
- **CI rojo** → arréglalo, sube y vuelve a esperar.
- **Se acabaron los 5 min** → el pendiente queda en `esperando-ci`: toma otro independiente o termina.
  `ghosty-dev ready` te lo vuelve a ofrecer con `ci-verde` o `ci-rojo` cuando resuelva.

```sh
ghosty-dev evidence <n> --file evidencia.md   # valida el formato y lo publica en el issue
```

Después de publicarla, dile a la persona **dónde está y qué dice**: la liga del comentario (la imprime
`ghosty-dev evidence`), **la liga del PR** (ahí da el merge) y un resumen de tres renglones (qué se hizo, qué pruebas pasaron, CI). Que pueda decidir
el merge sin abrir el código.

El PR lo mergea el **Clerk** (la persona) después de leer la evidencia; `Closes #<n>` cierra el pendiente.
Si no hubo PR (tarea sin código), `ghosty-dev close <n>`, que también exige evidencia.

## La revisión: tú no te calificas

Quien escribe se califica de más. Antes de la evidencia, **otro agente con contexto limpio** revisa tu PR:

- **En Claude Code:** lanza el subagente `ghosty-dev-revisor` y pásale **sólo** «Revisa el pendiente #<n>». Nada
  de lo que pensaste, probaste o decidiste: si se lo cuentas, ya no es una revisión limpia.
- **Sin subagentes (Codex u otro):** corre `ghosty-dev review <n>` y pídele a la persona que pegue ese encargo
  en **otra sesión** (mejor si es otro modelo).

El revisor publica su revisión en el issue, atada al commit exacto del PR. La puerta exige una revisión **del
commit actual** con `Hallazgos abiertos: 0`.

- **Con hallazgos:** agrega al PR el archivo de pruebas que te pasó el revisor, arregla el código hasta que pase,
  sube, `ghosty-dev wait <n> --watch` y vuelve a pedir la revisión (cada push necesita revisión nueva).
- **Tope: 3 rondas.** Si a la tercera sigue con hallazgos, detente y explícale a la persona qué falta.

## El archivo de evidencia

~~~markdown
## Qué se hizo
Una o dos frases concretas.

## Verificación
```sh
$ npm test
<salida real, copiada, no resumida>
```

## CI
✅ passed — <liga del run>

## Preview
<liga o video del recorrido, o «no aplica»>

## Criterios de aceptación
- [x] <cada criterio del pendiente, con el mismo texto>
~~~

Reglas: la salida es la real (si la recortas, dilo); un criterio que no se cumple se queda `[ ]` y no publicas;
CI rojo no se publica como evidencia.

## Abrir pendientes desde la plática

Cuando la persona te diga qué hay que hacer («hay que paginar /pedidos»), tú abres el pendiente. Escribe un
objetivo (qué debe quedar cierto) y criterios que se puedan comprobar. Si son varios, uno por pendiente, y marca
los bloqueos. Enséñale a la persona la lista antes de crearlos. Al crearlos, `add` le abre a la persona sus
pendientes en el navegador (una vez por tanda); si quiere verlos otra vez, `ghosty-dev board`.

```sh
ghosty-dev add "Paginar /pedidos" --goal "GET /pedidos responde por páginas de 20" \
  --criteria "acepta ?page=N" --criteria "hay un test por página"
ghosty-dev add "Exportar CSV" --goal "…" --criteria "…" --by 12   # bloqueado por #12
```

## Lo que descubras

Si encuentras un bug, un test roto que no es tuyo o trabajo que falta: **abre un pendiente nuevo**, no una nota
ni un comentario perdido, y sigue con el tuyo.

```sh
ghosty-dev add "título" --goal "…" --criteria "…" --from <n>
# si tu pendiente no puede seguir sin él:
ghosty-dev block <n> --by <nuevo>
```

## Prohibido

- Identificadores en otro idioma que no sea inglés: variables, funciones, tipos, parámetros, llaves de objetos
  y nombres de archivo van en inglés aunque el pendiente esté en español (`{ array: '[1,2]' }`, no
  `{ arreglo: … }`). En español sólo comentarios, mensajes al usuario y nombres de las pruebas.

- Tomar un pendiente asignado a otro, o trabajar dos pendientes en el mismo worktree.
- Cerrar un issue con `gh issue close` directo, o publicar evidencia que no corriste.
- Sondear el CI (`sleep`, loops, preguntar una y otra vez). La única espera es `ghosty-dev wait <n> --watch`.
- Calificarte a ti mismo, escribir o publicar tú la revisión, o contarle al revisor lo que hiciste.
