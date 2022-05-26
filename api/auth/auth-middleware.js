const User = require('./auth-model');

exports.checkBody = requiredFields => (req, res, next) => {
  for(let field in requiredFields) {
    if (req.body[field] == null) {
      res.status(400).json({ message: 'username and password required' });
      return;
    }
  }
  next();
}

exports.checkUsernameExists = async (req, res, next) => {
  const { username } = req.body;

  const results = await User.findBy({ username });
  if (results.length > 0) {
    res.status(400).json({ message: 'username taken' });
  }
}