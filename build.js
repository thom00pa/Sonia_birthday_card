'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const OUT  = path.join(DIST, 'birthday.html');

const JS_ORDER = [
  'config.js',
  'scripts/i18n.js',
  'scripts/animations.js',
  'scripts/sections.js',
  'scripts/app.js'
];

// CSS compression is safe — it has no ASI or token-spacing rules
function compressCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*([{};:,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

console.log('\n📦  Building...\n');
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// ── Inline CSS (compressed) ───────────────────────────────────────────────
html = html.replace(
  /<link\s[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
  (_, href) => {
    const file = path.join(ROOT, href);
    if (!fs.existsSync(file)) {
      console.error('  ❌  Missing file:', href);
      process.exit(1);
    }
    const compressed = compressCSS(fs.readFileSync(file, 'utf8'));
    const kb = (compressed.length / 1024).toFixed(1);
    console.log(`  ✅  CSS  ${href}  →  ${kb} kb`);
    return `<style>${compressed}</style>`;
  }
);

// ── Inline JS exactly as-is — never modify JavaScript source ─────────────
// Modifying JS whitespace breaks token boundaries, ASI, and template literals.
JS_ORDER.forEach(rel => {
  const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `<script[^>]+src=["']${escaped}["'][^>]*>\\s*</script>`, 'i'
  );
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    console.error('  ❌  Missing file:', rel);
    process.exit(1);
  }
  const source = fs.readFileSync(file, 'utf8');
  const kb = (source.length / 1024).toFixed(1);
  html = html.replace(pattern, `<script>\n${source}\n</script>`);
  console.log(`  ✅  JS   ${rel}  →  ${kb} kb`);
});

// ── Remove only HTML comments from the template skeleton ─────────────────
// Safe: only affects the structural HTML, not content inside script/style tags.
html = html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');

// ── Write output ─────────────────────────────────────────────────────────
fs.writeFileSync(OUT, html, 'utf8');
const totalKb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`\n🎉  Done  →  dist/birthday.html  (${totalKb} kb total)\n`);
