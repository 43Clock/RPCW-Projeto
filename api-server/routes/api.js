// Roteador do servidor API para o problema da gestão de tarefas
var express = require('express');
var router = express.Router();
const Ficheiro = require('../controllers/ficheiro')

function verificaNivel(autorizados,req,res,next){
  autorizados = ["admin"]
  if(autorizados.includes(req.level))
    next()
  else
    res.status(403).jsonp({eroor: "Não tem nível de acesso suficiente"})
}

router.get("/recursos",function(req,res){
  Ficheiro.listar()
        .then(dados=> res.status(200).jsonp(dados))
        .catch(erro=> res.status(500).jsonp(erro))
})

router.post("/recursos", function(req,res){
  Ficheiro.inserir(req.body)
        .then(data =>res.status(200).jsonp({ok:"ok"}))
        .catch(error=>res.status(501).jsonp({error:error}))
})

router.get("/recursos/user/:id",function(req,res){
  Ficheiro.consultarUser(req.params.id)
        .then(data =>res.status(200).jsonp(data))
        .catch(error=>res.status(502).jsonp({error:error}))

})


router.get("/recursos/:id",function(req,res){
  console.log(req.params.id)
  Ficheiro.consultar(req.params.id)
          .then(ficheiro=> res.status(200).jsonp(ficheiro))
          .catch(error=>res.status(503).jsonp({error:error}))

})

router.put("/recursos/:id",function(req,res){
  Ficheiro.alterar(req.params.id,req.body.tipo_recurso)
        .then(ficheiro=>res.status(200).jsonp(ficheiro))
        .catch(error=>res.status(504).jsonp({error:error}))
})

router.delete("/recursos/:id",function(req,res){
  Ficheiro.remover(req.params.id)
        .then(ficheiro=>{res.status(200).jsonp(ficheiro)})
        .catch(error=>res.status(505).jsonp({error:error}))
})





module.exports = router;
