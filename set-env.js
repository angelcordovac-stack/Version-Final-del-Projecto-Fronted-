// set-env.js
// Lee las variables de entorno (desde .env o variables del sistema como Netlify)
// y genera src/app/environments/environment.ts antes del build.

const fs = require('fs');
const path = require('path');

require('dotenv').config();

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

const environmentContent = `// Este archivo es generado automáticamente por set-env.js — no editar manualmente.
export const environment = {
  production: true,
  url: '${backendUrl}',
};
`;

const targetPath = path.join(__dirname, 'src', 'app', 'environments', 'environment.ts');

fs.writeFileSync(targetPath, environmentContent, { encoding: 'utf8' });

console.log(`✅ environment.ts generado correctamente`);
console.log(`   BACKEND_URL: ${backendUrl || '(vacío — configúralo en Netlify)'}`);
