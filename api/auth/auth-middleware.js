const bcrypt = require('bcryptjs');
const User = require('./auth-model');

exports.checkBody = requiredFields => (req, res, next) => {
  requiredFields.forEach(field => {
    if (req.body[field] == null) {
      res.status(400).json({ message: 'username and password required' });
      return;
    }
  })
  // for(const field in requiredFields) {
  //   if (req.body[field] == null) {
  //     res.status(400).json({ message: 'username and password required' });
  //     return;
  //   }
  // }
  next();
}

exports.checkUsernameAvailable = async (req, res, next) => {
  const { username } = req.body;

  const results = await User.findBy({ username });
  if (results.length > 0) {
    res.status(400).json({ message: 'username taken' });
    return;
  }
  next();
}

exports.checkCredentials = async (req, res, next) => {
  const { username, password } = req.body;

  try{
    const user = await User.findBy({ username }).first();
    if (user == null || !bcrypt.compareSync(password, user.password)) {
      res.status(400).json({ message: 'invalid credentials' });
      return;
    } else {
      req.user = user;
    }
  } catch(err) {
    res.status(500).json({ message: err.message });
    return;
  }

  next();
}