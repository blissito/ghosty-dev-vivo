// Puerta de evidencia del PR (Ley 2 + «proof of work» antes del merge, OpenAI Symphony).
// La corre la Action `ghosty-dev/evidencia`: falla si algún pendiente que el PR cierra no tiene
// un comentario de evidencia válido. Autocontenido: `ghosty-dev init` lo copia a .github/ghosty-dev/.
import { execFileSync } from 'node:child_process';
import { readFileSync, appendFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { findValidEvidence, findRevisionFor } from './evidence.mjs';

const CLOSING = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/gi;

export function closingRefs(body = '') {
  return [...new Set([...body.matchAll(CLOSING)].map((m) => Number(m[1])))];
}

// Puro: recibe el PR y una función que trae cada issue ({ body, comments }).
export function evaluatePullRequest(pr, fetchIssue) {
  const refs = closingRefs(pr.body || '');
  if (refs.length === 0) {
    return { ok: false, lines: ['El PR no cierra ningún pendiente: agrega «Closes #n» a la descripción.'] };
  }
  const sha = pr.head?.sha || '';
  const short = sha.slice(0, 7);
  const lines = [];
  let ok = true;
  for (const n of refs) {
    const issue = fetchIssue(n);
    // Revisión: otro agente con contexto limpio, del commit exacto que se va a mergear.
    const rev = findRevisionFor(issue.comments, sha);
    if (!rev) {
      ok = false;
      lines.push(`#${n}: falta la revisión del commit ${short} (ghosty-dev review ${n}).`);
    } else if (rev.open > 0) {
      ok = false;
      lines.push(`#${n}: la revisión del commit ${short} tiene ${rev.open} hallazgo(s) abierto(s).`);
    } else {
      lines.push(`#${n}: revisión del commit ${short} sin hallazgos abiertos.`);
    }
    if (findValidEvidence(issue.comments, issue.body)) {
      lines.push(`#${n}: evidencia válida.`);
    } else {
      ok = false;
      lines.push(`#${n}: sin comentario de evidencia válido (ghosty-dev evidence ${n} --file evidencia.md).`);
    }
  }
  return { ok, lines };
}

function main() {
  const gh = process.env.GHOSTY_DEV_GH || 'gh';
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const pr = event.pull_request;
  const fetchIssue = (n) =>
    JSON.parse(execFileSync(gh, ['issue', 'view', String(n), '--json', 'body,comments'], { encoding: 'utf8' }));
  const { ok, lines } = evaluatePullRequest(pr, fetchIssue);
  const report = lines.map((l) => `- ${l}`).join('\n');
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### ghosty-dev/evidencia\n${report}\n`);
  process.exit(ok ? 0 : 1);
}

// Corre sólo como script (no al importarlo en los tests); realpath por los symlinks de /tmp en macOS.
const invokedPath = process.argv[1] ? realpathSync(process.argv[1]) : '';
if (import.meta.url === pathToFileURL(invokedPath).href) main();
