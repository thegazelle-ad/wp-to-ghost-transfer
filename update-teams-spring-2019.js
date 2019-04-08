'use strict';

if (!process.env.DATABASE_PASSWORD) {
  console.log("Need to set DATABASE_PASSWORD environment variable");
  process.exit(1);
}

const management = ['maya-morsli', 'jocilyn-estes', 'aaron-marcus-willers', 'haneen-fathy', 'mueez-hasan', 'eyza-irene-hamdani-hussain', 'navya-suri', 'emil-goldsmith-olesen', 'auguste-nomeikaite', 'sameera-singh'];
const editorial = ['taj-chapman', 'mari-velasquez-soler', 'davit-jintcharadze', 'anna-pustovoit', 'andrea-arletti', 'abhyudaya-tyagi', 'aayusha-shrestha', 'ari-hawkins', 'khaled-alhosani', 'kyle-adams', 'ming-ee-tham', 'katharina-klaunig', 'gayoung-lee'];
const multimedia = ['tom-abi-samra', 'mahgul-farooqui', 'emily-broad', 'katarina-holtzapple', 'ta-hyun-lee', 'liene-pekuse', 'darya-sukhova', 'vivi-zhu'];
const writers = ['ian-hoyt', 'elyazyeh-al-falacy', 'liam-meier', 'laila-hashem', 'andrijana-pejchinovska', 'chhete-sherpa', 'sarah-afaneh', 'chisom-ezeifemeelu', 'rashtra-bandari', 'malak-abdel-ghaffar', 'steffen-holter', 'sara-monsalve'];
const web = ['navya-suri', 'abdullah-zameek', 'jacinta-hu', 'nurpeiis-baimukan', 'junior-garcia', 'simran-parwani', 'jung-soo-ha', 'rick-kim', 'mariam-el-sahhar', 'manesha-ramesh'];

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
    'name': 'Spring 2019',
    'date': '2019-02-01',
  },
])
.then(() => {
  console.log("Semesters inserted successfully");
  populateTeam(management, 'management', 'Spring 2019', 0);
  populateTeam(editorial, 'editorial', 'Spring 2019', 1);
  populateTeam(multimedia, 'multimedia', 'Spring 2019', 2);
  populateTeam(writers, 'writers', 'Spring 2019', 3);
  populateTeam(web, 'web', 'Spring 2019', 4);
	addMarcelo();
});

function addMarcelo() {
	knex('teams_staff').insert([{team_id: 6, staff_id: 647, team_order: 4, staff_order: 9, semester_id: 5}]).then(() => console.log(`Inserted Marcelo`));
}

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

