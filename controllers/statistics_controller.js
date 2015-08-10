var models = require('../models/models.js');
var sequelize = require('sequelize');

var statistics = {};

// Get /quizes/statistics
exports.get = function(req, res, next) {
  var expiredSessionError = req.session.expiredSessionError || null;
  req.session.expiredSessionError = null;

  // Se utiliza Promise.all para realizar consultas asíncronas en paralelo
  sequelize.Promise.all([
    models.Quiz.count(),
    models.Comment.count(),
    models.Comment.countPublished(),
    models.Comment.countCommentedQuizes()
  ]).then(function(stats) {
    statistics.quizes = stats[0];
    statistics.comments = stats[1];
    statistics.publishedComments = stats[2];
    statistics.commentedQuizes = stats[3];
  }).catch(function(error) {
    next(error);
  }).finally(function() {
    res.render('statistics', {statistics: statistics, errors: [], expiredSessionError: expiredSessionError});
  })
};
