const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /Ã³/g, to: "ó" },
    { from: /Ã©/g, to: "é" },
    { from: /Ã±/g, to: "ñ" },
    { from: /Ã¡/g, to: "á" },
    { from: /Ã­/g, to: "í" },
    { from: /Ãº/g, to: "ú" },
    { from: /Â©/g, to: "©" },
    { from: /â€”/g, to: "—" },
    { from: /Â·/g, to: "·" },
    { from: /Ã\x8D/g, to: "Í" },
    { from: /Ã\x93/g, to: "Ó" },
    { from: /Ã\x9A/g, to: "Ú" },
    { from: /Ã\x81/g, to: "Á" },
    { from: /Ã\x89/g, to: "É" },
    // Also fix the password placeholder in login.html as requested
    { from: /placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"/g, to: 'placeholder="Ingrese su contraseña"' },
    { from: /placeholder="••••••••"/g, to: 'placeholder="Ingrese su contraseña"' }
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
                console.log('Fixed double encoding in:', fullPath);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'src', 'app'));
