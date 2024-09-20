# list-files-by-lines

A utility to sort files by the number of lines they contain. Useful for traversing through larger codebases and refactoring.

## Installation

Install globally using npm:

`npm install -g list-files-by-lines`


## Usage

Run the command in your project directory:

list-files-by-lines [options]


### Options

- `-d, --directory <path>`: Specify the directory to scan (default: current directory)
- `-e, --exclude <pattern>`: Exclude files/directories matching the pattern (can be used multiple times)
- `-m, --min-lines <number>`: Show only files with at least this many lines
- `-s, --sort <asc|desc>`: Sort order (default: desc)

## Examples

1. List all files in the current directory, sorted by line count (descending):
   ```bash
   list-files-by-lines
   ```

2. Scan a specific directory:
   ```bash
   list-files-by-lines -d /path/to/project
   ```

3. Exclude node_modules and test files:
   ```bash
   list-files-by-lines -e node_modules -e *.test.js
   ```

4. Show only files with at least 100 lines:
   ```bash
   list-files-by-lines -m 100
   ```

5. Sort in ascending order:
   ```bash
   list-files-by-lines -s asc
   ```

## License

ISC

## Author

Narveer Rathore [@narveer-rathore](https://github.com/narveer-rathore)
