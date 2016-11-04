'use strict';

const choiceFlag = "issues";

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
    featured: "nyuad-hangover",
    picks: ["board-of-appeals","navigating-friendships-at-nyuad",],
    categories: {
      "in-focus": ["artist-riva-razdan","felix-hardmood-beck","internship-experience","arabic-playlist","new-ffir-in-a5",],
      "on-campus": ["campus-family",],
      "off-campus": ["new-neighbors","falcon-hospital","kazakhastan","eid-break-2",],
      "commentary": ["understanding-finance-economics-series","realad-2","summer-and-home","vpn-update","islamophobia-2",],
    },
  },
  articles: [
    {
      slug: "vpn-update",
      category: "commentary",
      author: "dominique-aquino-joaquin",
    },
    {
      slug: "artist-riva-razdan",
      category: "in-focus",
      author: "alyssa-yu",
    },
    {
      slug: "islamophobia-2",
      category: "commentary",
      author: "safa-salim",
    },
    {
      slug: "navigating-friendships-at-nyuad",
      category: "commentary",
      author: "supriya-kamath",
    },
    {
      slug: "understanding-finance-economics-series",
      category: "commentary",
      author: "rhoshenda-ellis",
    },
    {
      slug: "felix-hardmood-beck",
      category: "in-focus",
      author: ["karolina-wilczynska", "pranav-mehta"],
    },
    {
      slug: "board-of-appeals",
      category: "off-campus",
      author: "tom-klein",
    },
    {
      slug: "new-neighbors",
      category: "off-campus",
      author: "tom-klein",
    },
    {
      slug: "eid-break-2",
      category: "off-campus",
      author: "riva-razdan",
    },
    {
      slug: "realad-2",
      category: "commentary",
      author: "atoka-jo",
    },
    {
      slug: "falcon-hospital",
      category: "off-campus",
      author: "ghaniba-ali",
    },
    {
      slug: "internship-experience",
      category: "in-focus",
      author: "henry-jiang",
    },
    {
      slug: "campus-family",
      category: "on-campus",
      author: "james-pearce",
    },
    {
      slug: "arabic-playlist",
      category: "in-focus",
      author: "kristina-stankovic",
    },
    {
      slug: "summer-and-home",
      category: "commentary",
      author: "nela-noll",
    },
    {
      slug: "new-ffir-in-a5",
      category: "in-focus",
      author: "hannah-taylor",
    },
    {
      slug: "nyuad-hangover",
      category: "commentary",
      author: "tessa-ayson",
    },
    {
      slug: "kazakhastan",
      category: "off-campus",
      author: "anna-balysheva",
    },
  ],
  authors: [
    {
      slug: "dominique-aquino-joaquin",
      name: "Dominique Aquino Joaquin"
    },
    {
      slug: "atoka-jo",
      name: "Atoka Jo"
    },
    {
      slug: "james-pearce",
      name: "James Pearce"
    },
  ]
}

const PUBLISH_DATE = "2016-09-18 08:00:00";
const ISSUE_NUMBER = 92;

if (choiceFlag === "issues") {
  knex('issues').insert([
    {name: "Issue 92", published_at: "2016-09-18", issue_order: 92},
  ])
  .then(() => {
    knex.destroy();
  });
}

else if (choiceFlag === "posts_meta") {
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
            categories_order: 3,
        },
        {
            issue_id: issueId,
            category_id: offCampusId,
            categories_order: 2,
        },
        {
            issue_id: issueId,
            category_id: inFocusId,
            categories_order: 1,
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
    if (article.author instanceof Array) {
      article.author.forEach((author) => {
        if (!authorSlugs.find((slug) => {return slug === author})) {
          authorSlugs.push(author);
        }
        authorPostRelations.push({
          post_slug: article.slug,
          author_slug: author,
        });
      })
    }
    else {
      if (!authorSlugs.find((slug) => {return slug === article.author})) {
        authorSlugs.push(article.author);
      }
      authorPostRelations.push({
        post_slug: article.slug,
        author_slug: article.author,
      });
    }
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
