'use strict';

const fs = require('fs')

let json = require('./posts.js')
fs.writeFileSync('posts.js', JSON.stringify(json), 'utf8');
