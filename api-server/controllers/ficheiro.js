var Ficheiro = require('../models/ficheiro');
var mongoose = require("mongoose");

// Devolve a lista de Tarefas
module.exports.listar = () => {
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
          .find({id_submissor:id})
          .sort([["data_submissao",1],["titulo_recurso","asc"]])
          .exec()
}

module.exports.inserir = (t) => {
    var novo = new Ficheiro(t)
    return novo.save()
}

module.exports.inserirComentario = (id,comentario) => {
    return Ficheiro.findOneAndUpdate({_id: mongoose.Types.ObjectId(id)},
                                     {$push:{comentarios:comentario}},
                                     {new:true})
}

module.exports.remover = function(id){
    return Ficheiro.deleteOne({_id: mongoose.Types.ObjectId(id)})
}
module.exports.alterar = function(id,tipo){
    return Ficheiro.findOneAndUpdate({_id: mongoose.Types.ObjectId(id)}, {tipo_recurso:tipo},{new:true})
}

module.exports.addLike = (id,user) =>{
    return Ficheiro.findOneAndUpdate({_id: mongoose.Types.ObjectId(id)},
                                     {$push:{likedBy:user}},
                                     {new:true})
}

module.exports.addDislike = (id,user) =>{
    return Ficheiro.findOneAndUpdate({_id: mongoose.Types.ObjectId(id)},
                                     {$push:{dislikedBy:user}},
                                     {new:true})
}

module.exports.removeLike = (id,user) =>{
    console.log(user)
    return Ficheiro.findOneAndUpdate({_id: mongoose.Types.ObjectId(id)},
                                     {$pull:{likedBy:user}},
                                     {new:true})
}

module.exports.removeDislike = (id,user) =>{
    console.log(user)
    return Ficheiro.findOneAndUpdate({_id: mongoose.Types.ObjectId(id)},
                                     {$pull:{dislikedBy:user}},
                                     {new:true})
}

