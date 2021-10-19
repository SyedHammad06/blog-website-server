const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');

    const { _id } = await jwt.decode(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id, 'tokens.token': token });

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Access Denied!!' });
  }
};

module.exports = auth;
