// Roteador do servidor API para o problema da gestão de tarefas
var express = require('express');
var router = express.Router();
const Ficheiro = require('../controllers/ficheiro')
const Noticias = require('../controllers/noticia')

router.get("/projetos",function(req,res){
  Ficheiro.listar()
          .then(dados=>{
            var uploadsUnicos = [...new Map(dados.map(item=> [item["data_submissao"],item])).values()]
            var projetos = []
            uploadsUnicos.forEach(ele=>{
              projetos.push({
                data_submissao: ele.data_submissao,
                id_submissor: ele.id_submissor,
                zip_name: ele.zip_name,
                titulo_recurso:ele.titulo_recurso
              })
            })
            res.status(200).jsonp({projetos:projetos,ficheiros:dados})
          })
})

router.get("/recursos",function(req,res){
  Ficheiro.listar()
        .then(dados=> res.status(200).jsonp(dados))
        .catch(erro=> res.status(500).jsonp(erro))
})

router.post("/recursos", function(req,res){
  console.log(req.body)
  Ficheiro.inserir(req.body)
        .then(data =>res.status(200).jsonp({ok:"ok"}))
        .catch(error=>res.status(501).jsonp({error:error}))
})

router.post("/recursos/comentario/:id",function(req,res){
    Ficheiro.inserirComentario(req.params.id,req.body)
        .then(data =>res.status(200).jsonp({ok:"ok"}))
        .catch(error=>res.status(502).jsonp({error:error}))

})

router.post("/recursos/like/:id",function(req,res){
  
})

router.post("/recursos/like/:id",function(req,res){
  
})


router.get("/recursos/user/:id",function(req,res){
  Ficheiro.consultarUser(req.params.id)
        .then(data =>res.status(200).jsonp(data))
        .catch(error=>res.status(503).jsonp({error:error}))

})


router.get("/recursos/:id",function(req,res){
  console.log(req.params.id)
  Ficheiro.consultar(req.params.id)
          .then(ficheiro=> res.status(200).jsonp(ficheiro))
          .catch(error=>res.status(504).jsonp({error:error}))
})

router.put("/recursos/:id",function(req,res){
  Ficheiro.alterar(req.params.id,req.body.tipo_recurso)
        .then(ficheiro=>res.status(200).jsonp(ficheiro))
        .catch(error=>res.status(505).jsonp({error:error}))
})

router.delete("/recursos/:id",function(req,res){
  Ficheiro.remover(req.params.id)
        .then(ficheiro=>{res.status(200).jsonp(ficheiro)})
        .catch(error=>res.status(506).jsonp({error:error}))
})




router.get("/noticias",function(req,res){
  Noticias.listar()
        .then(dados=> res.status(200).jsonp(dados))
        .catch(erro=> res.status(507).jsonp(erro))
})

router.post("/noticias",function(req,res){
   Noticias.inserir(req.body)
        .then(dados=> res.status(200).jsonp(dados))
        .catch(erro=> res.status(507).jsonp(erro))
})

router.delete("/noticias/:id",function(req,res){  
  Noticias.remover(req.params.id)
        .then(dados=> res.status(200).jsonp(dados))
        .catch(erro=> res.status(507).jsonp(erro))
})
router.get("/noticias/:id",function(req,res){  
  Noticias.consultar(req.params.id)
        .then(dados=> res.status(200).jsonp(dados))
        .catch(erro=> res.status(507).jsonp(erro))
})
router.put("/noticias/:id",function(req,res){  
  console.log(Object.keys(req.body).length)
  if(Object.keys(req.body).length > 1)
    Noticias.alterar(req.params.id,req.body)
          .then(dados=> res.status(200).jsonp(dados))
          .catch(erro=> res.status(507).jsonp(erro))
  else
    Noticias.alterarVisibilidade(req.params.id,req.body)
      .then(dados=> res.status(200).jsonp(dados))
      .catch(erro=> res.status(507).jsonp(erro))
})

module.exports = router;
