const fs = require('fs');
const path = require('path');

const directoryPath = './'; // Change this to your source folder
const outputPath = 'combined_output.txt';

function readDirectoryFiles(dirPath, delimiter) {
  let result = '';

  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      result += readDirectoryFiles(filePath, delimiter);
    } else if (stat.isFile() && path.extname(file) === '.js') {
      result += `----- BEGIN FILE: ${filePath} -----\n`;
      result += fs.readFileSync(filePath, 'utf8');
      result += `\n----- END FILE: ${filePath} -----\n${delimiter}\n`;
    }
  });

  return result;
}

const combinedFiles = readDirectoryFiles(directoryPath, '\n\n// DELIMITER\n\n');
fs.writeFileSync(outputPath, combinedFiles);
console.log(`All files combined into ${outputPath}`);