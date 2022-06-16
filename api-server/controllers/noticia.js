var Noticia = require('../models/noticia');
var mongoose = require("mongoose");

// Devolve a lista de Tarefas
module.exports.listar = () => {
    return Noticia
        .find()
        .exec()
}

module.exports.inserir = (t) => {
    var novo = new Ficheiro(t)
    return novo.save()
}

/*
module.exports.consultar = (id) => {
    return Ficheiro
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.consultarUser = (id) => {
    return Ficheiro
          .find({id_submissor:id})
          .sort([["data_submissao",1],["titulo_recurso","asc"]])
          .exec()
}



module.exports.remover = function(id){
    return Ficheiro.deleteOne({_id: mongoose.Types.ObjectId(id)})
}
module.exports.alterar = function(id,tipo){
    return Ficheiro.findOneAndUpdate({_id: mongoose.Types.ObjectId(id)}, {tipo_recurso:tipo},{new:true})
}
*/