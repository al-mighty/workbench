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
  console.log('createFullDir ?! = ', paths[0])
  const folderPath = paths[0];
  console.log('folderPath ?! = ', folderPath)
  // console.log("PathS = ");
  // console.log(paths);
  // console.log('endedOperation = ');
  // console.log(endedOperation);
  paths.splice(0, 1);
  // console.log("PathS = ");
  // console.log(paths);

  if (!fs.existsSync(folderPath)) {
    // console.log('folderPath для mkdir - =');
    // console.log(folderPath);
    // console.log("в мкдир отправляю");
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
  console.log('ENDDD');
  console.log(listFiles);
  listFiles.forEach(item => {
    const char = item.filename.charAt(0).toUpperCase();
    const fullPath = path.join(resultFolder, char, item.filename);
    console.log('thirt param');
    console.log(resultFolder);
    console.log(char);
    console.log(item.filename);

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
    console.log('counterFilessssssss =', counterFiles);

    if (!--counterFiles) {
      endedOperation()
    }
  }
};

//readData
const readContents = (currentFolder, onFilePushed, endedOperation) => (err, files) => {
  scanError(err);

  console.log('files');
  console.log(files);
  console.log(counterFiles);
  counterFiles += files.length;
  console.log(counterFiles)
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