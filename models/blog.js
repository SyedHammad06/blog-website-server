const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userID: {
    type: String,
    trim: true,
    required: true,
  },
  title: {
    type: String,
    trim: true,
    required: true,
  },
  image: {
    type: Buffer,
  },
  author: {
    type: String,
    trim: true,
    required: true,
  },
  content: {
    type: String,
    trim: true,
    required: true,
  },
});

schema.methods.toJSON = function () {
  const blog = this;
  const blogObj = blog.toObject();

  const { image, ...newBlog } = blogObj;

  return newBlog;
};

const Blog = new mongoose.model('Blogs', schema);

module.exports = Blog;
