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
// Create interactive_meta table
.createTableIfNotExists('interactive_meta', (table) => {
        table.integer('id').primary().unsigned().references('id').inTable('posts').onUpdate('CASCADE').onDelete('CASCADE');
        table.text('html', 'mediumtext').notNullable();
        table.text('js', 'mediumtext')
        table.text('css', 'mediumtext')
})
.table('posts_meta', (table) => {
        table.boolean('is_interactive').notNullable().defaultTo(false);
})
.then(() => {
  console.log("success");
})
.catch((err) => {
  throw err;
})
.then(disconnect);
