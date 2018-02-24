'use strict';

if (!process.env.DATABASE_PASSWORD) {
  console.log("Need to set DATABASE_PASSWORD environment variable");
  process.exit(1);
}

const management = ['tom-klein', 'kristina-stankovic', 'karolina-wilczynska', 'hannah-taylor', 'annie-bauer', 'nicolas-raney', 'daria-zahaleanu', 'emil-goldsmith-olesen', 'zane-mountcastle', 'karma-gurung', 'julia-tymoshenko'];
const editorial = ['branden-do-hyun-kang', 'shalini-corea', 'rosy-tahan', 'shreya-shreeraman', 'andrea-arletti', 'tracy-vavrova', 'maya-morsli', 'kaashif-hajee', 'nikolaj-nielsen', 'stephanie-lim', 'hind-ait-mout', 'herbert-crowther', 'thirangie-jayatilake', 'sobha-gadi', 'nathan-quimpo', 'cece-kim', 'chaerin-lim'];
const multimedia = ['adam-nagy', 'shenuka-corea', 'joaquin-kunkel', 'harper-cho', 'roland-folkmayer', 'abdelrahman-hassanin', 'miha-klasnic', 'peter-si', 'yulia-piskuliyska', 'aizaz-arif-ansari', 'simran-parwani'];
const writers = ['aasna-sijapati', 'benjamin-harris-roberts', 'jamie-uy', 'steffen-holter', 'aathma-dious', 'paula-valentina-dozsa', 'aron-braunsteiner', 'rashtra-bandari', 'soohyun-hwangbo', 'ji-young-kim', 'malak-yasser'];
const web = ['praggya-jeyakumar', 'joaquin-kunkel', 'navya-suri', 'maria-jaramillo', 'cynthia-xin-tong', 'patrick-inshuti-makuba', 'adam-nagy', 'jacinta-hu'];

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

knex('semesters').insert([
  {
    'name': 'Spring 2018',
    'date': '2018-01-22',
  },
])
.then(() => {
  console.log("Semesters inserted successfully");
  populateTeam(management, 'management', 'Spring 2018', 0);
  populateTeam(editorial, 'editorial', 'Spring 2018', 1);
  populateTeam(multimedia, 'multimedia', 'Spring 2018', 2);
  populateTeam(writers, 'writers', 'Spring 2018', 3);
  populateTeam(web, 'web', 'Spring 2018', 4);
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
