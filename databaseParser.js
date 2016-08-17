'use strict';

const queryBuilder = require('knex')({
  client: 'mysql',
  connection: {
    host: "localhost",
    user: "root",
    password: "",
    database: "gazelle_old"
  }
});

const terms = 'wp_terms';
const title = 'post_title';
const name = 'name'
const taxonomy = 'wp_term_taxonomy';
const termId = 'term_id';
const taxonomyId = 'term_taxonomy_id';
const relationships = 'wp_term_relationships';
const posts = 'wp_posts';
const objectId = 'object_id';
const postId = "ID";
const tax = "taxonomy"

function postToWordpressTermQuery(wpTerm, maxRows) {
  return queryBuilder
    .select(title, name)
    .from(terms)
      .innerJoin(taxonomy, terms+'.'+termId, '=', taxonomy+'.'+taxonomyId)
      .innerJoin(relationships, terms+'.'+termId, '=', relationships+'.'+taxonomyId)
      .innerJoin(posts, posts+'.'+postId, '=', relationships+'.'+objectId)
    .where(taxonomy+'.'+tax, '=', wpTerm)
  .then((rows) => {
    console.log(wpTerm + " is coming");
    console.log(rows.slice(0, maxRows));
    return;
  })
  .catch((err) => {
    throw err;
  });
}

function disconnect() {
  queryBuilder.destroy();
}

postToWordpressTermQuery('category', 4)
  .then(postToWordpressTermQuery('author', 4))
  .then(postToWordpressTermQuery('issue', 4))
  .then(postToWordpressTermQuery('nav_menu', 4))
  .then(postToWordpressTermQuery('post_format', 4))
  .then(postToWordpressTermQuery('post_tag', 4))
  .then(disconnect());