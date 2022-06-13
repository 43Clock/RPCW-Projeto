var express = require("express");
var router = express.Router();
var axios = require("axios");
const multer = require("multer");
var AdmZip = require("adm-zip");
var CryptoJs = require("crypto-js");
const fs = require("fs");
const bcrypt = require("bcrypt");

var upload = multer({ dest: "uploads/" });

function verificaNivelConsumidor(req,res,next){
  autorizados = ["Consumidor","Produtor","Administrador"]
  if(autorizados.includes(req.level))
    next()
  else
    res.status(403).render("error-level",{token:req.cookies.token})
}

function verificaNivelProdutor(req,res,next){
  autorizados = ["Produtor","Administrador"]

  if(autorizados.includes(req.level))
    next()
  else
    res.status(403).render("error-level",{token:req.cookies.token})
}

function verificaNivelAdministrador(req,res,next){
  autorizados = ["Administrador"]
  if(autorizados.includes(req.level))
    next()
  else
    res.status(403).render("error-level",{token:req.cookies.token})
}

router.get("/",function(req,res){
  res.redirect("/login")
})


router.get("/recursos",verificaNivelConsumidor, function (req, res) {
  axios.get("http://localhost:8001/api/recursos")
      .then(dados=>{
        res.render("recursos",{ficheiros:dados.data,token:req.cookies.token});  
      })
      .catch(error=>{
        res.render("error",{error:error})
      })

});

router.get("/upload", verificaNivelProdutor,function(req,res){
  res.render("upload",{token:req.cookies.token,erro:req.query.erro})
})

router.post("/upload", upload.array("zip"),verificaNivelProdutor, function (req, res) {
  for (let i = 0; i < req.files.length; i++) {
    let oldPath = __dirname + "/../" + req.files[i].path;
    if (req.files[0].mimetype != "application/zip") {
      res.redirect("/upload?erro="+"Fichero tem de ser um zip")
    } 
    else {
      var zip = AdmZip(oldPath);
      var zipEntries = zip.getEntries();
      //Pega no manifest se existir
      var manifest = zipEntries.filter((obj) => {
        return obj.entryName == "RRD-SIP.json";
      });
      var files = zipEntries.filter((obj) => {
        return obj.entryName != "RRD-SIP.json";
      });
      var decoder = new TextDecoder();
      if (manifest.length == 1) {
        manifest = manifest[0];
        var dados = JSON.parse(decoder.decode(manifest.getData()));
        var filesManifest = dados.data.map((obj) => obj.path);
        var filesNames = files.map((obj) => obj.entryName);
        for (let file of filesManifest) {
          filesNames = filesNames.filter((item) => item != file);
        }
        //TODO: verificar o mimetipe de todos os ficheiros e se o schema dos xmls esta bem
        var allIn = filesNames.length == 0;
        if(allIn){
            //Cria Hash com nome do zip+data de criação
            var zipName = req.files[i].originalname.split(".").slice(0,-1).join(".")
            var hash = CryptoJs.MD5(
               zipName + dados.date.toString()
            ).toString();
            var firstHalf = hash.slice(0, 16);
            var secondHalf = hash.slice(16, 32);

            //Cria pasta se não existe
            if (!fs.existsSync( __dirname + "/../files/" + firstHalf + "/" + secondHalf)) {
              fs.mkdirSync(__dirname + "/../files/" + firstHalf + "/" + secondHalf,{ recursive: true });
            }
            var data = new Date().toISOString().substring(0,16)
            zipEntries.forEach((file) => {
              if(file.name != "RRD-SIP.json"){
                var split = file.entryName.split("/");
                var path = "";
                //Cria paths
                for (var i = 0; i < split.length - 1; i++) {
                  path += split[i] + "/";
                  if (!fs.existsSync(__dirname + "/../files/" + firstHalf +"/" + secondHalf + "/" + path)) {
                    fs.mkdirSync(__dirname + "/../files/" +firstHalf + "/" +secondHalf +"/" +path);
                  }
                }
                fs.writeFileSync(__dirname + "/../files/" + firstHalf +"/" + secondHalf + "/" + path + file.name,
                  decoder.decode(file.getData()));
                const body = {
                  data_criacao: dados.date,
                  data_submissao: data,
                  id_prod: req.username,
                  id_submissor: req.username,
                  zip_name: zipName,
                  titulo_recurso: file.name,
                  path_recurso: path,
                  tipo_recurso: req.body.tipo
                }
                axios.post("http://localhost:8001/api/recursos",body)
                    .then(resposta=>{
                      console.log(resposta.data)
                    })
                    .catch(error=>{
                      res.render("erro")
                    })
              }
            });
            console.log(oldPath)
            res.redirect("/upload")
          } 
          //Caso de não ter todos os ficheiros
        else {
          res.redirect("/upload?erro="+"Manifest não representa ficheiros fornecidos")
        }
      }
      //Caso de não ter manifest
      else {
        res.redirect("/upload?erro="+"Manifest não fornecido")
      }
    }
    fs.unlinkSync(oldPath)
  }
});

router.get("/download/:id", verificaNivelConsumidor, function(req,res){
  var id = req.params.id
  axios.get("http://localhost:8001/api/recursos/"+id)
      .then(data=>{
          var ficheiro = data.data
          var zipName = ficheiro.zip_name;
          var hash = CryptoJs.MD5(
            zipName + ficheiro.data_criacao.toString())
          .toString();
          var firstHalf = hash.slice(0, 16);
          var secondHalf = hash.slice(16, 32);
          console.log(ficheiro)
          console.log(__dirname+"/../files/"+firstHalf+"/"+secondHalf+"/"+ficheiro.path_recurso+ficheiro.titulo_recurso)
          res.download(__dirname+"/../files/"+firstHalf+"/"+secondHalf+"/"+ficheiro.path_recurso+ficheiro.titulo_recurso)
          res.status(200)
      })
      .catch(error=>{
        res.render("error",{error:error})
      })
})

router.get("/login",function(req,res){
    res.render("login",{token:req.cookies.token,erro:req.query.erro})
})

router.post("/login",function(req,res){
  req.body.username = req.body.username.toLowerCase()
  axios.post('http://localhost:8002/users/login', req.body)
    .then(dados => {
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1h'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/')
    })
    .catch(error => {
      console.log(error)
      if(error.response.status == 409 || error.response.status == 401){
        res.status(error.response.status).redirect("/login?erro="+error.response.data.erro)
      }else{
        res.render("error",{error:error})
      }
    })
});


router.get("/registar",function(req,res){
  res.render("registar",{erro:req.query.erro,token:req.cookies.token})
})

router.post("/registar",function(req,res){
  if(req.body.password != req.body.password_confirm) res.redirect("/registar?erro=Passwords não são iguais")
  var form_data = req.body
  const salt = bcrypt.genSaltSync(10)
  form_data.password = bcrypt.hashSync(req.body.password,salt) 
  form_data.username = req.body.username.toLowerCase()
  axios.post("http://localhost:8002/users/registar",form_data)
      .then(data => {
        console.log(data)
        res.redirect("/")
      })
      .catch(error=>{
        if(error.response.status == 409){
          res.status(409).redirect("/registar?erro="+error.response.data.erro)
        }else{
          res.render("error",{error:error})
        }
      })
})

router.get("/editar",verificaNivelProdutor,function(req,res){
  axios.get("http://localhost:8001/api/recursos/user/"+req.username)
      .then(data=>{
        res.render("editar",{ficheiros:data.data,token:req.cookies.token})
      })
      .catch(error=>res.render("error",{error:error}))
})

router.delete("/delete/:id",verificaNivelProdutor,function(req,res){
  axios.get("http://localhost:8001/api/recursos/user/"+req.username)
      .then(data=>{
        var ids = data.data.map(ele=>ele._id)
        if(!(req.level == "Administrador" || ids.includes(req.params.id))){          
          res.redirect("/")
        } 
        else{
          axios.delete("http://localhost:8001/api/recursos/"+req.params.id)
              .then(complete=>{
                var ficheiro = data.data.filter(ele=>ele._id == req.params.id)[0]
                var zipName = ficheiro.zip_name;
                var hash = CryptoJs.MD5(
                  zipName + ficheiro.data_criacao.toString())
                .toString();
                var firstHalf = hash.slice(0, 16);
                var secondHalf = hash.slice(16, 32);
                fs.unlinkSync(__dirname+"/../files/"+firstHalf+"/"+secondHalf+"/"+ficheiro.path_recurso+ficheiro.titulo_recurso)
                res.redirect("/editar")
              })
              .catch(error=>res.render("error",{error:error}))
        }
      })
      .catch(error=>res.render("error",{error:error}))
})

router.get("/logout",function(req,res){
  res.cookie("token",undefined)
  res.clearCookie("token")
  res.redirect("/login")
})

/*
//To replace
var fs = require('fs');
var dir = './tmp/but/then/nested';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}*/

// router.get('/login', function(req, res) {
//   res.render('login-form');
// });

// router.post('/login', function(req, res) {
//   axios.post('http://localhost:8002/users/login', req.body)
//     .then(dados => {
//       res.cookie('token', dados.data.token, {
//         expires: new Date(Date.now() + '1d'),
//         secure: false, // set to true if your using https
//         httpOnly: true
//       });
//       res.redirect('/tarefas')
//     })
//     .catch(e => res.render('error', {error: e}))
// });

// router.get('/tarefas', function(req, res) {
//   console.log(JSON.stringify(req.cookies))
//   axios.get('http://localhost:8001/tarefas?token=' + req.cookies.token)
//     .then(dados => {
//         res.render('tarefas', {lista: dados.data})
//     })
//     .catch(e => res.render('error', {error: e}))
// });

// router.get('/tarefas/remover/:id', function(req, res){
//   axios.delete("http://localhost:8001/tarefas/"+req.params.id+"?token="+req.cookies.token)
//         .then(data => res.redirect("/tarefas"))
//         .catch(e => {
//           if(e.response.status == 403){
//             res.render("error-level")
//           }
//           else
//             res.render('error', {error: e})})
//       })
module.exports = router;
