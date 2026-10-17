// Exportação sem dependências extras: node scripts/exportar-quatro.cjs PASTA_DESTINO
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const destination = process.argv[2];
if (!destination) throw new Error('Informe a pasta de destino.');
fs.mkdirSync(destination, { recursive: true });
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('index.html').replace(/^\s*<script src="(?:config|favoritos-api|favoritos-ui|time-ui)\.js"><\/script>\s*$/gm, '');
const script = ['config.js', 'favoritos-api.js', 'favoritos-ui.js', 'time-ui.js', 'script.js']
  .map(name => `// ===== Origem: ${name} =====\n${read(name)}`)
  .join('\n;\n');
fs.writeFileSync(path.join(destination, 'index.html'), html);
fs.writeFileSync(path.join(destination, 'script.js'), script.replaceAll('em config.js', 'no início de script.js'));
fs.copyFileSync(path.join(root, 'style.css'), path.join(destination, 'style.css'));
fs.copyFileSync(path.join(root, 'README.md'), path.join(destination, 'README.md'));
console.log('Exportados index.html, script.js, style.css e README.md.');
