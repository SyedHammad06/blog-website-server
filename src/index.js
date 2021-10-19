const express = require('express');
const cors = require('cors');

require('../db/mongoose');

const userRoutes = require('../routes/user');
const blogRoutes = require('../routes/blog');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use(userRoutes);
app.use(blogRoutes);

app.get('/', (req, res) => {
  res.send('Home route');
});

app.listen(port, () => console.log('Server running on ' + port));
