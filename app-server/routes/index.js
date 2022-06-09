var express = require('express');
var router = express.Router();
var axios = require('axios')
const multer = require('multer');
const decompress = require('decompress');
var AdmZip = require('adm-zip');
var CryptoJs = require('crypto-js')
const fs = require('fs');

var upload = multer({dest:'uploads/'})

router.get('/', function(req, res) {
  res.render('index');
});

router.post('/',upload.array('zip'), function(req,res){
  for(let i = 0;i<req.files.length;i++){
    let oldPath = __dirname + '/../' + req.files[i].path
    let newPath = __dirname + '/../test/' + req.files[i].originalname
    var zip = AdmZip(oldPath)
    var zipEntries = zip.getEntries();
    //Pega no manifest se existir
    var manifest = zipEntries.filter(obj=>{return obj.entryName == "RRD-SIP.json"})
    var files = zipEntries.filter(obj=>{return obj.entryName != "RRD-SIP.json"})
    var decoder = new TextDecoder()
    if(manifest.length == 1){
      manifest = manifest[0]
      var dados = JSON.parse(decoder.decode(manifest.getData()))
      var filesManifest = dados.data.map(obj=>obj.path)
      var filesNames = files.map(obj=>obj.entryName)
      for(let file of filesManifest){
        filesNames = filesNames.filter(item => item!=file)
      }
      var allIn = filesNames.length == 0
      console.log(req.files[i].originalname.slice(0, -4))
      //var ts = Math.round((new Date()).getTime() / 1000);

      var hash = CryptoJs.MD5(req.files[i].originalname.slice(0, -4)+dados.date.toString()).toString()
      var firstHalf = hash.slice(0,16)
      var secondHalf = hash.slice(16,32)
      if(!fs.existsSync(__dirname +"/../files")){
        fs.mkdirSync(__dirname +"/../files")
      }
      if(!fs.existsSync(__dirname +"/../files/"+firstHalf)){
        fs.mkdirSync(__dirname +"/../files/"+firstHalf)
      }
      if(!fs.existsSync(__dirname +"/../files/"+firstHalf+"/"+secondHalf)){
        fs.mkdirSync(__dirname +"/../files/"+firstHalf+"/"+secondHalf)
      }
      console.log(files[0])
      zipEntries.forEach(file =>{
        var split = file.entryName.split("/")
        var path = ""
        //Cria paths
        for(var i =  0;i<split.length-1;i++){
          path+=split[i]+"/"
          if(!fs.existsSync(__dirname +"/../files/"+firstHalf+"/"+secondHalf+"/"+path)){
            fs.mkdirSync(__dirname +"/../files/"+firstHalf+"/"+secondHalf+"/"+path)
          }
        }
        fs.writeFileSync(__dirname +"/../files/"+firstHalf+"/"+secondHalf+"/"+path+file.name,decoder.decode(file.getData()))
      })
    }
  }
  res.redirect("/")
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
