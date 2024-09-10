#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to count lines in a file
function countLinesInFile(filePath) {
  return new Promise((resolve, reject) => {
    let lineCount = 0;
    fs.createReadStream(filePath)
      .on('data', (buffer) => {
        for (let i = 0; i < buffer.length; ++i) {
          if (buffer[i] === 10) lineCount++; // newline char code is 10
        }
      })
      .on('end', () => resolve(lineCount))
      .on('error', reject);
  });
}

// Function to recursively list files in a directory
async function listFilesRecursively(dirPath, skipExtensions) {
  let filesList = [];
  const files = await fs.promises.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await fs.promises.stat(filePath);

    if (stats.isDirectory()) {
      filesList = filesList.concat(await listFilesRecursively(filePath, skipExtensions));
    } else if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (!skipExtensions[ext]) {
        filesList.push(filePath);
      }
    }
  }

  return filesList;
}

// Function to list files in a directory in descending order of line numbers
async function listFilesByLineCount(dirPath, skipExtensions, maxFiles) {
  try {
    const files = await listFilesRecursively(dirPath, skipExtensions);
    const fileStatsPromises = files.map(async (file) => {
      const lineCount = await countLinesInFile(file);
      return { file, lineCount };
    });

    const fileStats = (await Promise.all(fileStatsPromises)).filter(Boolean);
    fileStats.sort((a, b) => b.lineCount - a.lineCount); // Sort in descending order

    fileStats.slice(0, maxFiles).forEach(({ file, lineCount }) => {
      console.log(`${lineCount}: ${path.relative(dirPath, file)}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

// Get directory path and skip parameters from command line arguments
const dirPath = process.argv[2];
const skipExtensions = [];
let maxFiles = 1000;

process.argv.forEach((arg, index) => {
  switch (arg) {
    case '-s': // Skip files with certain extensions
    case '-skip': {
      const extensions = process.argv[index + 1].split(',').map(ext => ext.trim().toLowerCase());
      extensions.forEach(ex => {
        skipExtensions[ex] = true;
      });
      break;
    }
    case '-m':
    case '-max': {
      try {
        maxFiles = Number(process.argv[index + 1]);
        if (Number.isNaN(maxFiles)) {
          throw new Error('Invalid max files parameter');
        }
      } catch (err) {
        throw new Error('Invalid max files parameter', e);
      }
      break;
    }
    default: {
      break;
    }
  }
});

if (!dirPath) {
  console.error('Please provide a directory path as a parameter.');
  process.exit(1);
}

listFilesByLineCount(dirPath, skipExtensions, maxFiles);
