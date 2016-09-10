var fs = require('fs');

var data = JSON.stringify(JSON.parse(fs.readFileSync('wordPressTagsOut.json')), null, 4);

fs.writeFileSync('dataForZane.json', data);
