const bcrypt = require("bcryptjs");
const jwt = require("../services/jwt");
const User = require("../models/user");

const saltRounds = 10;

function signUp(req, res) {
  const user = new User();

  const { username, password, repeatPassword } = req.body;
  user.username = username.toLowerCase();
  user.active = false;

  // console.log(req.body);

  if (!password || !repeatPassword) {
    res.status(404).send({ message: "Las contraseñas son obligatorias." });
  } else {
    if (password !== repeatPassword) {
      res.status(404).send({ message: "Las contraseñas no son iguales." });
    } else {
      // bcrypt.genSalt(saltRounds, function (err, salt) {
      //   bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {

      //   });
      // });
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          res
            .status(500)
            .send({ message: "Error al encriptar la contraseña." });
        } else {
          user.password = hash;

          user.save((err, userStored) => {
            if (err) {
              res
                .status(500)
                .send({ code: 500, message: "El usuario ya existe." });
            } else {
              if (!userStored) {
                res
                  .status(400)
                  .send({ code: 400, message: "Error al crear el usuario." });
              } else {
                res.status(200).send({
                  code: 200,
                  message: "Usuario creado correctamente.",
                  user: userStored,
                });
              }
            }
          });
        }
      });
    }
  }
}

function signIn(req, res) {
  const params = req.body;
  const username = params.username.toLowerCase();
  const password = params.password;

  User.findOne({ username }, (err, userStored) => {
    //PARA ENCONTRAR UN USUARIO METODO "findOne"
    if (err) {
      res.status(500).send({ code: 500, message: "Error del Servidor." });
    } else {
      if (!userStored) {
        //USER STORED ALMACENA LA INFORMACION DEL USUARIO
        res.status(404).send({ code: 404, message: "Usuario no encontrado." });
      } else {
        bcrypt.compare(password, userStored.password, (err, check) => {
          //COMPARANDO LA CONTRASEÑA RECIBIDA CON LA DE LA DE BASE DE DATOS ENCRIPTADA
          if (err) {
            res.status(500).send({ code: 500, message: "Error del Servidor." });
          } else if (!check) {
            res
              .status(404)
              .send({ code: 404, message: "La contraseña es incorrecta." });
          } else {
            if (!userStored.active) {
              res
                .status(200)
                .send({ code: 200, message: "El usuario no se ha activado." });
            } else {
              res.status(200).send({
                code: 200,
                message: "El usuario es correcto",
                accessToken: jwt.createAccessToken(userStored),
                refreshToken: jwt.createRefreshToken(userStored),
              });
            }
          }
        });
      }
    }
  });
}

function getUsers(req, res) {
  User.find()
    .then((users) => {
      if (!users) {
        res
          .status(404)
          .send({ message: "No se ha encontrado ningun usuario." });
      } else {
        res.status(200).send({ users });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error del servidor: " + err });
    });
}

function getUsersActive(req, res) {
  const query = req.query; //OBTENEMOS LO QUE MANDAMOS EN LA PETICION

  User.find({
    active: query.active, //INDICAMOS QUE BUSQUE LOS USUARIOS QUE TENGAN EL VALOR DE ACTIVE EN TRUE O FALSE, en la URl se manda http://localhost:3977/api/v1/users-active?active=false o puede tener tambien el valor de true
  })
    .then((users) => {
      if (!users) {
        res
          .status(404)
          .send({ message: "No se ha encontrado ningun usuario." });
      } else {
        res.status(200).send({ users });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error del servidor: " + err });
    });
}

async function updateUser(req, res) {
  var userData = req.body;

  userData.email = req.body.email.toLowerCase();

  if (userData.password) {
    await bcrypt
      .hash(userData.password, saltRounds)
      .then((hash) => {
        userData.password = hash;
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: "Error al encriptar la contraseña. " + err });
      });
  }

  const params = req.params;

  User.findByIdAndUpdate({ _id: params.id }, userData, (err, userUpdate) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!userUpdate) {
        res
          .status(404)
          .send({ message: "No se ha encontrado ningun usuario." });
      } else {
        res.status(200).send({ message: "Usuario actualizado correctamente." });
      }
    }
  });
}

function activeUser(req, res) {
  const { id } = req.params;
  const { active } = req.body;

  User.findByIdAndUpdate({ _id: id }, { active }, (err, userStored) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!userStored) {
        res.status(404).send({ message: "No se ha encontrado el usuario." });
      } else {
        if (active === true) {
          res.status(200).send({ message: "Usuario activado correctamente." });
        } else {
          res
            .status(200)
            .send({ message: "Usuario desactivado correctamente." });
        }
      }
    }
  });
}

function deleteUser(req, res) {
  const { id } = req.params;

  User.findByIdAndRemove(id, (err, userDeleted) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!userDeleted) {
        res.status(400).send({ message: "El usuario no se ha encontrado." });
      } else {
        res.status(200).send({
          message: "El usuario ha sido eliminado correctamente.",
          user: userDeleted,
        });
      }
    }
  });
}

function signUpAdmin(req, res) {
  const user = new User();

  const { name, lastname, email, role, password } = req.body;

  user.name = name;
  user.lastname = lastname;
  user.email = email.toLowerCase();
  user.role = role;
  user.active = true;

  if (!password) {
    res.status(500).send({ message: "La contraseña es obligatoria." });
  } else {
    bcrypt
      .hash(password, saltRounds)
      .then((hash) => {
        user.password = hash;

        user.save((err, userStored) => {
          if (err) {
            res.status(500).send({ message: "El usuario ya existe." });
          } else {
            if (!userStored) {
              res.status(500).send({ message: "No se pudo crear al usuario." });
            } else {
              res.status(200).send({
                message: "Usuario creado correctamente.",
                user: userStored,
              });
            }
          }
        });
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: "La contraseña no se pudo encriptar." });
      });
  }
}

module.exports = {
  signUp,
  signIn,
  getUsers,
  getUsersActive,
  updateUser,
  activeUser,
  deleteUser,
  signUpAdmin,
};
