/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
const JWT = require('@hapi/jwt');
const sharp = require('sharp');
const mongoose = require('mongoose');
const {
  User, Article, Comment, Images,
} = require('./models');

const signIn = async (request, h) => {
  try {
    const { email, password } = request.payload;
    const match = await User.findOne({ email, password }).lean();
    if (!match) {
      return h.response({
        error: true,
        message: 'Email or password wrong',
      }).code(401);
    }
    const { name, username } = match;
    const token = JWT.token.generate(
      {
        name, username, email,
      },
      { key: process.env.SECRET_KEY, algorithm: 'HS256' },
      { ttlSec: 7 * 24 * 60 * 60 }, // 1 week
    );

    return h
      .response({
        error: false,
        data: { token },
        message: 'signin success',
      })
      .code(200);
  } catch (e) {
    console.error(e);

    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const signUp = async (request, h) => {
  try {
    const {
      name, username, email, password,
    } = request.payload;
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return h.response({
        error: true,
        message: 'email or username already exists',
      }).code(409);
    }
    const newUser = new User({
      name, username, email, password,
    });
    await newUser.save();

    return h.response({
      error: false,
      message: 'signup success',
    }).code(200);
  } catch (e) {
    console.error(e);
    return h.response({
      error: true,
      message: 'server error',
    }).code(500);
  }
};

const getUserProfile = async (request, h) => {
  try {
    const { username } = JWT.token.decode(request.headers.authorization.split(' ')[1]).decoded.payload;
    const user = (await User.findOne({ username }, { password: 0 })).toJSON();
    return h
      .response({
        error: false,
        data: { user },
        message: 'success',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};
const updateUserProfile = async (request, h) => {
  try {
    const { name, photo } = request.payload;
    const { username } = JWT.token.decode(request.headers.authorization.split(' ')[1]).decoded.payload;

    let imageId;
    if (photo) {
      const base = await sharp(photo._data)
        .png()
        .toBuffer();
      const small = await sharp(photo._data)
        .resize(320)
        .png()
        .toBuffer();
      const large = await sharp(photo._data)
        .resize(800)
        .png()
        .toBuffer();
      const images = new Images({ small, large, base });
      const savedImages = await images.save();
      imageId = savedImages.id;
    }

    const user = (await User.findOneAndUpdate({ username }, { name, imageId }, { password: 0 }))
      .toJSON();
    return h
      .response({
        error: false,
        data: { user },
        message: 'success update profile',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};
const changePassword = async (request, h) => {
  try {
    const { oldPassword, newPassword } = request.payload;
    const { username } = JWT.token.decode(request.headers.authorization.split(' ')[1]).decoded.payload;

    await User.findOneAndUpdate({ username, password: oldPassword }, { password: newPassword });
    return h
      .response({
        error: false,
        message: 'success update password',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const getUserFavorite = async (request, h) => {
  try {
    const { username } = JWT.token.decode(request.headers.authorization.split(' ')[1] || '').decoded.payload;
    const articles = (await Article.find({ like: { $in: [username] } }, {
      title: 1,
      content: {
        $substr: ['$content', 0, 200],
      },
      category: 1,
      imageId: 1,
      timestamp: 1,
    }).sort({ timestamp: -1 })).map((article) => article.toJSON());

    return h
      .response({
        error: false,
        data: { articles },
        message: 'success',
      })
      .code(200);
  } catch (e) {
    console.log(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const getUserPhoto = async (request, h) => {
  try {
    const { username } = request.params;
    const user = (await User.findOne({ username })).toJSON();
    if (!user) {
      return h
        .response({
          error: true,
          message: 'user not found',
        })
        .code(404);
    }
    const image = await Images.findById(user.imageId, 'small -_id');
    if (!image) {
      return h
        .response({
          error: true,
          message: 'image not found',
        })
        .code(404);
    }
    return h
      .response(image.small)
      .type('image/png')
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const getAllArticles = async (request, h) => {
  try {
    const { title, category } = request.query;
    const query = {};
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    const articles = (await Article.find(query, {
      title: 1,
      content: {
        $substr: ['$content', 0, 200],
      },
      category: 1,
      imageId: 1,
      timestamp: 1,
    }).sort({ timestamp: -1 })).map((article) => article.toJSON());

    return h
      .response({
        error: false,
        data: { articles },
        message: 'success',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const getArticleById = async (request, h) => {
  try {
    const { articleId } = request.params;
    const authorized = request.headers.authorization;
    let article = await Article.findById(articleId);
    if (!article) {
      return h
        .response({
          error: true,
          message: 'article not found',
        })
        .code(404);
    }
    article = article.toJSON();
    let listComments = await Comment.find({ articleId });
    listComments = listComments.map((comment) => {
      const commentJson = comment.toJSON();
      delete commentJson.articleId;
      return commentJson;
    });
    const comments = listComments.filter((comment) => !comment.reply);
    const commentReply = listComments.filter((comment) => comment.reply);

    let username;
    if (authorized) {
      const { payload } = JWT.token.decode(authorized.split(' ')[1] || '').decoded;
      username = payload.username;
    }

    article.isLiked = false;
    if (article.like.includes(username)) {
      article.isLiked = true;
    }
    article.comments = comments.map((comment) => ({
      ...comment,
      like: comment.like.length,
      dislike: comment.dislike.length,
      state: username && (comment.like.includes(username) || comment.dislike.includes(username)) ? (comment.like.includes(username) ? 'liked' : 'disliked') : '',
      replies: commentReply
        .filter((replies) => replies.reply.id === comment.id)
        .map((repl) => ({
          ...repl,
          reply: repl.reply.username,
          like: repl.like.length,
          dislike: repl.dislike.length,
          state: username && (repl.like.includes(username) || repl.dislike.includes(username)) ? (repl.like.includes(username) ? 'liked' : 'disliked') : '',
        })),
    }));

    article.like = article.like.length;
    return h
      .response({
        error: false,
        data: { article },
        message: 'success',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const addArticle = async (request, h) => {
  try {
    const {
      title, image, source, content, category,
    } = request.payload;

    const base = await sharp(image._data)
      .png()
      .toBuffer();
    const small = await sharp(image._data)
      .resize(480)
      .png()
      .toBuffer();
    const large = await sharp(image._data)
      .resize(800)
      .png()
      .toBuffer();
    const images = new Images({ small, large, base });
    const { id } = await images.save();
    const newArticle = new Article({
      title, source, content, category, imageId: id,
    });
    const article = (await newArticle.save()).toJSON();
    article.like = 0;
    article.isLiked = false;

    return h
      .response({
        error: false,
        data: { article },
        message: 'success add article',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const updateArticle = async (request, h) => {
  try {
    const { articleId } = request.params;
    const {
      title, image, source, content, category,
    } = request.payload;

    let imageId;
    if (image) {
      const base = await sharp(image._data)
        .png()
        .toBuffer();
      const small = await sharp(image._data)
        .resize(480)
        .png()
        .toBuffer();
      const large = await sharp(image._data)
        .resize(800)
        .png()
        .toBuffer();
      const images = new Images({ small, large, base });
      const savedImages = await images.save();
      imageId = savedImages.id;
    }

    const article = (await Article.findByIdAndUpdate(articleId, {
      title, source, content, category, imageId,
    }, { new: true })).toJSON();
    return h
      .response({
        error: false,
        data: { article: { ...article, like: article.like.length } },
        message: 'success update article',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const deleteArticle = async (request, h) => {
  try {
    const { articleId } = request.params;
    const article = (await Article.findByIdAndRemove(articleId)).toJSON();
    if (!article) {
      return h
        .response({
          error: true,
          message: 'article not found',
        })
        .code(404);
    }
    await Images.deleteOne({ _id: article.imageId });
    await Comment.deleteMany({ articleId });
    return h
      .response({
        error: false,
        data: { article },
        message: 'article deleted',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const likeArticle = async (request, h) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { articleId } = request.params;
    const { payload } = JWT.token.decode(request.headers.authorization.split(' ')[1]).decoded;
    const article = await Article.findById(articleId).session(session);
    if (!article) {
      return h
        .response({
          error: true,
          message: 'article not found',
        })
        .code(404);
    }
    let isLiked;
    if (article.like.includes(payload.username)) {
      article.like = article.like.filter((username) => username !== payload.username);
    } else {
      isLiked = true;
      article.like.push(payload.username);
    }
    const articleLike = await article.save({ session });
    await session.commitTransaction();
    if (isLiked) {
      return h
        .response({
          error: false,
          data: { like: articleLike.like.length },
          message: 'article liked',
        })
        .code(200);
    }
    return h
      .response({
        error: false,
        data: { like: articleLike.like.length },
        message: 'article unliked',
      })
      .code(200);
  } catch (e) {
    session.abortTransaction();
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  } finally {
    session.endSession();
  }
};

const addComment = async (request, h) => {
  try {
    const { articleId } = request.params;
    const { text } = request.payload;
    const article = await Article.findById(articleId);
    if (!article) {
      return h
        .response({
          error: true,
          message: 'article not found',
        })
        .code(404);
    }
    const { username } = JWT.token.decode(request.headers.authorization.split(' ')[1]).decoded.payload;
    const comment = new Comment({ articleId, username, text });
    await comment.save();

    return h
      .response({
        error: false,
        data: { comment },
        message: 'success',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const likeComment = async (request, h) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { commentId } = request.params;
    const { payload } = JWT.token.decode(request.headers.authorization.split(' ')[1]).decoded;

    const comment = await Comment.findById(commentId).session(session);
    if (!comment) {
      return h
        .response({
          error: true,
          message: 'comment not found',
        })
        .code(404);
    }
    const isLiked = !comment.like.includes(payload.username);
    comment.dislike = comment.dislike.filter((username) => username !== payload.username);
    if (isLiked) {
      comment.like = [...comment.like, payload.username];
    } else {
      comment.like = comment.like.filter((username) => username !== payload.username);
    }

    const commentLike = await comment.save({ session });
    await session.commitTransaction();
    if (isLiked) {
      return h
        .response({
          error: false,
          data: { like: commentLike.like.length },
          message: 'comment liked',
        })
        .code(200);
    }
    return h
      .response({
        error: false,
        data: { like: commentLike.like.length },
        message: 'comment neutral',
      })
      .code(200);
  } catch (e) {
    session.abortTransaction();
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  } finally {
    session.endSession();
  }
};

const dislikeComment = async (request, h) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { commentId } = request.params;
    const { payload } = JWT.token.decode(request.headers.authorization.split(' ')[1]).decoded;

    const comment = await Comment.findById(commentId).session(session);
    if (!comment) {
      return h
        .response({
          error: true,
          message: 'comment not found',
        })
        .code(404);
    }
    const isDisliked = !comment.dislike.includes(payload.username);
    comment.like = comment.like.filter((username) => username !== payload.username);
    if (isDisliked) {
      comment.dislike = [...comment.dislike, payload.username];
    } else {
      comment.dislike = comment.dislike.filter((username) => username !== payload.username);
    }
    const commentDislike = await comment.save({ session });
    await session.commitTransaction();
    if (isDisliked) {
      return h
        .response({
          error: false,
          data: { dislike: commentDislike.dislike.length },
          message: 'comment disliked',
        })
        .code(200);
    }
    return h
      .response({
        error: false,
        data: { dislike: commentDislike.dislike.length },
        message: 'comment neutral',
      })
      .code(200);
  } catch (e) {
    session.abortTransaction();
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  } finally {
    session.endSession();
  }
};

const commentReply = async (request, h) => {
  try {
    const { articleId, commentId } = request.params;
    const { payload } = JWT.token.decode(request.headers.authorization.split(' ')[1]).decoded;
    const comment = await Comment.findOne({ articleId, _id: commentId });
    if (!comment) {
      return h
        .response({
          error: true,
          message: 'comment not found',
        })
        .code(404);
    }
    const { text } = request.payload;
    const replyComment = new Comment({
      articleId,
      text,
      username: payload.username,
      reply: { id: commentId, username: comment.username },
    });
    await replyComment.save();
    return h
      .response({
        error: false,
        data: { comment: replyComment },
        message: 'comment replied',
      })
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const smallImage = async (request, h) => {
  try {
    const { imageId } = request.params;
    const image = await Images.findById(imageId, 'small -_id');
    if (!image) {
      return h
        .response({
          error: true,
          message: 'image not found',
        })
        .code(404);
    }
    return h
      .response(image.small)
      .type('image/png')
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const baseImage = async (request, h) => {
  try {
    const { imageId } = request.params;
    const image = await Images.findById(imageId, 'base -_id');
    if (!image) {
      return h
        .response({
          error: true,
          message: 'image not found',
        })
        .code(404);
    }
    return h
      .response(image.base)
      .type('image/png')
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};

const largeImage = async (request, h) => {
  try {
    const { imageId } = request.params;
    const image = await Images.findById(imageId, 'large -_id');
    if (!image) {
      return h
        .response({
          error: true,
          message: 'image not found',
        })
        .code(404);
    }
    return h
      .response(image.large)
      .type('image/png')
      .code(200);
  } catch (e) {
    console.error(e);
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
};
module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserFavorite,
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
};
