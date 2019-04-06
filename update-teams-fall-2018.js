'use strict';

if (!process.env.DATABASE_PASSWORD) {
  console.log("Need to set DATABASE_PASSWORD environment variable");
  process.exit(1);
}

const management = ['maya-morsli', 'jakob-plaschke', 'paula-estrada', 'jocilyn-estes', 'nathan-quimpo', 'dania-paul', 'hania-bar', 'emil-goldsmith-olesen', 'julia-tymoshenko'];
const editorial = ['priyanka-lakhiani', 'herbert-crowther', 'soohyun-hwangbo', 'aasna-sijapati', 'anna-pustovoit', 'kaashif-hajee', 'sobha-gadi', 'laura-assanmal', 'tracy-vavrova', 'dylan-palladino', 'vlado-vasile', 'mari-velasquez-soler', 'serra-okumus', 'aaron-marcus-willers', 'gayoung-lee', 'ming-ee-tham'];
const multimedia = ['tom-abi-samra', 'ethan-david', 'kyle-adams', 'melika-shahin'];
const writers = ['ian-hoyt', 'jessica-abdala', 'rashtra-bandari', 'steffen-holter', 'jamie-uy'];
const web = ['navya-suri', 'maria-jaramillo', 'jacinta-hu'];

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
    'name': 'Fall 2018',
    'date': '2018-09-01',
  },
])
.then(() => {
  console.log("Semesters inserted successfully");
  populateTeam(management, 'management', 'Fall 2018', 0);
  populateTeam(editorial, 'editorial', 'Fall 2018', 1);
  populateTeam(multimedia, 'multimedia', 'Fall 2018', 2);
  populateTeam(writers, 'writers', 'Fall 2018', 3);
  populateTeam(web, 'web', 'Fall 2018', 4);
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
      knex.select('id').from('staff').where('slug', slug).then((rows) => {
        if (rows.length != 1) {
          console.log(`row length equals ${rows.length} at ${teamSlug} slug: ${slug}`);
        }
        insert.push({
          team_id: teamId,
          staff_id: rows[0].id,
          team_order: teamOrder,
          staff_order: index,
          semester_id: semesterId,
        });
        cur++;
        if (cur >= num) {
          knex('teams_staff').insert(insert).then(() => console.log(`Inserted ${teamSlug}`));
        }
      });
    });
  })
  .catch(e => {
    console.log("ERROR:", e);
    process.exit(1);
  });
}

