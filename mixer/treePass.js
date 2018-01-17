const scanError = require('./scanError');
const path = require('path');
const fs = require('fs');

const treePass = (folder,files, res, rej) => {
  return new Promise(function (res, rej) {
    console.log(files);
    // res(files);
    files.forEach(item => {
      let filePath = path.join(folder, item);
      fs.stat(filePath, (err, stats) => {
        scanError(err);
        console.log('!!!!filePath');
        // console.log(stats);
        res({filePath,stats})
      });
    });

  })
};

if (module.parent) {
  module.exports = treePass
}