'use strict';

const knex = require('knex')({
  client: 'mysql',
  connection: {
    // The host where the MariaDB is located
    "host": "127.0.0.1",
    // The username to login to the DB with
    "user": "root",
    // The password for the given user
    "password": "password",
    // The name of The Gazelle's database in the MariaDB
    "database": "the_gazelle",
    "charset": 'latin1'
  },
  pool: {
    max: 2000,
    min: 0
  }
});

knex.select('id', 'title', 'html', 'image')
.from('posts')
.where('status', '=', 'published')
.then((rows) => {
  let startCnt = 0;
  let doneCnt = 0;
  rows.forEach((row, index) => {
    if (!row.image && row.title !== 'Welcome to Ghost') {
      startCnt++;
      const regExp = /<img.*?src=['"].*?(https?:\/\/.*?)['"]\s/m;
      let match = row.html.match(regExp);
      if (match) {
        match = match[1];
      }
      if (match) {
        if (match.search(/thegazelle.s3/) !== -1) {
          match = match.replace(/http:\/\/|https:\/\//, "https://");
        }
      }
      knex('posts')
      .where('id', row.id)
      .update('image', match)
      .then(() => {
        doneCnt++;
        if (doneCnt >= startCnt) {
          console.log("success");
          console.log(doneCnt, "updates");
          console.log("please wait for the connection to close");
          knex.destroy();
        }
      });
    }
  });
})
