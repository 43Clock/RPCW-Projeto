const mongoose = require('mongoose')

// designacao: { type: String, required: true },
    // data: { type: String, required: true },
    // desc: String,
    // responsavel: String
var ficheiroSchema = new mongoose.Schema({
    data_criacao: Number,
    data_submissao: String,
    id_prod: String,
    id_submissor: String,
    zip_name: String,
    nome_ficheiro: String,
    titulo_recurso: String,
    path_recurso: String,
    tipo_recurso: String,
    comentarios:[
      {
        "id_user": String,
        "data_criacao": String,
        "comentario": String
      }
    ],
    likedBy: [{type: String}],
    dislikedBy: [{type: String}]
  });

module.exports = mongoose.model('ficheiros', ficheiroSchema)