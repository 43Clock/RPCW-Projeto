var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var passport = require('passport')

var User = require('../controllers/user')

router.get('/', function(req, res){
  User.listar()
    .then(dados => res.status(200).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

router.post('/', function(req, res){
  User.inserir(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})
  
router.post('/login', passport.authenticate('local'), function(req, res){
  jwt.sign({ username: req.user.username, level: req.user.level}, 
    "RPCWProjeto",
    {expiresIn: "1h"},
    function(e, token) {
      if(e) res.status(501).jsonp({error: "Erro na geração do token: " + e}) 
      else res.status(201).jsonp({token: token})
});
})

router.post("/registar",function(req,res){
  //Verificar se email já existe
  User.consultar(req.body.username)
      .then(data=>{
          if(data == null){
            User.inserir(req.body)
                .then(data => res.status(201).jsonp({status:"ok"}))
                .catch(error => res.status(501).jsonp({status:"error"}))
          }else{
            res.status(409).jsonp({erro:"Username já existe"})
          }
      })
      .catch(error=>res.status(502).jsonp({error:error}))
})

module.exports = router;