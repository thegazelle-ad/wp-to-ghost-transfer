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
});

const fs = require('fs');

knex.select('id', 'title', 'html', 'image', 'meta_description')
.from('posts')
.where('status', '=', 'published')
.then((rows) => {
  let startCnt = 0;
  let doneCnt = 0;
  rows.forEach((row, index) => {
    if (!row.meta_description && row.title !== 'Welcome to Ghost') {
      startCnt++;
      const regExp = /<p.*?>(.*?)<\/p>/mg;
      let matches = [];
      let currentMatch;
      while ((currentMatch = regExp.exec(row.html)) !== null) {
        matches.push(currentMatch[1]);
      }
      matches = matches.filter((match) => {
        return match.search(/<\/?img|<\/?iframe|\[\/?slideshow|\[\/?audio|\[\/?caption|\[\/?side-image|\[\/?embed|\[\/?big_image|\[\/?video|\[\/?bigimage|\[\/?blockquoteimage|\[\/?tooltip|\[\//) == -1;
      });
      matches = matches.map((match) => {
        return match.replace(/<.*?>|&nbsp;|\\/mg, '');
      });
      matches = matches.map((match) => {
        return match.replace(/\n/g, ' ');
      });
      matches = matches.map((match) => {
        return match.trim();
      });
      matches = matches.filter((match) => {
        return match !== '';
      })
      let teaser = matches.join(' ').substr(0, 152);
      // Make sure we didn't cut a word
      let match = teaser.match(/(.*)\s/)
      teaser = teaser.length === 152 ? (match === null ? null : match[1]) : teaser;
      if (!teaser) {
        teaser = null;
      }
      else {
        teaser = teaser+" ..."
      }
      // if (teaser && teaser.match(/\[.*?\]/g)) {
      //   console.log(teaser.match(/\[.*?\]/g));
      // }
      // console.log(teaser);
      // console.log('\n');

      knex('posts')
      .where('id', row.id)
      .update('meta_description', teaser)
      .then(() => {
        doneCnt++;
        if (doneCnt >= startCnt) {
          console.log("success");
          console.log(doneCnt, "updated");
          console.log("please wait for connection to close");
          knex.destroy();
        }
      });
    }
  });
})
