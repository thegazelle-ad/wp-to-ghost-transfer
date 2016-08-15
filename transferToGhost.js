'use strict';

// file system
let fs = require('fs');

// Database variables

const DATABASE_HOST = "localhost";
const DATABASE_USER_NAME = "root";
const DATABASE_PASSWORD = "";
const WORDPRESS_DATABASE_NAME = "gazelle_old";
const GHOST_DATABASE_NAME = "ghost_copy";

// Wordpress boilerplate

const wordpressQueryBuilder = require('knex')({
  // Using MariaDB
  client: 'mysql',
  connection: {
    host: DATABASE_HOST,
    user: DATABASE_USER_NAME,
    password: DATABASE_PASSWORD,
    database: WORDPRESS_DATABASE_NAME
  }
});

const wp_terms = 'wp_terms';
const wp_title = 'post_title';
const wp_name = 'name'
const wp_taxonomy = 'wp_term_taxonomy';
const wp_termId = 'term_id';
const wp_taxonomyId = 'term_taxonomy_id';
const wp_relationships = 'wp_term_relationships';
const wp_posts = 'wp_posts';
const wp_objectId = 'object_id';
const wp_postId = "ID";
const taxonomy = 'taxonomy';

function postToWordpressTermQuery(queryTerm) {
  return wordpressQueryBuilder
    .select(wp_title, wp_name)
    .from(wp_terms)
      .innerJoin(wp_taxonomy, wp_terms+'.'+wp_termId, '=', wp_taxonomy+'.'+wp_taxonomyId)
      .innerJoin(wp_relationships, wp_terms+'.'+wp_termId, '=', wp_relationships+'.'+wp_taxonomyId)
      .innerJoin(wp_posts, wp_posts+'.'+wp_postId, '=', wp_relationships+'.'+wp_objectId)
    .where(wp_taxonomy+'.'+taxonomy, '=', queryTerm)
}

function disconnectWordpress() {
  wordpressQueryBuilder.destroy();
}

// Ghost boilerplate

const ghostQueryBuilder = require('knex')({
  // Using MariaDB
  client: 'mysql',
  connection: {
    host: DATABASE_HOST,
    user: DATABASE_USER_NAME,
    password: DATABASE_PASSWORD,
    database: GHOST_DATABASE_NAME
  }
});

function disconnectGhost() {
  ghostQueryBuilder.destroy();
}

// data export code
function getWpTerm(termSlug, fileName) {
  // Count how many functions have to finish
  functionCount++;

  wordpressQueryBuilder
  .distinct().select('slug')
  .from(wp_terms)
    .innerJoin(wp_taxonomy, wp_terms+'.'+wp_termId, '=', wp_taxonomy+'.'+wp_taxonomyId)
  .where(wp_taxonomy+'.'+taxonomy, '=', termSlug)
  .then((rows) => {
    const slugs = rows.map((row) => {
      return row.slug;
    })
    wordpressQueryBuilder
    .select('name', 'slug')
    .from(wp_terms)
      .innerJoin(wp_taxonomy, wp_terms+'.'+wp_termId, '=', wp_taxonomy+'.'+wp_taxonomyId)
    .whereIn('slug', slugs).andWhere(wp_taxonomy+'.'+taxonomy, '=', termSlug)
    .then((rows) => {
      fs.writeFileSync('jsonData/' + fileName + '.json', JSON.stringify(rows, null, 4));
      disconnectIfDone();
    });
  });
}

function disconnectIfDone() {
  cnt++;
  if (cnt >= functionCount) {
    disconnectWordpress();
    disconnectGhost();
  }
}

// counts how many queries are done
let functionCount = 0;
let cnt = 0;
// export actually happens here
getWpTerm('category', 'categories');

getWpTerm('author', 'authors');

getWpTerm('issue', 'issues');

getWpTerm('nav_menu', 'nav_menues');

getWpTerm('post_format', 'post_formats');

getWpTerm('post_tag', 'post_tags');
