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
    database: "the_gazelle"
  }
});

knex.schema
// Drop current foreign keys
.table('posts_meta', (table) => {
  table.dropForeign('id');
  table.dropForeign('category_id');
})
.table('authors', (table) => {
  table.dropForeign('team_id');
})
.table('authors_posts', (table) => {
  table.dropForeign('author_id');
  table.dropForeign('post_id');
})
.table('teams_authors', (table) => {
  table.dropForeign('team_id');
  table.dropForeign('author_id');
})
.table('issues_categories_order', (table) => {
  table.dropForeign('issue_id');
  table.dropForeign('category_id');
})
.table('issues_posts_order', (table) => {
  table.dropForeign('issue_id');
  table.dropForeign('post_id');
})
// ReAdd them but now with onUpdate and onDelete restraints
.table('posts_meta', (table) => {
  table.foreign('id').references('id').inTable('posts').onUpdate('CASCADE').onDelete('CASCADE');
  table.foreign('category_id').references('id').inTable('categories').onUpdate('CASCADE').onDelete('SET NULL');
})
.table('authors', (table) => {
  table.foreign('team_id').references('id').inTable('teams').onUpdate('CASCADE').onDelete('SET NULL');
})
.table('authors_posts', (table) => {
  table.foreign('author_id').references('id').inTable('authors').onUpdate('CASCADE').onDelete('CASCADE');
  table.foreign('post_id').references('id').inTable('posts').onUpdate('CASCADE').onDelete('CASCADE');
})
.table('teams_authors', (table) => {
  table.foreign('team_id').references('id').inTable('teams').onUpdate('CASCADE').onDelete('CASCADE');
  table.foreign('author_id').references('id').inTable('authors').onUpdate('CASCADE').onDelete('CASCADE');
})
.table('issues_categories_order', (table) => {
  table.foreign('issue_id').references('id').inTable('issues').onUpdate('CASCADE').onDelete('CASCADE');
  table.foreign('category_id').references('id').inTable('categories').onUpdate('CASCADE').onDelete('CASCADE');
})
.table('issues_posts_order', (table) => {
  table.foreign('issue_id').references('id').inTable('issues').onUpdate('CASCADE').onDelete('CASCADE');
  table.foreign('post_id').references('id').inTable('posts').onUpdate('CASCADE').onDelete('CASCADE');
})
.then(disconnect);
