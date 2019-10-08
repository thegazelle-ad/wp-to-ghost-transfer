'use strict';

if (!process.env.DATABASE_PASSWORD) {
  console.log("Need to set DATABASE_PASSWORD environment variable");
  process.exit(1);
}
const management = ['jakob-plaschke', 'paula-estrada','kaashif-hajee', 'andrea-arletti', 'sobha-gadi', 'dylan-palladino', 'laura-assanmal'];
const editorial = ['vatsa-singh', 'andrijana-pejchinovska', 'ari-hawkins', 'luis-rodriguez', 'aayusha-shrestha', 'aasna-sijapati', 'ming-ee-tham', 'caroline-sullivan', 'sarah-afaneh', 'mari-velasquez-soler', 'abhyudaya-tyagi', 'emily-broad', 'matthew-gubbins', 'michelle-shin', 'chris-shim'];
const multimedia = ['liene-pekuse', 'mahgul-farooqui', 'darya-sukhova', 'vivi-zhu', 'olivia-bray', 'emily-broad', 'kyle-adams', 'quim-paredes', 'isabel-rios', 'scarlet-ng', 'yuree-chang', 'grace-shieh', 'katie-ferreol', 'chloe-venn', 'ilya-amikov', 'injoo-kang', 'jack-baek', 'armaan-agrawal'];
const writers = ['nicholas-patas', 'mohammad-khan-durrani', 'jude-al-qubaisi', 'olivia-bray', 'salama-al-ghafli', 'joanna-orphanide', 'vid-milakovic', 'liam-jansen', 'toby-le', 'aravind-kumar', 'reema-el-kaiali', 'youssef-azzam', 'angad-johar', 'cindy-li', 'michael-leo', 'maryam-almansoori', 'haewon-yoon', 'huma-umar', 'abdulla-almarzooqi', 'ananya-krishnakumar', 'safeeya-alawadi', 'grace-bechdol', 'beniamin-strzelecki', 'priyanshu-mishra', 'srinika-rajanikanth'];
const web = ['navya-suri', 'jacinta-hu'];
const copy = ['aaron-marcus-willers', 'eyza-irene-hamdani-hussain', 'malik-muhammad-shehyar-hanif'];
const social = ['raeed-riaz', 'sameera-singh', 'mueez-hasan', 'songyue-xu'];

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

knex('teams').insert([
  {
    'slug': 'copy-editing',
    'name': 'copy editing',
  },
  {
    'slug': 'social-media',
    'name': 'social media',
  },
])
.then(() => {
  console.log("Teams inserted successfully");
});

knex('semesters').insert([
  {
    'name': 'Fall 2019',
    'date': '2019-09-01',
  },
])
.then(() => {
  console.log("Semesters inserted successfully");
  populateTeam(management, 'management', 'Fall 2019', 0);
  populateTeam(editorial, 'editorial', 'Fall 2019', 1);
  populateTeam(multimedia, 'multimedia', 'Fall 2019', 2);
  populateTeam(writers, 'writers', 'Fall 2019', 3);
  populateTeam(web, 'web', 'Fall 2019', 4);
  populateTeam(copy, 'copy-editing', 'Fall 2019', 5);
  populateTeam(social, 'social-media', 'Fall 2019', 6);
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

