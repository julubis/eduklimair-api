const Joi = require('joi');
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
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
  commentReply,
  smallImage,
  baseImage,
  largeImage,
  getUserPhoto
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
    method: 'GET',
    path: '/users/profile',
    handler: getUserProfile,
    options: {
      auth: 'user'
    }
  },
  {
    method: 'PUT',
    path: '/users/profile',
    handler: updateUserProfile,
    options: {
      auth: 'user',
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data',
      },
    }
  },
  {
    method: 'PUT',
    path: '/users/change-password',
    handler: changePassword,
    options: {
      auth: 'user'
    }
  },


  {
    method: 'POST',
    path: '/auth/signin',
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
    path: '/auth/signup',
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
    path: '/articles/{articleId}',
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
      },
      validate: {
        payload: Joi.object({
          title: Joi.string().required(),
          image: Joi.object({
            data: Joi.binary().required(),
            mimeType: Joi.string().valid('image/jpeg', 'image.png'),
          }),
          source: Joi.string().required(),
          category: Joi.string().required(),
          content: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: 'PUT',
    path: '/articles/{articleId}',
    handler: updateArticle,
    options: {
      auth: 'admin',
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data',
      },
    },
  },
  {
    method: 'DELETE',
    path: '/articles/{articleId}',
    handler: deleteArticle,
    options: {
      auth: 'admin',
    },
  },
  {
    method: 'POST',
    path: '/articles/{articleId}/likes',
    handler: likeArticle,
    options: {
      auth: 'user',
    },
  },

  {
    method: 'POST',
    path: '/articles/{articleId}/comments',
    handler: addComment,
    options: {
      auth: 'user',
      validate: {
        payload: Joi.object({
          text: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: 'POST',
    path: '/articles/{articleId}/comments/{commentId}/likes',
    handler: likeComment,
    options: {
      auth: 'user',
    },
  },
  {
    method: 'POST',
    path: '/articles/{articleId}/comments/{commentId}/dislikes',
    handler: dislikeComment,
    options: {
      auth: 'user',
    },
  },
  {
    method: 'POST',
    path: '/articles/{articleId}/comments/{commentId}/replies',
    handler: commentReply,
    options: {
      auth: 'user',
    },
  },

  {
    method: 'GET',
    path: '/images/small/{imageId}',
    handler: smallImage,
  },
  {
    method: 'GET',
    path: '/images/base/{imageId}',
    handler: baseImage,
  },
  {
    method: 'GET',
    path: '/images/large/{imageId}',
    handler: largeImage,
  },
  {
    method: 'GET',
    path: '/images/profile/{username}',
    handler: getUserPhoto,
  },
];

module.exports = routes;
