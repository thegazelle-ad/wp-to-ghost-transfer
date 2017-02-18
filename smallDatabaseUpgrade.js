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


// Start of script
knex.schema
.table('teams', (table) => {
  table.dropColumn('description');
})
.createTableIfNotExists('semesters', (table) => {
  table.increments('id').primary().unsigned();
  table.string('name', MAX_NAME_OR_SLUG_LENGTH).unique().notNullable();
  table.date('date').unique().notNullable();
}).table('teams_authors', (table) => {
  table.integer('team_order').unsigned().notNullable().defaultTo(0);
  table.integer('author_order').unsigned().notNullable().defaultTo(0);
  table.integer('semester_id').unsigned().references('id').inTable('semesters').onUpdate('CASCADE');
}).then(() => {
  console.log("Success");
})
.catch((err) => {
  throw err;
})
.then(disconnect());
