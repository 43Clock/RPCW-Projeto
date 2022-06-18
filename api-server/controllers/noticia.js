var Noticia = require('../models/noticia');
var mongoose = require("mongoose");

// Devolve a lista de Tarefas
module.exports.listar = () => {
    return Noticia
        .find()
        .exec()
}

module.exports.listarFiltered = (b,l) => {
    return Noticia
        .find({visibilidade:"visivel"})
        .skip(parseInt(b))
        .limit(parseInt(l))
        .exec()
}

module.exports.inserir = (t) => {
    var novo = new Noticia(t)
    return novo.save()
}

module.exports.remover = function(id){
    return Noticia.deleteOne({_id: mongoose.Types.ObjectId(id)})

}

module.exports.consultar = (id) => {
    return Noticia
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.alterar = function(id,vals){
    return Noticia
        .findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(id)},
            {
                titulo:vals.titulo,
                conteudo:vals.conteudo,
                visibilidade:vals.visibilidade
            },
            {new:true})
}

module.exports.alterarVisibilidade = function(id,vals){
    return Noticia
        .findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(id)},
            {
                visibilidade:vals.visibilidade
            },
            {new:true})
}
/*

    data_criacao: String,
    titulo: String,
    conteudo: String,
    visibilidade: String


module.exports.consultarUser = (id) => {
    return Ficheiro
          .find({id_submissor:id})
          .sort([["data_submissao",1],["titulo_recurso","asc"]])
          .exec()
}





*/