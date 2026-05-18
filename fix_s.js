const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Sí')) {
                // Let's replace 'Sí' with 'S' but be careful.
                // Since I literally ran /S/g earlier, every single uppercase S became Sí.
                // So I just need to replace /Sí/g with S.
                content = content.replace(/Sí/g, 'S');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Restored S in:', fullPath);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'src', 'app'));
