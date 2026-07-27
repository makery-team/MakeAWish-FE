const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('components')];
let changed = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Removes lines like: fontWeight: '700', or fontWeight: "bold"
  const newContent = content.replace(/fontWeight:\s*['"][a-zA-Z0-9]+['"],?\s*/g, '');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    changed++;
  }
});

console.log(`Removed fontWeight from ${changed} files.`);
