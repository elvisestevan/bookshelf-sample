# bookshelf-sample<br />

Projeto para demonstrar o uso do Bookshelf ORM<br />

É uma API com um CRUD:<br />

Users<br />

GET /users - fetch all users<br />
POST /users - create a new user<br />
GET /users/:id - fetch a single user by id<br />
PUT /users/:id - update user<br />
DELETE /users/:id - delete user<br />

Categories<br />

GET /categories - fetch all categories<br />
POST /categories - create a new category<br />
GET /categories/:id - fetch a single category<br />
PUT /categories/:id - update category<br />
DELETE /categories/:id - delete category<br />

Posts<br />

GET /posts - fetch all posts<br />
POST /posts - create a new post<br />
GET /posts/:id - fetch a single post by id<br />
PUT /posts/:id - update post<br />
DELETE /posts/:id - delete post<br />
GET /posts/category/:id - fetch all posts from a single category<br />
GET /posts/tags/:slug - fetch all posts from a single tag<br />
