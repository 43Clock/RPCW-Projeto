var Ficheiro = require('../models/ficheiro');
var mongoose = require("mongoose");

// Devolve a lista de Tarefas
module.exports.listar = () => {
    console.log("Cena")
    return Ficheiro
        .find()
        .exec()
}

module.exports.consultar = (id) => {
    return Ficheiro
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.consultarUser = (id) => {
    return Ficheiro
          .find({id_prod:id})
          .sort([["data_submissao",1],["titulo_recurso","asc"]])
          .exec()
}

module.exports.inserir = (t) => {
    var novo = new Ficheiro(t)
    return novo.save()
}

module.exports.remover = function(id){
    return Ficheiro.deleteOne({_id: id})
}

module.exports.alterar = function(t){
    return Ficheiro.findByIdAndUpdate({_id: t._id}, t, {new: true})
}
