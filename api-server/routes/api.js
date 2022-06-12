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

// // Listar todas as tarefas
// router.get('/tarefas', function(req, res) {
//   Tarefa.listar()
//     .then(dados => res.status(200).jsonp(dados) )
//     .catch(e => res.status(500).jsonp({error: e}))
// });

// // Número de tarefas na BD
// router.get('/tarefas/numero', function(req, res) {
//   Tarefa.listar()
//     .then(dados => res.status(200).jsonp(dados.length) )
//     .catch(e => res.status(500).jsonp({error: e}))
// });

// // Consultar uma tarefa
// router.get('/tarefas/:id', function(req, res) {
//   Tarefa.consultar(req.params.id)
//     .then(dados => res.status(200).jsonp(dados))
//     .catch(e => res.status(500).jsonp({error: e}))
// });

// // Inserir uma tarefa
// router.post('/tarefas', function(req, res){
//   Tarefa.inserir(req.body)
//     .then(dados => res.status(201).jsonp({dados: dados}))
//     .catch(e => res.status(500).jsonp({error: e}))
// })

// // Alterar uma tarefa
// router.put('/tarefas', function(req, res){
//   Tarefa.alterar(req.body)
//     .then(dados => res.status(201).jsonp({dados: dados}))
//     .catch(e => res.status(500).jsonp({error: e}))
// })

// // Remover uma tarefa
// router.delete('/tarefas/:id', function(req,res,next){verificaNivel(["admin"],req,res,next)}, function(req, res) {
//   Tarefa.remover(req.params.id)
//     .then(dados => res.status(200).jsonp(dados))
//     .catch(e => res.status(501).jsonp({error: e}))
// });

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
          .then(ficheiro=>{
            console.log(ficheiro)
            res.status(200).jsonp(ficheiro)})
          .catch(error=>res.status(503).jsonp({error:error}))

})


module.exports = router;
