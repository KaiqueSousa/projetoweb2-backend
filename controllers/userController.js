const db = require("../config/db.config");
const User = db.user;
const sendgrid = require("@sendgrid/mail");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Cadastrar usuário
exports.userCreate = async (req, res) => {
  let user = null;
  try {
    user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
  } catch (err) {
    res.json({ message: err.message });
  }
  console.log(user == null)
  if (user != null) {
    return res.status(400).json({ message: "E-mail já cadastrado." });
  }

  try {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = Object.assign({}, req.body);
    newUser.password = hashedPassword;

    user = await User.create(newUser);
    const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });

    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    const message = {
      to: newUser.email,
      from: process.env.EMAIL_REMETENTE,
      subject: "Email de verificação de conta",
      text: "Para confirmar seu cadastro clique no link abaixo.",
      html: `<p>Olá ${user.username}! <a href="${process.env.HOST_URL}/confirmation?token=${token}"><b>Clique para confirmar seu cadastro</b></a></p>`,
    };
    await sendgrid
      .send(message)
      .then((res) => console.log(res))
      .catch((error) => console.log(error.message));

    res.json({ usuario: user.id, token: token });
  } catch (err) {
    res.json({ message: err.message });
  }
};

//Registrar user pela página de Admin
exports.userAdminCreate = async (req, res) => {
  let user = null;
  const isAdmin = req.header('isAdmin');
  
  if(isAdmin!=='true'){
    return res.status(401).send('Access Denied');
  }
  try {
    user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
  } catch (err) {
    res.json({ message: err.message });
  }
  console.log(user == null)
  if (user != null) {
    return res.status(400).json({ message: "E-mail já cadastrado." });
  }

  try {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = Object.assign({}, req.body);
    newUser.password = hashedPassword;

    user = await User.create(newUser);
    const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });

    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    const message = {
      to: newUser.email,
      from: process.env.EMAIL_REMETENTE,
      subject: "Email de verificação de conta",
      text: "Para confirmar seu cadastro clique no link abaixo.",
      html: `<p>Olá ${user.username}! <a href="${process.env.HOST_URL}/confirmation?token=${token}"><b>Clique para confirmar seu cadastro</b></a></p>`,
    };
    await sendgrid
      .send(message)
      .then((res) => console.log(res))
      .catch((error) => console.log(error.message));

    res.json({ usuario: user.id, token: token });
  } catch (err) {
    res.json({ message: err.message });
  }
};

// Confirmar usuário
exports.userConfirmation = async (req, res) => {
  const { token } = req.query;

  try {
    const { userId } = jwt.verify(token, process.env.TOKEN_SECRET);

    await User.update(
      { isVerified: true },
      {
        where: {
          id: userId,
        },
      }
    );

    return res.status(200).json({ message: "Usuário verificado com sucesso" });
  } catch (error) {
    return res.status(400).json({ message: "Token Inválido" });
  }
};

// Fazer login
exports.userLogin = async (req, res) => {
  let user = null;
  try {
    user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
  } catch (err) {
    res.json({ message: err.message });
  }
  const message = "E-mail ou senha inválidos.";
  if (user == null) {
    return res.status(400).json({ message: message });
  }
  if (!user.isVerified) {
    return res.status(400).json({ message: "Email não confirmado." });
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: message });
  }

  const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET);
  res.header("Token", token).json({ token: token, isAdmin: user.isAdmin });
};

exports.deleteUsersNonVerified = async () => {
  const dateNow = new Date();

  const users = await User.findAll({
    where: {
      isVerified: false,
    },
  });

  await Promise.all(
    users.map(async (user) => {
      const userCreatedDate = new Date(user.createdAt);

      if (
        dateNow.getHours() > userCreatedDate.getHours() &&
        dateNow.getMinutes() > userCreatedDate.getMinutes()
      ) {
        await User.destroy({
          where: {
            id: user.id,
          },
        });
      }
    })
  );

  console.log("Usuarios não verificados foram apagados");
};

exports.usersList = async (req, res) => {
  const isAdmin = req.header('isAdmin');
  
  if(isAdmin!=='true'){
    return res.status(401).send('Access Denied');
  }
  
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "isVerified","isAdmin"],
    });

    return res.status(200).json(users);
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  
  try {
    const user = await User.update(req.body, {
      where: {
        id: req.params.id
      }
    });
    res.status(204).send({ user: user });
  } catch (err) {
    res.send({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const isAdmin = req.header('isAdmin');
  
  if(isAdmin!=='true'){
    return res.status(401).send('Access Denied');
  }
  try {
    const user = await User.destroy({
      where: {
        id: req.params.id
      }
    });
    res.status(204).send({ user: user });
  } catch (err) {
    res.send({ message: err.message });
  }
};
