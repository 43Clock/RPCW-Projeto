var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const { use } = require('passport');
var passport = require('passport')

var User = require('../controllers/user')



router.get("/",function(req,res){
  User.listar()
      .then(data=>res.status(200).jsonp(data))
      .catch(error=>res.status(504).jsonp({error:error}))
})
  
router.put("/",function(req,res){
  console.log(req.body)
  User.consultar(req.body.username)
      .then(data=>{
          if(data == null){
            User.alterar(req.body)
              .then(data=>res.status(200).jsonp(data))
              .catch(error=>res.status(504).jsonp({error:error}))
          }else{
            res.status(409).jsonp({erro:"Username já existe"})
          }
      })
      .catch(error=>res.status(502).jsonp({error:error}))
})

router.delete("/",function(req,res){
  console.log(req.body.id_user)
  User.remover(req.body.id_user)
      .then(data=>res.status(200).jsonp(data))
      .catch(error=>res.status(504).jsonp({error:error}))
})
  
router.post('/login', function(req,res,next){
    passport.authenticate('local',function(err,user,info){
      if(err){
        return next(err);
      } 
      if(!user){
        return res.status(401).jsonp({erro:info.message})
      }
      jwt.sign({ username: user.username, level: user.level}, 
        "RPCWProjeto",
        {expiresIn: "1h"},
        function(e, token) {
          if(e) return res.status(501).jsonp({error: "Erro na geração do token: " + e}) 
          else return res.status(201).jsonp({token: token})
      });
      
    })(req,res,next)
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
