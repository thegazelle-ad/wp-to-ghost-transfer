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

const MAX_NAME_OR_SLUG_LENGTH = 70;
const MAX_DESCRIPTION_LENGTH = 170;
const MAX_BIOGRAPHY_LENGTH = 255;


// Start of script - 1. Add mediaContributors_posts table with reference to author_id in row 1 and posts_id in row 2
knex.schema
//Reset Database
.dropTableIfExists('mediaContributors_posts')
// Create mediaContributors_posts table
.createTable('mediaContributors_posts', (table) => {
	table.increments('id').primary().unsigned();
	table.integer('author_id').unsigned().notNullable().references('id').inTable('authors').onUpdate('CASCADE').onDelete('CASCADE');
	table.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onUpdate('CASCADE').onDelete('CASCADE');
	table.index(['author_id', 'post_id'], 'uniqueness_index');
})
.then(() => {
console.log("Success");
})
.catch((err) => {
throw err;
})
.then(disconnect());
