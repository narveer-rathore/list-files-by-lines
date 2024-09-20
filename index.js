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
async function listFilesRecursively(dirPath, skipExtensions, excludePatterns) {
  let filesList = [];
  const files = await fs.promises.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await fs.promises.stat(filePath);

    if (stats.isDirectory()) {
      filesList = filesList.concat(await listFilesRecursively(filePath, skipExtensions, excludePatterns));
    } else if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (!skipExtensions[ext] && !excludePatterns.some(pattern => file.includes(pattern))) {
        filesList.push(filePath);
      }
    }
  }

  return filesList;
}

// Function to list files in a directory in descending order of line numbers
async function listFilesByLineCount(dirPath, skipExtensions, excludePatterns, maxFiles) {
  try {
    const files = await listFilesRecursively(dirPath, skipExtensions, excludePatterns);
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
let dirPath = process.argv[2] || '.'; // Default to current directory if not provided
const skipExtensions = [];
const excludePatterns = [];
let maxFiles = 1000;

process.argv.forEach((arg, index) => {
  switch (arg) {
    case '-d': // Directory option
    case '--directory': {
      dirPath = process.argv[index + 1];
      break;
    }
    case '-e': // Exclude option
    case '--exclude': {
      const patterns = process.argv[index + 1].split(',').map(pattern => pattern.trim());
      excludePatterns.push(...patterns);
      break;
    }
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
        console.error('Invalid max files parameter', err);
        process.exit(1);
      }
      break;
    }
    default: {
      break;
    }
  }
});

listFilesByLineCount(dirPath, skipExtensions, excludePatterns, maxFiles);
