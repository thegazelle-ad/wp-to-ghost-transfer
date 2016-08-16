'use strict';

let fs = require('fs');

exports.getConfig = () => {
  let data = fs.readFileSync(__dirname+'/../config.json');
  return JSON.parse(data);
}
