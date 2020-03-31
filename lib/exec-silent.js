const { exec } = require('shelljs');

function execSilent(code) {
  return new Promise((resolve, reject) => {
    exec(code, { silent: true }, (code, stdout, stderr) => {
      if (+code === 0) {
        resolve(stdout);
      } else if (stderr) {
        reject(new Error(stdout));
      }
    });
  });
}

module.exports = execSilent;
