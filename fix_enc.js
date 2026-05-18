const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /Gestin/g, to: "Gestión" },
    { from: /estratǸgicos/g, to: "estratégicos" },
    { from: / 2026 Xplora \?" Curso Integrador II  Grupo 1  UTP Ate/g, to: "© 2026 Vayra — Curso Integrador II · Grupo 1 · UTP Ate" },
    { from: /sesin/g, to: "sesión" },
    { from: /electrnico/g, to: "electrónico" },
    { from: /Contrasea/g, to: "Contraseña" },
    { from: /Mdulo/g, to: "Módulo" },
    { from: /Validacin/g, to: "Validación" },
    { from: /Correccin/g, to: "Corrección" },
    { from: /Informacin/g, to: "Información" },
    { from: /Bsqueda/g, to: "Búsqueda" },
    { from: /Lcteos/g, to: "Lácteos" },
    { from: /Da/g, to: "Día" },
    { from: /Accin/g, to: "Acción" },
    { from: /Configuracin/g, to: "Configuración" },
    { from: /Exhibicin/g, to: "Exhibición" },
    { from: /Promocin/g, to: "Promoción" },
    { from: /Aadir/g, to: "Añadir" },
    { from: /Ao/g, to: "Año" },
    { from: /ltimo/g, to: "Último" },
    { from: /Cdigo/g, to: "Código" },
    { from: /Catlogo/g, to: "Catálogo" },
    { from: /Cmara/g, to: "Cámara" },
    { from: /Fotografa/g, to: "Fotografía" },
    { from: /Aqu/g, to: "Aquí" },
    { from: /S/g, to: "Sí" },
    { from: /Men/g, to: "Menú" },
    { from: /Pgina/g, to: "Página" },
    { from: /Inicio/g, to: "Inicio" }, // Just a safety, not corrupted usually
    { from: /Categora/g, to: "Categoría" },
    { from: /Gndola/g, to: "Góndola" },
    { from: /Rpida/g, to: "Rápida" },
    { from: /Nestl/g, to: "Nestlé" },
    { from: /Da/g, to: "Día" },
    { from: /Atrs/g, to: "Atrás" },
    { from: /Ests/g, to: "Estás" },
    { from: /Segn/g, to: "Según" },
    { from: /Nescaf/g, to: "Nescafé" },
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            for (const r of replacements) {
                if (r.from.test(content)) {
                    content = content.replace(r.from, r.to);
                    modified = true;
                }
            }
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed:', fullPath);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'src', 'app'));
