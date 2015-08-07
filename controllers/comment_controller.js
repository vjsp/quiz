var models = require('../models/models.js');

// Autoload :id de comentarios
exports.load = function(req, res, next, commentId) {
  models.Comment.find({
    where: {
      id: Number(commentId)
    }
  }).then(function(comment) {
    if (comment) {
      req.comment = comment;
      next();
    } else{next(new Error('No existe commentId=' + commentId))}
  }).catch(function(error){next(error)});
};

// GET /quizes/:quizId/comments/new
exports.new = function(req, res) {
  var expiredSessionError = req.session.expiredSessionError || null;
  req.session.expiredSessionError = null;

  res.render('comments/new', {quizid: req.params.quizId, errors: [], expiredSessionError: expiredSessionError});
};

// POST /quizes/:quizId/comments
exports.create = function(req, res) {
  var expiredSessionError = req.session.expiredSessionError || null;
  req.session.expiredSessionError = null;

  var comment = models.Comment.build(
    { texto: req.body.comment.texto,
      QuizId: req.params.quizId
    });

  comment
    .validate()
    .then(
      function(err){
        if (err) {
          res.render('comments/new', {quizid: req.params.quizId, comment: comment, errors: err.errors, expiredSessionError: expiredSessionError});
        } else {
          comment // save: guarda en DB campo texto de comment
          .save()
          .then( function(){ res.redirect('/quizes/'+req.params.quizId)})
        }      // res.redirect: Redirección HTTP a lista de preguntas
      }
    ).catch(function(error){next(error)});
};

// GET /quizes/:quizId/comments/:commentId/publish
exports.publish = function(req, res) {
  req.comment.publicado = true;

  req.comment.save( {fields: ["publicado"]})
    .then( function(){ res.redirect('/quizes/'+req.params.quizId);} )
    .catch(function(error){next(error)});
  };
