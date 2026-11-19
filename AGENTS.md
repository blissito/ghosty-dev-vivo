<!-- ghosty-dev:agents -->
## Bitácora (ghosty-dev)

Este repo usa **ghosty-dev**: las tareas son issues de GitHub con etiqueta `ghosty-dev:*` y se cierran con
evidencia. No uses listas TODO en markdown para llevar el trabajo.

1. **El trabajo vive en la bitácora, no en la sesión.** Empieza con `ghosty-dev ready --json`, toma uno con
   `ghosty-dev claim <n>` y trabaja sólo en su worktree (`../<repo>-<n>`, rama `ghosty-dev/<n>-…`).
2. **Se revisa la evidencia, no el código.** Con el CI en verde, otro agente con contexto limpio revisa el PR
   (subagente `ghosty-dev-revisor`, o `ghosty-dev review <n>` en otra sesión); tú no te calificas. Con la revisión
   en 0 hallazgos abiertos: `ghosty-dev evidence <n> --file evidencia.md`
   (secciones «Qué se hizo», «Verificación» con comandos `$ …` y su salida real, «CI» con resultado y liga,
   «Preview», «Criterios de aceptación» marcados). El PR lleva `Closes #<n>`; sin revisión del commit actual y sin
   evidencia, el check `ghosty-dev/evidencia` no deja mergear. Nunca cierres un issue sin evidencia.
3. **Se espera por evento, no se sondea.** Con el PR abierto: `ghosty-dev wait <n> --watch` espera al CI en una sola llamada (tope 5 min); si tarda más, toma otro pendiente o termina.
   `ghosty-dev ready` te lo vuelve a ofrecer cuando el CI resuelva.

Un solo escritor por pendiente. Lo que la persona pida y lo que descubras va a un pendiente nuevo
(`ghosty-dev add "título" --goal … --criteria …`), y si te bloquea: `ghosty-dev block <n> --by <m>`. La persona (el Clerk) lee la evidencia y
decide el merge. Los identificadores van siempre en inglés (variables, funciones, llaves, archivos); en
español sólo comentarios, mensajes y nombres de pruebas. Especificación: `SPEC.md` del paquete ghosty-dev.
<!-- /ghosty-dev:agents -->
