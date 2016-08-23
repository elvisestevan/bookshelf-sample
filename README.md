# bookshelf-sample

Projeto para demonstrar o uso do Bookshelf ORM

É uma API com um CRUD:

Users

GET /users - fetch all users
POST /users - create a new user
GET /users/:id - fetch a single user by id
PUT /users/:id - update user
DELETE /users/:id - delete user

Categories

GET /categories - fetch all categories
POST /categories - create a new category
GET /categories/:id - fetch a single category
PUT /categories/:id - update category
DELETE /categories/:id - delete category
Posts

GET /posts - fetch all posts
POST /posts - create a new post
GET /posts/:id - fetch a single post by id
PUT /posts/:id - update post
DELETE /posts/:id - delete post
GET /posts/category/:id - fetch all posts from a single category
GET /posts/tags/:slug - fetch all posts from a single tag
