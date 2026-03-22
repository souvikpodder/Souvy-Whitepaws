const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Program Files (x86)/Steam/steamapps/workshop/content/1062090/3647584961/Buildings';
const destDir = 'c:/Users/souvi/Documents/Timberborn/Mods/Souvy-Whitepaws/version-1.0.0/Buildings';

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = walk(srcDir);
let copiedCount = 0;

for (const file of files) {
  if (!file.endsWith('.json')) continue;
  
  // Skip housing
  if (file.includes('\\Housing\\') || file.includes('/Housing/')) {
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('"DwellingSpec"')) {
    continue;
  }

  try {
    // Strip comments to allow loose parsing
    const stripped = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    const data = new Function('return ' + stripped)();

    if (data.DwellingSpec) {
      const outData = {
        DwellingSpec: {
          MaxBeavers: 1
        }
      };
      
      const relPath = path.relative(srcDir, file);
      const destPath = path.join(destDir, relPath);
      
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, JSON.stringify(outData, null, 2), 'utf8');
      console.log('Copied and modified: ' + relPath);
      copiedCount++;
    }
  } catch (e) {
    console.error('Failed to parse: ' + file);
    console.error(e.message);
  }
}

console.log('Total files copied: ' + copiedCount);
