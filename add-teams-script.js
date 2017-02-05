'use strict';
const management = ['connor-pearce', 'karma-gurung', 'shreya-shreeraman', 'gauraang-biyani'];
const editorial = ['mariam-raslan', 'jakob-plaschke', 'paula-brečak', 'melinda-szekeres', 'vamika-sinha', 'chiran-raj-pandey', 'daria-zahaleanu', 'seyed-mohammad-ahlesaadat', 'archita-arun', 'bernice-delos-reyes', 'liza-tait-bailey'];

const knex = require('knex')({
  client: 'mysql',
  connection: {
    "host": "127.0.0.1",
    "user": "root",
    "password": "password",
    "database": "the_gazelle",
    "charset": "latin1"
  },
});

knex('teams').insert([{
    'name': 'Management',
    'slug': 'management',
  },
  {
    'name': 'Editorial',
    'slug': 'editorial',
  },
]).then(() => {console.log("Teams inserted successfully")});

const insert = [];
const num = management.length;
let cur = 0;
management.forEach((slug) => {
  knex.select('id').from('authors').where('slug', slug).then((rows) => {
    if (rows.length != 1) {
      console.log("row length equals", rows.length, "at management slug:", slug);
    }
    insert.push({
      team_id: 1,
      author_id: rows[0].id,
    });
    cur++;
    if (cur >= num) {
      const ed_num = editorial.length;
      let ed_cur = 0;
      editorial.forEach((slug) => {
        knex.select('id').from('authors').where('slug', slug).then((rows) => {
          if (rows.length != 1) {
            console.log("row length equals", rows.length, "at editorial slug:", slug);
          }
          insert.push({
            team_id: 2,
            author_id: rows[0].id,
          });
          ed_cur++;
          if (ed_cur >= ed_num) {
            knex('teams_authors').insert(insert).then(() => {
              console.log("Inserted author team relationship");
            });
          }
        });
      });
    }
  });
});
