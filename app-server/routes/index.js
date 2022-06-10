var express = require("express");
var router = express.Router();
var axios = require("axios");
const multer = require("multer");
const decompress = require("decompress");
var AdmZip = require("adm-zip");
var CryptoJs = require("crypto-js");
const fs = require("fs");
var axips = require("axios");

var upload = multer({ dest: "uploads/" });

router.get("/",function(req,res){
  res.redirect("/login")
})

router.get("/recursos", function (req, res) {
  axios.get("http://localhost:8001/api/recursos")
      .then(dados=>{
        res.render("recursos",{ficheiros:dados.data});  
      })
      .catch(error=>{
        res.render("error",{error:error})
      })

});

router.post("/upload", upload.array("zip"), function (req, res) {
  for (let i = 0; i < req.files.length; i++) {
    let oldPath = __dirname + "/../" + req.files[i].path;
    if (req.files[0].mimetype != "application/zip") {
      //@TODO: Erro para caso não seja um zip
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
        //TODO: fazer algo se n estiverem todos os ficheiros
        var allIn = filesNames.length == 0;
        if(allIn){
            // console.log(req.files[i].originalname.slice(0, -4));
            //var ts = Math.round((new Date()).getTime() / 1000);

            //Cria Hash com nome do zip+data de criação
            var zipName = req.files[i].originalname.slice(0, -4)
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
                //TODO: Mudar identificador do produtor e de submissao quando se fizer auth
                const body = {
                  data_criacao: dados.date,
                  data_submissao: data,
                  id_prod: "SomeoneElse",
                  id_submissor: "SomeoneElse",
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
          } 
          //TODO: Caso de não ter todos os ficheiros
        else {

        }
      }
      //TODO: Caso de não ter manifest
      else {

      }
    }
  }

  res.redirect("/upload");
});

router.get("/download/:id", function(req,res){
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
  res.render("login")
})

router.get("/registar",function(req,res){
  res.render("registar")
})

router.get("/upload",function(req,res){
  res.render("upload")
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
