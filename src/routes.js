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
  getUserPhoto,
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
      auth: 'user',
    },
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
    },
  },
  {
    method: 'PUT',
    path: '/users/change-password',
    handler: changePassword,
    options: {
      auth: 'user',
      validate: {
        payload: Joi.object({
          oldPassword: Joi.string().min(8).max(15).required()
            .messages({
              'string.base': 'old password must be string',
              'string.min': 'old password must 8 - 15 character',
              'string.max': 'old password must 8 - 15 character',
              'any.required': 'old password is required',
            }),
          newPassword: Joi.string().min(8).max(15).required()
            .messages({
              'string.base': 'new password must be string',
              'string.min': 'new password must 8 - 15 character',
              'string.max': 'new password must 8 - 15 character',
              'any.required': 'new password is required',
            }),
        }),
      },
    },
  },

  {
    method: 'POST',
    path: '/auth/signin',
    handler: signIn,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required().messages({
            'string.base': 'email must be string',
            'string.email': 'email invalid',
            'any.required': 'email is required',
          }),
          password: Joi.string().min(8).max(15).required()
            .messages({
              'string.base': 'password must be string',
              'string.min': 'password must 8 - 15 character',
              'string.max': 'password must 8 - 15 character',
              'any.required': 'password is required',
            }),
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
          name: Joi.string().required().messages({
            'string.base': 'name must be string',
            'any.required': 'name is required',
          }),
          username: Joi.string().alphanum().required().messages({
            'string.base': 'username must be string',
            'string.alphanum': 'username must be letters and number',
            'any.required': 'username is required',
          }),
          email: Joi.string().email().required().messages({
            'string.base': 'email must be string',
            'string.email': 'email invalid',
            'any.required': 'email is required',
          }),
          password: Joi.string().min(8).max(15).required()
            .messages({
              'string.base': 'password must be string',
              'string.min': 'password must 8 - 15 character',
              'string.max': 'password must 8 - 15 character',
              'any.required': 'password is required',
            }),
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
          title: Joi.string().required().messages({
            'string.base': 'title must be string',
            'any.required': 'title is required',
          }),
          image: Joi.object({
            data: Joi.binary().required().messages({
              'any.binary': 'image must be file',
              'any.required': 'image is required',
            }),
          }),
          source: Joi.string().required().messages({
            'string.base': 'source must be string',
            'any.required': 'source is required',
          }),
          category: Joi.string().required().messages({
            'string.base': 'category must be string',
            'any.required': 'category is required',
          }),
          content: Joi.string().required().messages({
            'string.base': 'content must be string',
            'any.required': 'content is required',
          }),
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
      validate: {
        payload: Joi.object({
          title: Joi.string().required().messages({
            'string.base': 'title must be string',
            'any.required': 'title is required',
          }),
          image: Joi.object({
            data: Joi.binary().messages({
              'any.binary': 'image must be file',
            }),
          }),
          source: Joi.string().required().messages({
            'string.base': 'source must be string',
            'any.required': 'source is required',
          }),
          category: Joi.string().required().messages({
            'string.base': 'category must be string',
            'any.required': 'category is required',
          }),
          content: Joi.string().required().messages({
            'string.base': 'content must be string',
            'any.required': 'content is required',
          }),
        }),
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
          text: Joi.string().required().messages({
            'string.base': 'text must be string',
            'any.required': 'text is required',
          }),
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
      validate: {
        payload: Joi.object({
          text: Joi.string().required().messages({
            'string.base': 'text must be string',
            'any.required': 'text is required',
          }),
        }),
      },
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
