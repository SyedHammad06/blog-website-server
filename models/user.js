const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema({
  username: {
    type: 'String',
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: 'String',
    trim: true,
    required: true,
  },
  email: {
    unique: true,
    type: 'String',
    trim: true,
    required: true,
  },
  tokens: [
    {
      token: {
        type: 'String',
        required: true,
      },
    },
  ],
});

schema.statics.verifyUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('Username or password is invalid!!');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Username or password is invalid!!');
  }
  return user;
};

schema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  const { password, tokens, ...newUser } = userObj;

  return newUser;
};

schema.methods.generateAuthToken = async function () {
  const user = this;
  const token = await jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: '60min',
    }
  );

  user.tokens = user.tokens.filter((el) => {
    try {
      jwt.verify(el.token, process.env.JWT_SECRET);
      return true;
    } catch (err) {
      return false;
    }
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

schema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password'))
    user.password = await bcrypt.hash(user.password, 8);
  next();
});

const User = new mongoose.model('users', schema);

module.exports = User;
