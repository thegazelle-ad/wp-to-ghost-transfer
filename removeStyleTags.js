'use strict';

var database = require('knex')({
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
    // which character encoding to use - keep this as latin1
    "charset": "latin1"
  },
  pool: {
    min: 10,
    max: 500,
  }
});

var _ = require('lodash');

database.select('html', 'posts.slug as post_slug', 'authors.slug as author_slug').
from('posts')
.innerJoin('authors_posts', 'posts.id', '=', 'post_id')
.innerJoin('authors', 'authors.id', '=', 'authors_posts.author_id')
.then((rows) => {
  const changeArray = [];
  rows.forEach((row) => {
    const { html, author_slug, post_slug } = row;
    if (/video/g.test(author_slug)) {
      let newHtml = html;
      let start = newHtml.indexOf('<style');
      let end = newHtml.indexOf('</style>', start);
      while (start !== -1 && end !== -1) {
        newHtml = newHtml.substring(0, start) + newHtml.substring(end+8);
        start = newHtml.indexOf('<style');
        end = newHtml.indexOf('</style>', start);
      }
      if (newHtml !== html) {
        changeArray.push({
          slug: post_slug,
          update: {
            html: newHtml,
          },
        });
      }
    }
  });
  const toBeUpdated = changeArray.length;
  if (toBeUpdated === 0) {
    console.log("Nothing to be updated");
    database.destroy();
  }
  let updatesFinished = 0;
  changeArray.forEach((change) => {
    database('posts').where('slug', '=', change.slug)
    .update(change.update).then(() => {
      updatesFinished++;
      if (updatesFinished >= toBeUpdated) {
        console.log("Success");
        database.destroy();
      }
    });
  });
});

