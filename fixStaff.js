'use strict';

if (!process.env.DATABASE_PASSWORD) {
  console.log("Need to set DATABASE_PASSWORD environment variable");
  process.exit(1);
}

const knex = require('knex')({
  client: 'mysql',
  connection: {
    "host": "127.0.0.1",
    "user": "root",
    "password": process.env.DATABASE_PASSWORD,
    "database": "the_gazelle",
    "charset": "latin1"
  },
});

knex('teams_staff').insert([{team_id: 4, staff_id: 389, team_order: 3, staff_order: 25, semester_id: 6}]).then(() => console.log(`Inserted Gaurav`));

knex('teams_staff').whereIn('id', [257, 265]).del().then(() => console.log(`Deleted duplicates`));
