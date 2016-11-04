var database = require('knex')({
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
    // which character encoding to use - keep this as latin1
    "charset": "latin1"
  },
  pool: {
    min: 10,
    max: 500,
  }
});

var _ = require('lodash');

console.log(database.select().from('authors_posts')
.orderBy('post_id')
.orderBy('author_id').toString());

database.select().from('authors_posts')
.orderBy('post_id')
.orderBy('author_id')
.then((rows) => {
  var lastPost = null;
  var toDelete = [];
  rows.forEach((row, index) => {
    if (row.post_id !== lastPost) {
      lastPost = row.post_id;
    }
    else {
      if (row.author_id === rows[index-1].author_id) {
        toDelete.push(row.id);
      }
    }
  });
  var returned = 0;
  toDelete.forEach((id) => {
    database('authors_posts').where('id', '=', id).del().then(() => {
      returned++;
      if (returned >= toDelete.length) {
        fixIssue();
      }
    })
  });
  if (toDelete.length === 0) {
    fixIssue();
  }
});

function fixIssue() {
  console.log("posts in issues");
  return database.select().from('issues_posts_order')
  .orderBy('issue_id')
  .orderBy('post_id')
  .then((rows) => {
    var lastIssue = null;
    var toReorder = [];
    var toDelete = [];
    rows.forEach((row, index) => {
      if (row.issue_id !== lastIssue) {
        lastIssue = row.issue_id;
      }
      else {
        if (row.post_id === rows[index-1].post_id) {
          var id;
          if (row.type === 0) {
            id = row.id;
          }
          else {
            id = rows[index-1].id;
          }
          toReorder.push(lastIssue);
          toDelete.push(id);
        }
      }
    });
    var cnt = 0;
    toReorder = _.uniq(toReorder);
    toDelete.forEach((id) => {
      database('issues_posts_order').where('id', '=', id).del().then(() => {
        cnt++;
        if (cnt >= toDelete.length) {
          orderArticlesInIssues(toReorder).then(() => {
            database.destroy();
          });
        }
      });
    });
    if (toDelete.length === 0) {
      database.destroy();
    }
  });
}

function orderArticlesInIssues(issues) {
  // Issues is assumed to be an array of integers where
  // the integers are the ids of issues
  return new Promise((resolve) => {
    let updatesCalled = 0;
    let updatesReturned = 0;
    issues.forEach((issueId) => {
      // Get the current categories so we know if we have to add new ones
      // or delete old ones
      database.select('category_id', 'categories_order')
      .from('issues_categories_order')
      .where('issue_id', '=', issueId)
      .orderBy('categories_order', 'ASC')
      .then((categoryRows) => {
        database.select('issues_posts_order.id as id', 'category_id', 'posts_order')
        .from('issues_posts_order')
        .innerJoin('posts_meta', 'posts_meta.id', '=', 'issues_posts_order.post_id')
        .where('type', '=', 0)
        .where('issue_id', '=', issueId)
        .orderBy('category_id', 'ASC')
        .orderBy('issues_posts_order.posts_order', 'ASC')
        .then((postRows) => {
          let lastCategory = null;
          let order = 0;
          const toUpdate = [];
          const newCategories = [];
          postRows.forEach((row) => {
            if (lastCategory !== row.category_id) {
              lastCategory = row.category_id;
              order = 0;
              newCategories.push(row.category_id);
            }
            if (order !== row.posts_order) {
              toUpdate.push({
                id: row.id,
                update: {
                  posts_order: order,
                },
              });
            }
            order++;
          });
          updatesCalled += toUpdate.length;
          toUpdate.forEach((obj) => {
            database('issues_posts_order')
            .where('id', '=', obj.id)
            .update(obj.update)
            .then(() => {
              updatesReturned++;
              if (updatesReturned >= updatesCalled) {
                resolve(true);
              }
            });
          });
          // Check if categories are still consistent
          const newCategoriesWithOrder = [];
          let consistent = true;
          categoryRows.forEach((category) => {
            if (newCategories.find((cat) => {return cat === category.category_id}) !== undefined) {
              newCategoriesWithOrder.push(category);
            }
            else {
              consistent = false;
            }
          });
          newCategories.forEach((categoryId) => {
            if (newCategoriesWithOrder.find((cat) => {return cat.category_id === categoryId}) === undefined) {
              consistent = false;
              const foundHole = newCategoriesWithOrder.some((cat, index) => {
                if (index !== cat.categories_order) {
                  newCategoriesWithOrder.splice(index, 0, {category_id: categoryId, categories_order: index});
                  return true;
                }
                return false;
              });
              if (!foundHole) {
                newCategoriesWithOrder.push({category_id: categoryId, categories_order: newCategoriesWithOrder.length});
              }
            }
          });
          if (!consistent) {
            newCategoriesWithOrder.forEach((cat, index) => {
              cat.categories_order = index;
              cat.issue_id = issueId;
            });
            updatesCalled++;
            // Delete the current categories order and insert the new one
            database('issues_categories_order').where('issue_id', '=', issueId).del()
            .then(() => {
              database('issues_categories_order').insert(newCategoriesWithOrder)
              .then(() => {
                updatesReturned++;
                if (updatesReturned >= updatesCalled) {
                  resolve(true);
                }
              });
            });
          }
          else if (updatesCalled === 0) {
            resolve(true);
          }
        });
      });
    });
  });
}
