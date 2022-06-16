const mongoose = require('mongoose')


var noticiaSchema = new mongoose.Schema({
    data_criacao: String,
    titulo: String,
    conteudo: String,
    visibilidade: String
  });

module.exports = mongoose.model('noticias', noticiaSchema)