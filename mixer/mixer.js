const fs = require('fs');
const path = require('path');

const listFiles = [];
let counterFiles = 0;

const sourceFolder = path.resolve(process.argv[2]);
const resultFolder = path.resolve(process.argv[3]);
const deleteFolder = process.argv[4] === '-delete';

console.log("SourceFolder = ", sourceFolder, ' будет удалена');
console.log("ResultFOlder = ", resultFolder);

const handleFilePushed = (fullPathFile, filename) => {
  listFiles.push({fullPathFile, filename});
  console.log('listFiles', listFiles)
};

const handleMkDir = (paths, folderPath, endedOperation) =>
  (err) => {
    scanError(err);

    if (paths.length > 0) {
      paths[0] = path.join(folderPath, paths[0]);
      createFullDir(paths, endedOperation);
    } else {
      endedOperation();
    }
  };


const handleStat = (folder) =>
  (err, state) => {
    scanError(err);

    if (state && state.isDirectory()) {
      deleteSourceFiles(folder);
      counterFiles--;
    } else {
      fs.unlink(folder, scanError);
      if (!--counterFiles) {
        if (fs.existsSync(folder)) {
          fs.rmdir(folder, (err) => scanError);
        }
      }
    }
  };

const deleteFolderAction = (folder) => (err,listFiles)=>{
  scanError(err);
  counterFiles+=listFiles.length;
  if(!counterFiles){
    if (fs.existsSync(folder)) {
      fs.rmdir(folder, (err) => scanError);
    }
  }
  listFiles.forEach(file => {
    const localPath = path.join(folder, file);

    fs.stat(localPath, handleStat(localPath))
  })
};


const deleteSourceFiles = (folder) => {
  if (fs.existsSync(folder)) {
    fs.readdir(folder, deleteFolderAction(folder));
  }
};

const createFullDir = (paths, endedOperation) => {
  const folderPath = paths[0]
  paths.splice(0, 1);

  if (!fs.existsSync(folderPath)) {
    fs.mkdir(folderPath, handleMkDir(paths, folderPath, endedOperation));
  } else if (paths.length > 0) {
    paths[0] = path.join(folderPath, paths[0]);
    createFullDir(paths, endedOperation);
  } else {
    endedOperation();
  }
};

const removeFolder = (err) => {
  scanError(err);

  if (deleteFolder) {
    deleteSourceFiles(sourceFolder);
  }
};


const handleDirCreated = (sourceFolder, resultFolder) => () => fs.copyFile(sourceFolder, resultFolder, removeFolder);

const endedOperation = () => {
  listFiles.forEach(item => {
    const char = item.filename.charAt(0).toUpperCase();
    const fullPath = path.join(resultFolder, char, item.filename);
    createFullDir([resultFolder, char], handleDirCreated(item.fullPathFile, fullPath));
  });
};

//readFile
const readFileOrFolder = (fullPathFile, filename, addFileInList, endedOperation) => (err, state) => {
  scanError(err);
  if (state.isDirectory()) {
    scanFolder(fullPathFile, handleFilePushed, endedOperation);
    --counterFiles;
  } else if (addFileInList) {
    addFileInList(fullPathFile, filename);

    if (!--counterFiles) {
      endedOperation()
    }
  }
};

//readData
const readContents = (currentFolder, onFilePushed, endedOperation) => (err, files) => {
  scanError(err);
  counterFiles += files.length;
  if (!counterFiles) {
    endedOperation();
  }


  files.forEach(filename => {
    const fullPathFile = path.join(currentFolder, filename);
    console.log('pathFile= ', fullPathFile);
    // console.log('current file = ', filename);
    fs.stat(fullPathFile, readFileOrFolder(fullPathFile, filename, onFilePushed, endedOperation))
  })
};

const scanFolder = (sourceFolder, isReadFile, endedOperation) => {
  // if (fs.existsSync(sourceFolder))
  fs.readdir(sourceFolder, readContents(sourceFolder, isReadFile, endedOperation));

};

const scanError = (err) => {
  if (err) {
    console.log(' =((( ', err.message)
  }
};


// scanFolder(sourceFolder,scanError(err));
scanFolder(sourceFolder, handleFilePushed, endedOperation);