const verifyUser = {
  keys: process.env.SECRET_KEY,
  verify: {
    aud: false,
    iss: false,
    sub: false,
    nbf: false,
    exp: false,
  },
  validate: () => {
    const isValid = true;
    return { isValid };
  },
};

const verifyAdmin = {
  keys: process.env.SECRET_KEY,
  verify: {
    aud: false,
    iss: false,
    sub: false,
    nbf: false,
    exp: false,
  },
  validate: (artifacts) => {
    const isValid = artifacts.decoded.payload.email === 'admin@eduklimair.com';
    return { isValid };
  },
};

module.exports = { verifyUser, verifyAdmin };
