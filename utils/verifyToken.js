const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('token');

  //console.log("ArquivoVerifyToken");
  //console.log(token);

  if (!token) {
    return res.status(401).send('Access Denied');
  }

  try {
      const verified = jwt.verify(token, process.env.TOKEN_SECRET);
      req.user = verified;
      next();
  } catch(err) {
      res.status(400).send('Invalid Token')
  }
}

module.exports = auth;
