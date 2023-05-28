const Joi = require('joi');
const {
  signIn,
  signUp,
  getAllArticles,
  getArticleById,
  addArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  addComment,
  likeComment,
  dislikeComment,
  smallImage,
  largeImage,
} = require('./handler');

const routes = [
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: './src/public',
      },
    },
  },

  {
    method: 'GET',
    path: '/users',
    handler: () => ({ message: 'success' }),
    options: {
      auth: 'admin',
    },
  },
  {
    method: 'POST',
    path: '/users/signin',
    handler: signIn,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().min(8).max(15).required(),
        }),
      },
    },
  },
  {
    method: 'POST',
    path: '/users/signup',
    handler: signUp,
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(8).max(15).required(),
        }),
      },
    },
  },

  {
    method: 'GET',
    path: '/articles',
    handler: getAllArticles,
  },
  {
    method: 'GET',
    path: '/articles/{id}',
    handler: getArticleById,
  },
  {
    method: 'POST',
    path: '/articles',
    handler: addArticle,
    options: {
      auth: 'admin',
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data',
        uploads: './uploads',
      },
    },
  },
  {
    method: 'PUT',
    path: '/articles/{id}',
    handler: updateArticle,
    options: {
      auth: 'admin',
    },
  },
  {
    method: 'DELETE',
    path: '/articles/{id}',
    handler: deleteArticle,
    options: {
      auth: 'admin',
    },
  },
  {
    method: 'POST',
    path: '/articles/{id}/like',
    handler: likeArticle,
    options: {
      auth: 'user',
    },
  },

  {
    method: 'POST',
    path: '/comments',
    handler: addComment,
    options: {
      auth: 'user',
      validate: {
        payload: Joi.object({
          articleId: Joi.string().required(),
          text: Joi.string().strip().min(1).required(),
        }),
      },
    },
  },
  {
    method: 'POST',
    path: '/comments/{id}/like',
    handler: likeComment,
    options: {
      auth: 'user',
    },
  },
  {
    method: 'POST',
    path: '/comments/{id}/dislike',
    handler: dislikeComment,
    options: {
      auth: 'user',
    },
  },

  {
    method: 'GET',
    path: '/images/small/{id}',
    handler: smallImage
  },
  {
    method: 'GET',
    path: '/images/large/{id}',
    handler: largeImage
  },
];

module.exports = routes;
