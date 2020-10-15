try {
  process.env.PRODUCTION = false;
  require('babel-register');
} catch (err) {
  process.env.PRODUCTION = true;
}

if (process.env.PRODUCTION === false) {
  require('electron-reload')('../../', {
    electron: require(`../../../../node_modules/electron`)
  });
}

require('./main.js');