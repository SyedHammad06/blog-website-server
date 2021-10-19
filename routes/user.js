const express = require('express');

const User = require('../models/user');
const auth = require('../authentication/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const user = await User(req.body);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    if (err.message.slice(0, 6) === 'E11000') {
      return res.status(409).send({ error: 'Username already exists!!' });
    }
    res.status(400).send({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.verifyUser(req.body.username, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/logout', auth, async (req, res) => {
  try {
    const user = req.user;
    user.tokens = user.tokens.filter((token) => token.token !== req.token);
    await user.save();
    res.send({ success: true });
  } catch (err) {
    res.status(404).send({ error: 'Already logged out!!' });
  }
});

router.delete('/user-delete', auth, async (req, res) => {
  try {
    await req.user.delete();
    res.send({ success: true });
  } catch (err) {
    res.status(404).send({ error: 'User not found!!' });
  }
});

module.exports = router;
