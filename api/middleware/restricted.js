const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secrets');

module.exports = async (req, res, next) => {
  /*
  IMPLEMENT
  
    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
    the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
  if (req.headers.authorization == null) {
    res.status(401).json({ message: 'token required' });
    return;
  }

  try {
    const decodedJwt = await jwt.verify(req.headers.authorization, JWT_SECRET);
  } catch(err) {
    res.status(401).json({ message: 'token invalid' });
    return;
  }

  next();
};
