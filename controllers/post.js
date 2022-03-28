const Post = require("../models/post");

function addPost(req, res) {
  const body = req.body;
  const post = new Post(body);

  post.save((err, postStored) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor", err });
    } else {
      if (!postStored) {
        res.status(500).send({
          code: 400,
          message: "No se ha podido crear el Post",
          postStored,
        });
      } else {
        res.status(500).send({
          code: 200,
          message: "Post creado correctamente",
          postStored,
        });
      }
    }
  });
}

function getPosts(req, res) {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page,
    limit: parseInt(limit),
    sort: { date: "desc" },
  };

  Post.paginate({}, options, (err, postStored) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor", err });
    } else {
      if (!postStored) {
        res.status(404).send({
          code: 404,
          message: "No se ha encontrado ningún Post.",
          postStored,
        });
      } else {
        res.status(200).send({
          code: 200,
          message: "Posts obtenidos correctamente.",
          postStored,
        });
      }
    }
  });
}

function getPostsSprint(req, res) {
  const query = req.query; //OBTENEMOS LO QUE MANDAMOS EN LA PETICION

  Post.find({
    sprint: query.sprint, //INDICAMOS QUE BUSQUE LOS USUARIOS QUE TENGAN EL VALOR DE ACTIVE EN TRUE O FALSE, en la URl se manda http://localhost:3977/api/v1/users-active?active=false o puede tener tambien el valor de true
  })
    .then((posts) => {
      if (!posts) {
        res.status(404).send({
          code: 404,
          message: "No se ha encontrado ningun Post",
          posts,
        });
      } else {
        res.status(200).send({
          code: 200,
          message: `Posts obtenidos del sprint ${query.sprint} correctamente`,
          posts,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ code: 500, message: "Error del servidor.", err });
    });
}

function getAllPosts(req, res) {
  Post.find()
    .then((posts) => {
      if (!posts) {
        res.status(404).send({
          code: 404,
          message: "No se ha encontrado ningun Post",
          posts,
        });
      } else {
        res.status(200).send({
          code: 200,
          message: `Posts obtenidos correctamente`,
          posts,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ code: 500, message: "Error del servidor.", err });
    });
}

function updatePost(req, res) {
  const postData = req.body;
  const { id } = req.params;

  Post.findByIdAndUpdate(id, postData, (err, postUpdate) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor.", err });
    } else {
      if (!postUpdate) {
        res.status(404).send({
          code: 404,
          message: "No se ha encontrado ningún Post.",
          postUpdate,
        });
      } else {
        res.status(200).send({
          code: 200,
          message: "Post actualizado correctamente.",
          postUpdate,
        });
      }
    }
  });
}

function deletePost(req, res) {
  const { id } = req.params;

  Post.findByIdAndRemove(id, (err, postDeleted) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor.", err });
    } else {
      if (!postDeleted) {
        res
          .status(404)
          .send({ code: 404, message: "Post no encontrado.", postDeleted });
      } else {
        res.status(200).send({
          code: 200,
          message: "Post eliminado correctamente.",
          postDeleted,
        });
      }
    }
  });
}

function getPost(req, res) {
  const { url } = req.params;

  Post.findOne({ url: url }, (err, postStored) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor.", err });
    } else {
      if (!postStored) {
        res.status(404).send({
          code: 404,
          message: "No se ha encontrado el Post.",
          postStored,
        });
      } else {
        res.status(200).send({
          code: 200,
          message: "Post Encontrado correctamente.",
          postStored,
        });
      }
    }
  });
}

module.exports = {
  addPost,
  getPosts,
  updatePost,
  deletePost,
  getPost,
  getPostsSprint,
  getAllPosts,
};
