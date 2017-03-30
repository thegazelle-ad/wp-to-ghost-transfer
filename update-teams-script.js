'use strict';

const management = ['nisala-saheed'];
const editorial = ['paula-estrada', 'dominique-aquino-joaquin', 'emil-goldsmith-olesen', 'zane-mountcastle', 'roland-folkmayer', 'gergő-varga'];
const contributors = ['maha-toor', 'nicolas-raney', 'andrea-arletti', 'christine-shao', 'dania-paul', 'athena-thomas'];

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

knex('teams').insert([
  {
    'name': 'contributors',
    'slug': 'contributors',
  },
]).then(() => {console.log("Teams inserted successfully")});


const insert = [];
const num = management.length;
let cur = 0;
management.forEach((slug, management_index) => {
  knex.select('id').from('authors').where('slug', slug).then((rows) => {
    if (rows.length != 1) {
      console.log("row length equals", rows.length, "at management slug:", slug);
    }
    insert.push({
      team_id: 1,
      author_id: rows[0].id,
      team_order: 0,
      author_order: management_index+4,
      semester_id: 1,
    });
    cur++;
    if (cur >= num) {
      const ed_num = editorial.length;
      let ed_cur = 0;
      editorial.forEach((slug, editorial_index) => {
        knex.select('id').from('authors').where('slug', slug).then((rows) => {
          if (rows.length != 1) {
            console.log("row length equals", rows.length, "at editorial slug:", slug);
          }
          insert.push({
            team_id: 2,
            author_id: rows[0].id,
            team_order: 1,
            author_order: editorial_index+11,
            semester_id: 1,
          });
          ed_cur++;
          if (ed_cur >= ed_num) {
            const cont_num = contributors.length;
            let cont_cur = 0;
            contributors.forEach((slug, contributors_index) => {
              knex.select('id').from('authors').where('slug', slug).then((rows) => {
                if (rows.length != 1) {
                  console.log("row length equals", rows.length, "at contributors slug:", slug);
                }
                insert.push({
                  team_id: 3,
                  author_id: rows[0].id,
                  team_order: 2,
                  author_order: contributors_index,
                  semester_id: 1,
                });
                cont_cur++;
                if (cont_cur >= cont_num) {
                  knex('teams_authors').insert(insert).then(() => {
                    console.log("Inserted author team relationship");
                  });
                }
              });
            });
          }
        });
      });
    }
  });
});
