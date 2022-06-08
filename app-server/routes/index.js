var express = require('express');
var router = express.Router();
var axios = require('axios')
const multer = require('multer');
const decompress = require('decompress');
var AdmZip = require('adm-zip');


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
    var files = zipEntries.filter(obj=>{return obj.entryName != "RRD-SIP.json"}).map(obj=>obj.entryName)
    var decoder = new TextDecoder()
    if(manifest.length == 1){
      manifest = manifest[0]
      var dados = JSON.parse(decoder.decode(manifest.getData()))
      var filesManifest = dados.data.map(obj=>obj.path)
      for(let file of filesManifest){
          files = files.filter(item => item!=file)
      }
      var allIn = files.length == 0
    }

  }
  res.render('index')
})

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
