/**
 * Loads one of the real Jersey Universe frontend .js files and runs it
 * against the current jsdom `global` scope, exactly like a <script> tag
 * would in the browser. The original files are never modified.
 */
const fs = require("fs");
const path = require("path");

/**
 * Automatically locates the real jerseyuniverse_frontend/js folder by
 * searching upward from this file, and a couple of levels down at each
 * step. This means the test project can sit next to, inside, or a level
 * above/below your extracted jerseyuniverse folder — no fixed path to get
 * wrong.
 */
function findFrontendDir() {
  const MAX_UP = 6;
  const MAX_DOWN = 3;

  function looksRight(dir) {
    return fs.existsSync(path.join(dir, "main.js")) && fs.existsSync(path.join(dir, "storage.js"));
  }

  function searchDown(dir, depth) {
    if (depth < 0) return null;
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null;

    if (path.basename(dir) === "js" && looksRight(dir)) return dir;

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return null;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === "node_modules" || entry.name === ".git") continue;
      const found = searchDown(path.join(dir, entry.name), depth - 1);
      if (found) return found;
    }
    return null;
  }

  let cursor = __dirname;
  for (let i = 0; i < MAX_UP; i++) {
    const found = searchDown(cursor, MAX_DOWN);
    if (found) return found;
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }

  throw new Error(
    "Could not find your jerseyuniverse_frontend/js folder anywhere near " +
      __dirname +
      ". Make sure your unzipped jerseyuniverse project (containing jerseyuniverse_frontend/js/main.js) " +
      "is somewhere near this jerseyuniverse-tests folder — as a sibling, a parent, or inside it."
  );
}

const FRONTEND_DIR = findFrontendDir();

// Indirect eval always runs in the *global* scope of the current realm.
// Under jest-environment-jsdom that global scope is the jsdom `window`,
// so this behaves like a real browser <script> tag — top-level
// `function` declarations end up reachable as globals.
const indirectEval = eval;

function loadScript(filename) {
  const filePath = path.join(FRONTEND_DIR, filename);
  const code = fs.readFileSync(filePath, "utf8");

  // Top-level `function` declarations become real globals automatically
  // via indirect eval (matching how <script> tags behave in a browser).
  // Top-level `const`/`let`, however, only create a lexical binding that
  // isn't visible to *other* eval calls (i.e. other loaded files/tests).
  // We detect those top-level names (this in-memory string only — the
  // real file on disk is never touched) and tack on plain assignments
  // that copy them onto `window` inside the SAME eval call, where the
  // lexical binding is still reachable by name.
  const names = new Set();
  const topLevelDeclRe = /^(?:const|let)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = topLevelDeclRe.exec(code))) {
    names.add(m[1]);
  }
  const exposeLines = [...names].map((n) => `try { window.${n} = ${n}; } catch (e) {}`).join("\n");

  indirectEval(code + "\n" + exposeLines);
}

module.exports = { loadScript, FRONTEND_DIR };
