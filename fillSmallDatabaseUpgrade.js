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
  },
});

const author_order = [
  {id: 10, author_order: 0},
  {id: 11, author_order: 1},
  {id: 12, author_order: 2},
  {id: 15, author_order: 3},
  {id: 14, author_order: 4},
  {id: 6, author_order: 5},
  {id: 7, author_order: 6},
  {id: 13, author_order: 7},
  {id: 8, author_order: 8},
  {id: 9, author_order: 9},
  {id: 5, author_order: 10},
  {id: 1, author_order: 0},
  {id: 2, author_order: 1},
  {id: 3, author_order: 2},
  {id: 4, author_order: 3},
];

knex('semesters').insert([{name: "Spring 2017", date: "2017-02-01"}])
.then(() => {
  let done = 0;
  knex('teams_authors').where('team_id', '=', 1)
  .update('team_order', 0)
  .then(() => {
    done++;
    if (done >= 18) {
      console.log("success");
      knex.destroy();
    }
  });
  knex('teams_authors').update('semester_id', 1)
  .then(() => {
    done++;
    if (done >= 18) {
      console.log("success");
      knex.destroy();
    }
  });
  knex('teams_authors').where('team_id', '=', 2)
  .update('team_order', 1)
  .then(() => {
    done++;
    if (done >= 18) {
      console.log("success");
      knex.destroy();
    }
  }); 
  author_order.forEach((object) => {
    knex('teams_authors').where('id', '=', object.id)
    .update('author_order', object.author_order)
    .then(() => {
      done++;
      if (done >= 18) {
        console.log("success");
        knex.destroy();
      }
    });
  });
  
});
