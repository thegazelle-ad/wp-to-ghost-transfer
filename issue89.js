'use strict';

const choiceFlag = "issuesCategories";

const _ = require('lodash')

const knex = require('knex')({
  client: 'mysql',
  connection: {
    // The host where the MariaDB is located
    "host": "127.0.0.1",
    // The username to login to the DB with
    "user": "root",
    // The password for the given user
    "password": "password",
    // The name of The Gazelle's database in the MariaDB
    "database": "live_gazelle",
    "charset": 'latin1'
  },
});

const data = {
  issue: {
    featured: "letter-from-the-editors-7",
    picks: ["picking-courses", "post-grad"],
    categories: {
      "off-campus": ["the-ad-secrets-challenge-2", "art-in-ad"],
      "in-focus": ["post-marhaba-feels-2", "fixing-a-tire-2", "50-things-2"],
      "on-campus": ["dear-freshmen-2", "visa-delays", "changes-with-marhaba"],
      "commentary": ["returning-to-nyuad", "whitewashing-hollywood", "nyuad-survival-guide"],
    },
  },
  articles: [
    {
      slug: "50-things-2",
      category: "in-focus",
      authors: ["khadeeja-farooqui", "joey-bui", "jamie-sutherland"],
    },
    {
      slug: "fixing-a-tire-2",
      category: "in-focus",
      authors: ["zoe-hu"],
    },
    {
      slug: "dear-freshmen-2",
      category: "on-campus",
      authors: ["tessa-ayson"],
    },
    {
      slug: "post-marhaba-feels-2",
      category: "in-focus",
      authors: ["karolina-wilczynska"],
    },
    {
      slug: "the-ad-secrets-challenge-2",
      category: "off-campus",
      authors: ["the-gazelle-staff"],
    },
    {
      slug: "returning-to-nyuad",
      category: "commentary",
      authors: ["annie-bauer"],
    },
    {
      slug: "art-in-ad",
      category: "off-campus",
      authors: ["larayb-abrar"],
    },
    {
      slug: "post-grad",
      category: "commentary",
      authors: ["krushika-uday-patankar"],
    },
    {
      slug: "changes-with-marhaba",
      category: "on-campus",
      authors: ["saka-naka", "taj-chapman"],
    },
    {
      slug: "visa-delays",
      category: "on-campus",
      authors: ["connor-pearce"],
    },
    {
      slug: "whitewashing-hollywood",
      category: "commentary",
      authors: ["joey-bui"],
    },
    {
      slug: "letter-from-the-editors-7",
      category: "letters",
      authors: ["connor-pearce", "khadeeja-farooqui"],
    },
    {
      slug: "picking-courses",
      category: "commentary",
      authors: ["supriya-kamath"],
    },
    {
      slug: "nyuad-survival-guide",
      category: "commentary",
      authors: ["safa-salim"],
    },
  ],
  authors: [
    {
      slug: "safa-salim",
      name: "Safa Salim"
    }
  ]
}

const PUBLISH_DATE = "2016-08-21 08:00:00";
const ISSUE_NUMBER = 89;

if (choiceFlag === "posts_meta") {
  const articles = data.articles;
  const catData = [];
  articles.forEach((article) => {
    catData.push({slug: article.slug, category: article.category});
  });
  const slugs = catData.map((object) => {return object.slug});
  // console.log(featured);
  // console.log(picks);
  // console.log(rest);
  knex.select('slug', 'id')
  .from('posts')
  .whereIn('slug', slugs)
  .then((rows) => {
    knex.select('slug', 'id')
    .from('categories')
    .then((categories) => {
      console.log(rows.length);
      const insert = [];
      catData.forEach((object) => {
        const post_id =
        rows.find((row) => {
          return row.slug === object.slug;
        }).id;
        const category_id =
        categories.find((cat) => {
          return object.category === cat.slug;
        }).id;
        insert.push({
          id: post_id,
          category_id: category_id,
          views: 0,
          gazelle_published_at: PUBLISH_DATE,
        });
      })
      knex('posts_meta').insert(insert)
      .then(() => {
        console.log("success");
        knex.destroy();
      })
    })
  })
}

else if (choiceFlag === "articlesIssueRelationship") {
  const issue = data.issue;
  const featured = issue.featured;
  const picks = issue.picks;
  const rest = issue.categories;
  let slugs = [featured];
  slugs = slugs.concat(picks);
  _.forEach(rest, (cat) => {
    slugs = slugs.concat(cat);
  });
  knex.select('posts.id', 'slug', 'category_id')
  .from('posts')
  .innerJoin('posts_meta', 'posts.id', 'posts_meta.id')
  .whereIn('slug', slugs)
  .then((rows) => {
    knex.select('id')
    .from('issues')
    .where('issue_order', '=', ISSUE_NUMBER)
    .then((issues) => {
      const insert = [];
      const issueId = issues[0].id;
      let featuredId;
      rows = rows.filter((row) => {
        if (row.slug === featured) {
          if (featuredId) {
            throw new Error("problem with featuredId");
          }
          featuredId = row.id;
          return false;
        }
        return true;
      })
      insert.push({
        issue_id: issueId,
        type: 1,
        post_id: featuredId,
        posts_order: 0
      });
      const pickIds = [];
      rows = rows.filter((row) => {
        if (picks.find((slug) => {return slug === row.slug})) {
          if (pickIds.length > 1) {
            throw new Error("picks problem");
          }
          pickIds.push(row.id);
          return false;
        }
        return true;
      });
      pickIds.forEach((pickId, index) => {
        insert.push({
          issue_id: issueId,
          type: 2,
          post_id: pickId,
          posts_order: index
        });
      });
      rows.sort((a, b) => {
        a = a.category_id;
        b = b.category_id;
        return a-b;
      });
      let order = 0;
      rows.forEach((row, index) => {
        if (index > 0) {
          if (rows[index].category_id !== rows[index-1].category_id) {
            order = 0;
          }
        }
        insert.push({
          issue_id: issueId,
          type: 0,
          post_id: row.id,
          posts_order: order
        });
        order++;
      });
      knex('issues_posts_order').insert(insert)
      .then(() => {
        console.log("success");
        knex.destroy();
      })
    })
  })
}

else if (choiceFlag === "issuesCategories") {
  knex.select('id')
  .from('issues')
  .where('issue_order', ISSUE_NUMBER)
  .then((issues) => {
    const issueId = issues[0].id;
    knex.select('slug', 'id')
    .from('categories')
    .then((categories) => {
      const onCampusId =
      categories.find((cat) => {
        return cat.slug === "on-campus";
      }).id;
      const offCampusId =
      categories.find((cat) => {
        return cat.slug === "off-campus";
      }).id;
      const inFocusId =
      categories.find((cat) => {
        return cat.slug === "in-focus";
      }).id;
      const commentaryId =
      categories.find((cat) => {
        return cat.slug === "commentary";
      }).id;

      knex('issues_categories_order').insert([
        {
            issue_id: issueId,
            category_id: commentaryId,
            categories_order: 0,
        },
        {
            issue_id: issueId,
            category_id: onCampusId,
            categories_order: 1,
        },
        {
            issue_id: issueId,
            category_id: inFocusId,
            categories_order: 2,
        },
        {
            issue_id: issueId,
            category_id: offCampusId,
            categories_order: 3,
        },
      ])
      .then(() => {
        console.log("success");
        knex.destroy();
      })
    })
  })
}

else if (choiceFlag === "updateAuthors") {
  knex('authors').insert(data.authors)
  .then(() => {
    console.log("success");
    knex.destroy();
  })
}

else if (choiceFlag === "authorsPosts") {
  const issue = data.issue;
  const featured = issue.featured;
  const picks = issue.picks;
  const rest = issue.categories;
  let postSlugs = [featured];
  postSlugs = postSlugs.concat(picks);
  _.forEach(rest, (cat) => {
    postSlugs = postSlugs.concat(cat);
  });
  const authorSlugs = [];
  const authorPostRelations = [];
  data.articles.forEach((article) => {
    article.authors.forEach((author) => {
      if (!authorSlugs.find((slug) => {return slug === author})) {
        authorSlugs.push(author);
      }
      authorPostRelations.push({
        post_slug: article.slug,
        author_slug: author,
      });
    })
  });
  knex.select('slug', 'id')
  .from('posts')
  .whereIn('slug', postSlugs)
  .then((posts) => {
    knex.select('slug', 'id')
    .from('authors')
    .whereIn('slug', authorSlugs)
    .then((authors) => {
      const insert = [];
      authorPostRelations.forEach((relation) => {
        const post_id =
        posts.find((post) => {
          return post.slug === relation.post_slug;
        }).id;
        const author_id =
        authors.find((author) => {
          return author.slug === relation.author_slug;
        }).id;
        insert.push({
          author_id: author_id,
          post_id: post_id,
        });
      });
      knex('authors_posts').insert(insert)
      .then((data) => {
        console.log(data);
        knex.destroy();
      })
    })
  })
}

else {
  throw new Error("wrong choiceflag");
}
