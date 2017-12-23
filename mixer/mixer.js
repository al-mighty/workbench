const fs = require('fs');
const path = require('path');

const listFiles = [];

const sourceFolder = path.resolve(process.argv[2]);
const resultFolder = path.resolve(process.argv[3]);
console.log("SourceFolder = ", sourceFolder, ' будет удалена');
console.log("ResultFOlder = ", resultFolder);

const readContents = (currentFolder, onFileRead) => (err, files) => {
  scanError(err);

  console.log('files');
  console.log(files);
  console.log(files.length);
};

const scanFolder = (sourceFolder, isReadFile) => {
  fs.readdir(sourceFolder, readContents(sourceFolder, isReadFile));
};

const scanError = (err) => {
  if (err) {
    console.log(' =((( ', err.message)
  }
};

const handleFileRead = (path, file) => listFiles.push({path, file});
// scanFolder(sourceFolder,scanError(err));
scanFolder(sourceFolder, handleFileRead);