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
  registeredAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
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
  date: {
    type: Date,
    default: Date.now,
  },
  like: {
    type: Array,
  },
  dislike: {
    type: Array,
  },
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
  },
});

const article = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  imageId: {
    type: String,
    required: true,
  },
  like: {
    type: Array,
  },
  category: {
    type: String,
    default: 'water', // water || climate
  },
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
  },
});

const image = new mongoose.Schema({
  small: {
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
