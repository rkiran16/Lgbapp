const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let error
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, '5d4df5dd4827741bf97ed038somexqwvysupersecretsecretlgbtwentynineteen');
  } catch (err) {
    error = err
    error.statusCode = 500;
    throw error;
  }
  if (!decodedToken) {
    error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.idToken = decodedToken._id;
  req.userToken = decodedToken.recId
  next();
};
