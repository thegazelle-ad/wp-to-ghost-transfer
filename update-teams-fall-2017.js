'use strict';
// Zubareva, Paula Dozsa, Ji Young Kim, Ikenna, Cynthia

const management = ['tom-klein', 'kristina-stankovic', 'karolina-wilczynska', 'hannah-taylor', 'annie-bauer', 'nicolas-raney', 'ayah-rashid', 'karma-gurung', 'bernice-delos-reyes', 'julia-tymoshenko'];
const editorial = ['shreya-shreeraman', 'priyanka-lakhiani', 'vamika-sinha', 'nikolaj-nielsen', 'jakob-plaschke', 'paula-estrada', 'jocilyn-estes', 'daria-zahaleanu', 'argentina-mena', 'andrea-arletti', 'dania-paul', 'herbert-crowther', 'thirangie-jayatilake', 'nimrah-khanyari', 'warda-malik', 'natalie-kopczewski', 'nathan-quimpo', 'cece-kim', 'diya-gupta', 'chaerin-lim'];
const multimedia = ['melinda-szekeres', 'joaquin-kunkel', 'ilona-szekeres', 'shenuka-corea', 'miha-klasnic', 'seongun-si', 'alexis-mountcastle', 'aizaz-arif-ansari', 'anastasiia-zubareva', 'mahgul-farooqui', 'simran-parwani'];
const writers = ['taj-chapman', 'paula-valentina-dozsa', 'aron-braunsteiner', 'daniah-kheetan', 'gaurav-dewani', 'simrat-roopra', 'archita-arun', 'dana-abu-ali', 'abdelrahman', 'hind-ait-mout', 'soohyun-hwangbo', 'ji-young-kim', 'nandini-kochar'];
const web = ['emil-goldsmith-olesen', 'zane-mountcastle', 'jaisal-friedman', 'arantza-rodriguez', 'ikenna-anyanwu', 'cynthia-xin-tong'];

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
    'name': 'multimedia',
    'slug': 'multimedia',
  },
  {
    'name': 'writers',
    'slug': 'writers',
  },
  {
    'name': 'web',
    'slug': 'web',
  },
])
.then(() => {
  console.log("Teams inserted successfully");
  return knex('semesters').insert([
    {
      'name': 'Fall 2017',
      'date': '2017-09-01',
    },
  ]);
})
.then(() => {
  console.log("Semesters inserted successfully");
  populateTeam(management, 'management', 'Fall 2017', 0);
  populateTeam(editorial, 'editorial', 'Fall 2017', 1);
  populateTeam(multimedia, 'multimedia', 'Fall 2017', 2);
  populateTeam(writers, 'writers', 'Fall 2017', 3);
  populateTeam(web, 'web', 'Fall 2017', 4);
});


function populateTeam(slugs, teamSlug, semesterName, teamOrder) {
  let semesterId = null;
  let teamId = null;
  knex.select('id').from('semesters').where('name', semesterName)
  .then(semesterRows => {
    if (semesterRows.length != 1) {
      throw new Error("Can't find the semester");
    }
    return semesterRows[0].id;
  })
  .then(fetchedSemesterId => {
    semesterId = fetchedSemesterId;
    return knex.select('id').from('teams').where('slug', teamSlug);
  })
  .then(teamRows => {
    if (teamRows.length != 1) {
      throw new Error("Can't find the team");
    }
    return teamRows[0].id;
  })
  .then(fetchedTeamId => {
    teamId = fetchedTeamId;

    // Time to actually insert
    const insert = [];
    const num = slugs.length;
    let cur = 0;
    slugs.forEach((slug, index) => {
      knex.select('id').from('authors').where('slug', slug).then((rows) => {
        if (rows.length != 1) {
          console.log(`row length equals ${rows.length} at ${teamSlug} slug: ${slug}`);
        }
        insert.push({
          team_id: teamId,
          author_id: rows[0].id,
          team_order: teamOrder,
          author_order: index,
          semester_id: semesterId,
        });
        cur++;
        if (cur >= num) {
          knex('teams_authors').insert(insert).then(() => console.log(`Inserted ${teamSlug}`));
        }
      });
    });
  })
  .catch(e => {
    console.log("ERROR:", e);
    process.exit(1);
  });
}
