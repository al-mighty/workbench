const fs = require('fs');
const path = require('path');


const sourceFolder = path.resolve(process.argv[2]);
// const deleteFolder = process.argv[3] === '-delete';
const resultFolder = path.resolve(process.argv[3]);

const copyFile = (fileName, name, nPath) => {
  fs.copyFileSync(fileName, nPath + "/" + name);
  // if (deleteFolder) delFile("./" + fileName);
};

const readDir = (base, level) => {
  const files = fs.readdirSync(base);
  files.forEach(item => {
    let localBase = path.join(base, item);
    let state = fs.statSync(localBase);
    if (state.isDirectory()) {
      console.log(' '.repeat(level) + 'Dir: ' + item);
      readDir(localBase, level + 1);
    } else {
      console.log(' '.repeat(level) + 'File: ' + item);
      let nDir = resultFolder + "/" + item.charAt(0);
      console.log('item = ', item + '        ------- ndir = ', nDir);
      console.log('localBase= ', localBase);
      makeNewDir(localBase, item, nDir);
    }
  });
};

function makeNewDir(localBase, item, nDir) {
  fs.mkdir(nDir, function (err) {
    if (!err || (err && err.code === 'EEXIST')) {
      console.log("Directory created successfully!");
      copyFile(localBase, item, nDir);
    } else if (err) {
      return console.error(err);
    }
    console.log("Directory created successfully!");
    copyFile(localBase, item, nDir);
  });
}

// function delFile(nameFile) {
//   console.log("Going to delete an existing file");
//   fs.unlink(nameFile, function (err) {
//     if (err) {
//       return console.error(err);
//     }
//     console.log("File deleted successfully!");
//   });
// }

function createResultFolder(resultFolder) {
  return new Promise((res, rej) => {
    if (fs.existsSync(resultFolder)) {
      res();
    } else {
      fs.mkdir(resultFolder, function (err) {
        if (err) return rej(err);
      });
      res();
    }
  })
}
createResultFolder(resultFolder).then(function () {
    return new Promise((res, rej) => {
      try {
        res(readDir(sourceFolder, 0));
      } catch (err) {
        rej(err);
      }
    })
  }
);