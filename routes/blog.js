const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const Blog = require('../models/blog');
const auth = require('../authentication/auth');

const router = express.Router();

const upload = multer({
  limits: {
    fieldSize: 2000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(
        new Error('Please upload a image which is either png or jpg or jpeg')
      );
    }
    cb(undefined, true);
  },
});

router.post(
  '/upload',
  upload.single('profile'),
  async (req, res) => {
    try {
      const blog = await Blog.findOne({
        _id: req.query.id,
      });

      if (!req.file.buffer) {
        throw new Error('No image file found!!');
      }

      const buffer = await sharp(req.file.buffer).png().toBuffer();

      blog.image = buffer;
      blog.save();
      res.send({ success: true, blog });
    } catch (err) {
      console.log(err.message);
      res.status(400).send({ error: err.message });
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.get('/upload', async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.query.id,
    });

    if (!blog.image) {
      throw new Error('Image not found!!');
    }

    res.set('Content-Type', 'image/png');
    res.send(blog.image);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.post('/blog', auth, async (req, res) => {
  try {
    const body = {
      userID: req.user._id,
      ...req.body,
    };
    const blog = await Blog(body);
    await blog.save();
    res.send({ blog });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/blog', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ userID: req.user._id });
    res.send({ blogs });
  } catch (err) {
    res.status(404).send({ error: err.message });
  }
});

router.get('/specific-blog', async (req, res) => {
  try {
    const blog = await Blog.findById(req.query.id);
    res.send({ blog });
  } catch (err) {
    res.status(404).send({ error: err.message });
  }
});

router.get('/all-blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.send({ blogs });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete('/blog', auth, async (req, res) => {
  try {
    const blog = await Blog.findOne({
      userID: req.user._id,
      _id: req.query._id,
    });
    await blog.delete();
    res.send({ success: true });
  } catch (err) {
    res.status(409).send({ error: err.message });
  }
});

module.exports = router;
