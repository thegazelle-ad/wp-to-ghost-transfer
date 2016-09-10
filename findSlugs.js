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

const fs = require('fs');

const dict = JSON.parse(fs.readFileSync('wordPressTagsOut.json', 'utf8'));

const _ = require('lodash');

const newDict = {};

const max = Object.keys(dict).length;
let cnt = 0;

_.forEach(dict, (value, key) => {
  console.log(key);
  knex.select('posts.slug as post_slug', 'categories.slug as cat_slug', 'issues.name')
  .from('posts')
  .innerJoin('posts_meta', 'posts.id', '=', 'posts_meta.id')
  .innerJoin('categories', 'posts_meta.category_id', '=', 'categories.id')
  .innerJoin('issues_posts_order', 'posts.id', '=', 'post_id')
  .innerJoin('issues', 'issues.id' ,'=', 'issue_id')
  .where('posts.slug', '=', dict[key].post_slug)
  .then((rows) => {
    const row = rows[0];
    newDict[key] = {post_slug: row.post_slug, cat_slug: row.cat_slug, issue: row.name};
    console.log(++cnt, max);
    if (cnt === max) {
      fs.writeFileSync('wordPressTagsOut.json', JSON.stringify(newDict));
      console.log(newDict);
    }
  })
});


