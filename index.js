var _ = require('lodash');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Schema = require('./model/schema')


var router = express.Router();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'ormtest',
    charset: 'utf8'
  }
});

var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('bookshelf-page');

var Category = Bookshelf.Model.extend({

  tableName: 'categories',

  posts: function () {
    return this.hasMany(Post, 'category_id');
  }
});

var Categories = Bookshelf.Collection.extend({
  model: Category
});

var Post = Bookshelf.Model.extend({
  tableName: 'posts',

  hasTimestamps: true,

  category: function () {
    return this.belongsTo(Category, 'category_id');
  },

  tags: function () {
    return this.belongsToMany(Tag);
  },

  author: function() {
    return this.belongsTo(User);
  }
});

var Posts = Bookshelf.Collection.extend({
  model: Post
});

var Tag = ({

  tableName: 'tags',

  posts: function () {
    return this.belongsToMany(Post);
  }
});

var Tags = Bookshelf.Collection.extend({
  model: Tag
});

var User = Bookshelf.Model.extend({
  tableName: 'users'
});

var Users = Bookshelf.Collection.extend({
  model: User
});


router.route('/users')
  .get(function (req, res) {
    Users.forge()
    .fetch()
    .then(function (collection) {
      res.json({error: false, data: collection.toJSON()});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    })
  })
  .post(function (req, res) {
    User.forge({
      name: req.body.name,
      email: req.body.email
    })
    .save()
    .then(function (user) {
      res.json({error: false, data: {id: user.get('id')}});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    })
  });

router.route('/users/:id')
  .get(function (req, res) {
    User.forge({id: req.params.id})
    .fetch()
    .then(function (user) {
      if (!user) {
        res.status(404).json({error: true, data: {}});
      } else {
        res.json({error: false, data: user.toJSON()});
      }
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    })
  })
  .put(function (req, res) {
    User.forge({id: req.params.id})
    .fetch({require: true})
    .then(function (user) {
      user.save({
        name: req.body.name || user.get('name'),
        email: req.body.email || user.get('email')
      })
      .then(function () {
        res.json({error: false, data: {message: 'User details updpated'}});
      })
      .catch(function (err) {
        res.status(500).json({error: true, data: {message: err.message}});
      });
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    })
  })
  .delete(function (req, res) {
    User.forge({id: req.params.id})
    .fetch({require: true})
    .then(function (user) {
      user.destroy()
      .then(function () {
        res.status({error: false, data: {message: 'User successfully deleted'}})
      });
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    })
  });

router.route('/posts')
  .post(function (req, res) {
    var tags = req.body.tags;

    if (tags) {
      tags = tags.split(',').map(function (tag) {
        return tag.trim();
      });
    } else {
      tags = ['uncategorised'];
    }

    Post.forge({
      user_id: req.body.user_id,
      category_id: req.body.category_id,
      title: req.body.title,
      slug: req.body.title.replace(/ /g, '-').toLowerCase(),
      html: req.body.post
    })
    .save()
    .then(function (post) {
      saveTags(tags)
        .then(function (ids) {
          post.load(['tags'])
            .then(function (model) {
              model.tags().attach(ids);

              res.json({error: false, data: {memssage: 'Tags saved'}});
            })
            .catch(function (err) {
              res.status(500).json({error: true, data: {message: err.message}});
            });
        })
        .catch(function (err) {
          res.status(500).json({error: true, data: {message: err.message}});
        });
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });

  router.route('/posts/category/:id')
    .get(function (req, res) {
      Category.forge({id: req.params.id})
      .fetch({withRelated: ['posts']})
      .then(function (category) {
        var posts = category.related('posts');
        res.json({error: false, data: posts.toJSON()});
      })
      .catch(function (err) {
        res.status(500).json({error: true, data: {message: err.message}});
      });
    });
  router.route('/posts/tag/:slug')
    .get(function (req, res) {
      Tag.forge({slug: req.params.slug})
      .fetch({withRelated: ['posts']})
      .then(function (tag) {
        var posts = tag.related('posts');
        res.json({error: false, data: posts.toJSON()});
      })
      .catch(function (err) {
        res.status(500).json({error: true, data: {message: err.message}});
      });
    });

  function saveTags(tags) {
    // create tag objects
    var tagObjects = tags.map(function (tag) {
      return {
        name: tag,
        slug: tag.replace(/ /g, '-').toLowerCase()
      };
    });
    return Tags.forge()
    // fetch tags that already exist
    .query('whereIn', 'slug', _.pluck(tagObjects, 'slug'))
    .fetch()
    .then(function (existingTags) {
      var doNotExist = [];
      existingTags = existingTags.toJSON();
      // filter out existing tags
      if (existingTags.length > 0) {
        var existingSlugs = _.pluck(existingTags, 'slug');
        doNotExist = tagObjects.filter(function (t) {
          return existingSlugs.indexOf(t.slug) < 0;
        });
      }
      else {
        doNotExist = tagObjects;
      }
      // save tags that do not exist
      return new Tags(doNotExist).mapThen(function(model) {
        return model.save()
        .then(function() {
          return model.get('id');
        });
      })
      // return ids of all passed tags
      .then(function (ids) {
        return _.union(ids, _.pluck(existingTags, 'id'));
      });
    });
  }

  app.use('/api', router);
  app.listen(3000, function() {
    console.log("✔ Express server listening on port %d in %s mode", 3000, app.get('env'));
  });
