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

// Without using raw code it seems like the smallest integer
// I can store is INT which goes up to 10^9, I find this way overkill
// For so many of the ID fields especially.
// Do you think I should use raw code then? It just gets so ugly,
// and maybe those few extra bits of data don't matter? Or...
// I guess we could at least halve data usage on the id columns if we reduced it

const MAX_NAME_OR_SLUG_LENGTH = 70;
const MAX_DESCRIPTION_LENGTH = 170;
const MAX_BIOGRAPHY_LENGTH = 255;

// Start of script
knex.schema
// Reset database
.dropTableIfExists('issues_posts')
.dropTableIfExists('teams_authors')
.dropTableIfExists('authors_posts')
.dropTableIfExists('gazelle_posts')
.dropTableIfExists('issues_categories_order')
.dropTableIfExists('categories_posts_order')
.dropTableIfExists('authors')
.dropTableIfExists('categories')
.dropTableIfExists('teams')
.dropTableIfExists('issues')
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
	table.string('description', MAX_DESCRIPTION_LENGTH);
	// Max 65,535 characters should be enough and is also what Ghost uses itself
	// And I left it nullable, then we can just input the default image
	// if an author is yet to give a picture of themselves
	table.text('image');
})
// Create issues table
.createTable('issues', (table) => {
	table.increments('id').primary().unsigned();
	table.string('slug', MAX_NAME_OR_SLUG_LENGTH).unique().notNullable();
	table.string('name', MAX_NAME_OR_SLUG_LENGTH).unique().notNullable();
	table.date('published_at');
})
// Create gazelle_posts table
.createTable('gazelle_posts', (table) => {
	table.integer('id').primary().unsigned().references('id').inTable('posts');
	table.integer('category_id').unsigned().references('id').inTable('categories');
	table.string('description', MAX_DESCRIPTION_LENGTH);
	table.integer('views').unsigned().notNullable().defaultTo(0);
	table.date('gazelle_published_at');
})
// Create authors table
.createTable('authors', (table) => {
	table.increments('id').primary().unsigned();
	table.string('slug', MAX_NAME_OR_SLUG_LENGTH).unique().notNullable();
	table.string('name', MAX_NAME_OR_SLUG_LENGTH).unique().notNullable();
	table.integer('team_id').unsigned().references('id').inTable('teams');
	table.string('job_title', MAX_NAME_OR_SLUG_LENGTH);
	// This could also be made into a text, depends on whether we want to
	// constrain our authors to short biographies or not.
	// I left it nullable, we can handle default values while rendering
	table.string('biography', MAX_BIOGRAPHY_LENGTH)
	table.text('image')
})
// Create authors_posts table
.createTable('authors_posts', (table) => {
	table.increments('id').primary().unsigned();
	table.integer('author_id').unsigned().notNullable().references('id').inTable('authors');
	table.integer('post_id').unsigned().notNullable().references('id').inTable('posts');
	table.index(['author_id', 'post_id'], 'uniqueness_index');
})
// Create teams_authors table
.createTable('teams_authors', (table) => {
	table.increments('id').primary().unsigned();
	table.integer('team_id').unsigned().notNullable().references('id').inTable('teams');
	table.integer('author_id').unsigned().notNullable().references('id').inTable('authors');
	table.index(['team_id', 'author_id'], 'uniqueness_index');
})
// Create issues_posts table
.createTable('issues_posts', (table) => {
	table.increments('id').primary().unsigned();
	table.integer('post_id').unsigned().notNullable().references('id').inTable('posts');
	table.integer('issue_id').unsigned().notNullable().references('id').inTable('issues');
	table.index(['post_id', 'issue_id'], 'uniqueness_index');
})
// Create issues_categories_order table
.createTable('issues_categories_order', (table) => {
	table.increments('id').primary().unsigned();
	table.integer('issue_id').unsigned().notNullable().references('id').inTable('issues');
	table.integer('category_id').unsigned().notNullable().references('id').inTable('categories');
	table.integer('sort_order').unsigned().notNullable().defaultTo(0);
	table.index(['issue_id', 'category_id', 'sort_order'], 'uniqueness_index');
})
// Create categories_posts_order table
.createTable('categories_posts_order', (table) => {
	table.increments('id').primary().unsigned();
	table.integer('issue_id').unsigned().notNullable().references('id').inTable('issues');
	table.integer('category_id').unsigned().notNullable().references('id').inTable('categories');
	table.integer('post_id').unsigned().notNullable().references('id').inTable('posts');
	table.integer('sort_order').unsigned().notNullable().defaultTo(0);
	table.index(['issue_id', 'category_id', 'post_id', 'sort_order'], 'uniqueness_index');
})
.then((okPacketsArray) => {
	console.log("success");
})
.catch((err) => {
	throw err;
})
.then(disconnect());
