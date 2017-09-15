'use strict';

function disconnect() {
	knex.destroy();
}

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: "localhost",
    user: "root",
    password: "password",
    database: "the_gazelle",
    charset: 'latin1'
  }
});

const fs = require('fs');
const articleSlug = process.argv[2];
const htmlFile = process.argv[3];
const html = fs.readFileSync(htmlFile, 'utf8');
knex.select('id').from('posts').where('slug', '=', articleSlug)
.then((rows) => {
  if (rows.length < 1) {
    console.log("No article was found with that slug");
    return;
  }
  const articleId = rows[0].id;
  return knex('interactive_meta').insert({ id: articleId, html })
    .then(() => knex('posts_meta').where('id', '=', articleId).update({ is_interactive: true }))
})
.then(() => {
  console.log("success");
})
.catch((err) => {
  throw err;
})
.then(disconnect);
