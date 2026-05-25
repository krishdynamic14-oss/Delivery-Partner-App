const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function patchFile(relativePath, patcher) {
  const filePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(filePath)) return;

  const before = fs.readFileSync(filePath, 'utf8');
  const after = patcher(before);
  if (after !== before) {
    fs.writeFileSync(filePath, after);
    console.log(`Patched ${relativePath}`);
  }
}

patchFile('node_modules/expo-modules-core/android/CMakeLists.txt', (content) =>
  content.replace(
    /(\n\s*android\n)(\s*\$\{JSEXECUTOR_LIB\})/g,
    (match, androidLine, nextLine) => {
      if (match.includes('c++_shared')) return match;
      return `${androidLine}  c++_shared\n${nextLine}`;
    },
  ),
);

patchFile('node_modules/react-native-screens/android/CMakeLists.txt', (content) =>
  content.replace(
    /(\n\s*android\n)(?!\s*c\+\+_shared)/g,
    (androidLine) => `${androidLine}            c++_shared\n`,
  ),
);
