// Controlador para o modelo User
const mongoose = require('mongoose');
var User = require('../models/user')

// Devolve a lista de Users
module.exports.listar = () => {
    return User
        .find()
        .exec()
}

module.exports.consultar = uname => {
    return User
        .findOne({username: uname})
        .exec()
}

module.exports.inserir = u => {
    var novo = new User(u)
    return novo.save()
}

module.exports.remover = function(id){
    return User.deleteOne({_id: mongoose.Types.ObjectId(id)})
}

module.exports.alterar = function(u){
    return User.findByIdAndUpdate({_id: mongoose.Types.ObjectId(u._id)}, {username:u.username,level:u.level}, {new: true})
}
