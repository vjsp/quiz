// Definicion del modelo de Quiz con validación

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
  	'Comment',
    { texto: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "-> Falta Comentario"}}
      },
      publicado: {
      	type: DataTypes.BOOLEAN,
      	defaultValue: false
      }
    },
    // Se añaden los métodos necesarios para la obtención de las estadísticas
    // de los comentarios
    { classMethods: {
        countPublished: function() {
          return this.count({where: {publicado: true}});
        },
        countCommentedQuizes: function() {
          return this.aggregate('QuizId', 'count', {distinct: true});
        }
      }
    }
  );
};
