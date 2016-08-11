'use strict';

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

// Transfer starts here

// Fill up categories table
wordpressQueryBuilder
.distinct().select('slug')
.from(wp_terms)
  .innerJoin(wp_taxonomy, wp_terms+'.'+wp_termId, '=', wp_taxonomy+'.'+wp_taxonomyId)
.where(wp_taxonomy+'.'+taxonomy, '=', 'author')
.then((rows) => {
  console.log(JSON.stringify(rows, null, 4));
  const slugs = rows.map((row) => {
    return row.slug;
  })
  wordpressQueryBuilder
  .select('name', 'slug')
  .from(wp_terms)
    .innerJoin(wp_taxonomy, wp_terms+'.'+wp_termId, '=', wp_taxonomy+'.'+wp_taxonomyId)
  .where(wp_taxonomy+'.'+taxonomy, '=', 'author').orWhereIn('slug', slugs)
  .then((rows) => {
    const S = new Set();
    rows = rows.filter((row) => {
      if (S.has(row.name)) {
        return false;
      }
      else {
        S.add(row.name);
        return true;
      }
    })
    ghostQueryBuilder
    .insert(rows).into('authors')
    // Disconnect from the databases
    .then(disconnectWordpress()).then(disconnectGhost());
  });
});

