/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const user = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  imageId: {
    type: String,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: {
    versionKey: false,
    transform: (doc, ret) => {
      const { _id, ...rest } = ret;
      return { id: _id, ...rest };
    },
  },
});

const comment = new mongoose.Schema({
  articleId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  like: [String],
  dislike: [String],
  reply: Object,
}, {
  toJSON: {
    versionKey: false,
    transform: (doc, ret) => {
      const { _id, ...rest } = ret;
      return { id: String(_id), ...rest };
    },
  },
});

const article = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  imageId: {
    type: String,
    required: true,
  },
  like: [String],
  category: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: {
    versionKey: false,
    transform: (doc, ret) => {
      const { _id, ...rest } = ret;
      return { id: _id, ...rest };
    },
  },
});

const image = new mongoose.Schema({
  small: {
    type: Buffer,
    required: true,
  },
  base: {
    type: Buffer,
    required: true,
  },
  large: {
    type: Buffer,
    required: true,
  },
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
  },
});

const User = mongoose.model('user', user);
const Article = mongoose.model('article', article);
const Comment = mongoose.model('comment', comment);
const Images = mongoose.model('image', image);

module.exports = {
  User, Article, Comment, Images,
};
