const db = require('../../data/dbConfig');

exports.findBy = filter => {
  return db('users')
    .where(filter);
}

exports.add = async (user) => {
  const [id] = await db('users').insert(user);
  return this.findBy('id', id).first();
}