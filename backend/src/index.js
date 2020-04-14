const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');
const cors = require('cors');

const server = createServer();

server.express.use(cors());

server.express.use(cookieParser());

server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  };
  next();
});

server.express.use(async (req, res, next) => {
  if (!req.userId) { return next(); }
  const user = await db.query.user(
    { where: { id: req.userId } },
    '{ id, name, email, permissions }'
  );
  req.user = user;
  next();
});

server.start(deets => {
  console.log(`server is running on http://localhost:${deets.port}`);
});