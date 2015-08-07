var models = require('../models/models.js');

var temas = ['Otro', 'Humanidades', 'Ocio', 'Ciencia', 'Tecnología'];

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
    where: {
      id: Number(quizId)
    },
    include: [{
      model: models.Comment
    }]
  }).then(function(quiz) {
    if (quiz) {
      req.quiz = quiz;
      next();
    } else {next(new Error('No existe quizId=' + quizId))}
  }).catch(function(error) {next(error)});
};

// GET /quizes?search=texto_a_buscar
exports.index = function(req, res) {
  var expiredSessionError = req.session.expiredSessionError || null;
  req.session.expiredSessionError = null;

  var texto_a_buscar = req.query.search || '';
  var tema_a_buscar = req.query.tema_search || '';
  var where = {order: 'pregunta ASC'};
  if(req.query.search || req.query.tema_search) {
    search = '%' + texto_a_buscar.trim().replace(/\s+/g,'%') + '%';
    tema_search = '%' + tema_a_buscar + '%';
    where = {where: ['lower(pregunta) like lower(?) and tema like ?', search, tema_search], order: 'pregunta ASC'};
  }
  models.Quiz.findAll(where).then(
    function(quizes) {
      res.render('quizes/index.ejs', {quizes: quizes, search: texto_a_buscar, tema_search: tema_a_buscar, errors: [], expiredSessionError: expiredSessionError, temas: temas});
    }
  ).catch(function(error) {next(error)})
};

// GET /quizes/:id
exports.show = function(req, res) {
  var expiredSessionError = req.session.expiredSessionError || null;
  req.session.expiredSessionError = null;

  res.render('quizes/show', {quiz: req.quiz, errors: [], expiredSessionError: expiredSessionError});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var expiredSessionError = req.session.expiredSessionError || null;
  req.session.expiredSessionError = null;

  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: [], expiredSessionError: expiredSessionError});
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz
    {pregunta: "", respuesta: "", tema: ""}
  );
  res.render('quizes/new', {quiz: quiz, errors: [], expiredSessionError: null, temas: temas});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors, expiredSessionError: null, temas: temas});
      } else {
        quiz // save: guarda en DB campos pregunta, respuesta y tema de quiz
        .save({fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes')})
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: [], expiredSessionError: null, temas: temas});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors, expiredSessionError: null, temas: temas});
      } else {
        req.quiz     // save: guarda campos pregunta, respuesta y tema en DB
        .save( {fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

// GET /author
exports.credits = function(req, res) {
  var expiredSessionError = req.session.expiredSessionError || null;
  req.session.expiredSessionError = null;

  res.render('author', {author: 'Víctor Julio Sánchez Pollo', image: '/images/vjsp.jpg', video: '/videos/vjsp.mp4', errors: [], expiredSessionError: expiredSessionError});
}
