const JWT = require('@hapi/jwt');
const sharp = require('sharp');
const mongoose = require('mongoose');
const {
  User, Article, Comment, Images,
} = require('./models');

const signIn = async (request, h) => {
  try {
    const { email, password } = request.payload;
    const match = await User.findOne({ email, password });

    if (!match) {
      return h.response({
        error: true,
        message: 'Email or password wrong',
      }).code(401);
    }

    const { id, name } = match;
    const token = JWT.token.generate(
      { id, name, email },
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
    const user = await User.findOne({ $or: { username, email } });
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

const getAllArticles = async (request, h) => {
  try {
    const { title, category } = request.query;
    const query = {};
    if (title) {
      query.title = { title: { $regex: title, $options: 'i' } };
    }
    if (category) {
      query.category = category;
    }
    const articles = await Article.find(query);
    return h
      .response({
        error: false,
        data: articles,
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
    const { id } = request.params;
    const article = await Article.findById(id);
    if (!article) {
      return h
        .response({
          error: true,
          message: 'article not found',
        })
        .code(404);
    }
    return h
      .response({
        error: false,
        data: article,
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

    const small = await sharp(image.hapi.path)
      .resize(480)
      .jpeg({})
      .toBuffer();
    const large = await sharp(image.hapi.path)
      .resize(800)
      .jpeg({})
      .toBuffer();
    const images = new Images({ small, large });
    const { id } = await images.save();

    const newArticle = new Article({title, source, content, category, imageId: id})
    const article = await newArticle.save()

    return h
      .response({
        error: false,
        data: {article},
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
    const { id } = request.params
    const {
      title, image, source, content, category,
    } = request.payload;

    let imageId
    if (image) {
      const small = await sharp(image.hapi.path)
        .resize(480)
        .jpeg({})
        .toBuffer();
      const large = await sharp(image.hapi.path)
        .resize(800)
        .jpeg({})
        .toBuffer();
      const images = new Images({ small, large });
      const savedImages = await images.save();
      imageId = savedImages.id
    }

    const article = Article.findByIdAndUpdate(id, {title, source, content, category, imageId}, {new: true})
    return h
      .response({
        error: false,
        data: {article},
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
    const { id } = request.params;
    const article = await Article.findByIdAndRemove(id);
    if (!article) {
      return h
        .response({
          error: true,
          message: 'article not found',
        })
        .code(404);
    }
    Images.deleteOne({_id: article.imageId})
    return h
      .response({
        error: false,
        message: 'article deleted',
      })
      .code(200);
  } catch (e) {
    console.error(e)
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
  session.startSession();

  try {
    const { id } = request.payload;
    const decoded = JWT.decode(request.header.authorization.split(' ')[1]);
    const article = await Article.findByIdAndUpdate(
      id,
      {
        $addToSet: { like: decoded.username },
        $pull: { like: decoded.username },
      },
      { new: true, upsert: true, session },
    );
    if (!article) {
      return h
        .response({
          error: true,
          message: 'article not found',
        })
        .code(404);
    }
    await session.commitTransaction();
    if (article.like.inludes(decoded.username)) {
      return h
        .response({
          error: false,
          data: { like: article.like.length },
          message: 'article liked',
        })
        .code(200);
    }
    return h
      .response({
        error: false,
        data: { like: article.like.length },
        message: 'article unliked',
      })
      .code(200);
  } catch (e) {
    session.abortTransaction();
    console.error(e)
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
    const { articleId, text } = request.payload;
    const article = await Article.findById(articleId)
    if (!article) {
      return h
        .response({
          error: true,
          message: 'article not found',
        })
        .code(404);
    }
    const { username } = JWT.decode(request.header.authorization.split(' ')[1]);
    const comment = new Comment({ articleId, username, text });
    await comment.save();

    return h
      .response({
        error: false,
        message: 'success',
      })
      .code(200);
  } catch (e) {
    console.error(e)
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
  session.startSession();

  try {
    const { id } = request.payload;
    const decoded = JWT.decode(request.header.authorization.split(' ')[1]);
    const comment = await Comment.findByIdAndUpdate(
      id,
      {
        $addToSet: { like: decoded.username },
        $pull: { like: decoded.username, dislike: decoded.username },
      },
      { new: true, upsert: true, session },
    );
    if (!comment) {
      return h
        .response({
          error: true,
          message: 'comment not found',
        })
        .code(404);
    }
    await session.commitTransaction();
    if (comment.like.inludes(decoded.username)) {
      return h
        .response({
          error: false,
          data: { like: comment.like.length },
          message: 'comment liked',
        })
        .code(200);
    }
    return h
      .response({
        error: false,
        data: { like: comment.like.length },
        message: 'comment neutral',
      })
      .code(200);
  } catch (e) {
    session.abortTransaction();
    console.error(e)
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
  session.startSession();

  try {
    const { id } = request.payload;
    const decoded = JWT.decode(request.header.authorization.split(' ')[1]);
    const comment = await Comment.findByIdAndUpdate(
      id,
      {
        $addToSet: { dislike: decoded.username },
        $pull: { like: decoded.username, dislike: decoded.username },
      },
      { new: true, upsert: true, session },
    );
    if (!comment) {
      return h
        .response({
          error: true,
          message: 'comment not found',
        })
        .code(404);
    }
    await session.commitTransaction();
    if (comment.dislike.inludes(decoded.username)) {
      return h
        .response({
          error: false,
          data: { dislike: comment.like.length },
          message: 'comment liked',
        })
        .code(200);
    }
    return h
      .response({
        error: false,
        data: { dislike: comment.dislike.length },
        message: 'comment neutral',
      })
      .code(200);
  } catch (e) {
    session.abortTransaction();
    console.error(e)
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

const smallImage = async (request, h) => {
  try {
    const {id} = request.params
    const image = await Images.findById(id, 'small')
    if (!image) {
      return h
        .response({
          error:true,
          message: 'image not found'
        })
        .code(404)
    }
    return h
      .response(image.small)
      .type('image/jpeg')
      .code(200)
  } catch(e) {
    console.error(e)
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
}

const largeImage = async (request, h) => {
  try {
    const {id} = request.params
    const image = await Images.findById(id, 'large')
    if (!image) {
      return h
        .response({
          error:true,
          message: 'image not found'
        })
        .code(404)
    }
    return h
      .response(image.large)
      .type('image/jpeg')
      .code(200)
  } catch(e) {
    console.error(e)
    return h
      .response({
        error: true,
        message: 'server error',
      })
      .code(500);
  }
}
module.exports = {
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
  largeImage
};
