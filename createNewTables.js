'use strict';

function disconnect() {
	knex.destroy();
}

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: "localhost",
    user: "root",
    password: "",
    database: "ghost_copy"
  }
});

const MAX_NAME_OR_SLUG_LENGTH = 70;
const MAX_DESCRIPTION_LENGTH = 170;

knex.schema
// Reset database
.dropTableIfExists('gazelle_posts')
.dropTableIfExists('categories')
.dropTableIfExists('teams')
// Create categories table
.createTable('categories', (table) => {
	table.increments('id').primary().unsigned();
	table.string('slug', MAX_NAME_OR_SLUG_LENGTH).unique().notNullable();
	table.string('name', MAX_NAME_OR_SLUG_LENGTH).unique().notNullable();
})
// Create teams table
.createTable('teams', (table) => {
	table.increments('id').primary().unsigned();
	table.string('slug', MAX_NAME_OR_SLUG_LENGTH).unique().notNullable();
	table.string('name', MAX_NAME_OR_SLUG_LENGTH).unique().notNullable();
	table.string('description', MAX_DESCRIPTION_LENGTH).notNullable();
	table.text('image');
})
// Create gazelle_posts table
.createTable('gazelle_posts', (table) => {
	table.integer('id').primary().unsigned().references('id').inTable('posts');
	table.integer('category_id').unsigned().notNullable().references('id').inTable('categories');
	table.integer('views').unsigned().notNullable().defaultTo(0);
	table.date('gazelle_published_at');
})
.then((message) => {
	console.log("success");
})
.catch((err) => {
	throw err;
})
.then(disconnect());