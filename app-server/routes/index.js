var express = require("express");
var router = express.Router();
var axios = require("axios");
const multer = require("multer");
var AdmZip = require("adm-zip");
var CryptoJs = require("crypto-js");
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require('path');
const {spawn} = require('child_process');
var upload = multer({ dest: "uploads/" });

if (!fs.existsSync(__dirname + "/../logs")) {
  fs.mkdirSync(__dirname + "/../logs",{recursive:true})
}

//upload|data|info
var log = fs.createWriteStream(__dirname+"/../logs/logs.log",{flags:"a"})

var api = process.env.API || 'localhost';
var auth = process.env.AUTH || 'localhost';


function verificaNivelConsumidor(req,res,next){
  autorizados = ["Consumidor","Produtor","Administrador"]
  if(autorizados.includes(req.level))
    next()
  else
    res.status(403).render("error-level",{token:req.level})
}

function verificaNivelProdutor(req,res,next){
  autorizados = ["Produtor","Administrador"]

  if(autorizados.includes(req.level))
    next()
  else
    res.status(403).render("error-level",{token:req.level})
}

function verificaNivelAdministrador(req,res,next){
  autorizados = ["Administrador"]
  if(autorizados.includes(req.level))
    next()
  else
    res.status(403).render("error-level",{token:req.level})
}

router.get("/",function(req,res){
  axios.get("http://"+api+":8001/api/noticias",{params:{token: req.cookies.token,visivel:true, start:0}})
       .then(data=>{
         res.status(200).render("index",{token:req.level,noticias:data.data})
        })
       .catch(error=>{
          //  console.log(error)
          if(error.response.status==403)
            res.status(200).render("index",{token:req.level})
          else
            res.status(501).render("error",{error:error,token:req.level})
       })
})


router.get("/recursos",verificaNivelConsumidor, function (req, res) {
  axios.get("http://"+api+":8001/api/recursos?token="+req.cookies.token)
      .then(dados=>{
        log.write("recursos|vis|"+ new Date().toISOString().substring(0,16)+"|"+req.username+"\n")
        res.status(200).render("recursos",{ficheiros:dados.data,token:req.level,user:req.username});  
      })
      .catch(error=>{
        res.status(501).render("error",{error:error,token:req.level})
      })
});

router.get("/projetos",verificaNivelConsumidor,function(req,res){
  axios.get("http://"+api+":8001/api/projetos?token="+req.cookies.token)
      .then(data=>{
        log.write("projetos|vis|"+ new Date().toISOString().substring(0,16)+"|"+req.username+"\n")
        res.status(200).render("projetos",{projetos:data.data.projetos,ficheiros:data.data.ficheiros,token:req.level})
      })
      .catch(error=>{res.status(501).render("error",{error:error,token:req.level})})
})

router.get("/projetos/:key",verificaNivelConsumidor,function(req,res){
    var hash = CryptoJs.MD5(req.params.key).toString();
    var firstHalf = hash.slice(0, 16);
    var secondHalf = hash.slice(16, 32);
    var caminho = __dirname + "/../files/" + firstHalf + "/" + secondHalf+"/data"
    const python = spawn('python3',[__dirname+"/../bagit.py", caminho, hash])
    python.on("exit",(code)=>{
      python.emit("done")
    })
    python.on("done",()=>{
      res.download(__dirname+"/../"+hash+".zip",function(err){
        if(err) res.status(501).render("error",{error:err,token:req.level})
        else{
          fs.unlinkSync(__dirname+"/../"+hash+".zip")
          res.status(200)
          log.write("projetos|down|"+ new Date().toISOString().substring(0,16)+"|"+req.username+"|"+firstHalf+secondHalf+"\n")
        }
      })
    })
})

router.get("/upload", verificaNivelProdutor,function(req,res){
  res.status(200).render("upload",{token:req.level,erro:req.query.erro,sucesso:req.query.sucesso})
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
      var decoder = new TextDecoder();
      var manifest = zipEntries.filter((obj) => {
        return obj.entryName == "RRD-SIP.json";
      });
      //Pega nos metadados
      var metadados = JSON.parse(decoder.decode(zipEntries.filter((obj) => {
        return obj.entryName == "metadados.json";
      })[0].getData()))
      var files = zipEntries.filter((obj) => {
        return obj.entryName != "RRD-SIP.json" && obj.entryName != "metadados.json";
      });
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
            //Verifica se termina com .zip
            if(req.files[i].originalname.indexOf(".zip",req.files[i].originalname.length-".zip".length)!=-1){
              var zipName = req.files[i].originalname.split(".").slice(0,-1).join(".")
            }
            else {
              var zipName = req.files[i].originalname
            }
            var data = new Date().toISOString()
            var hash = CryptoJs.MD5(
               zipName + data
            ).toString();
            var firstHalf = hash.slice(0, 16);
            var secondHalf = hash.slice(16, 32);

            //Cria pasta se não existe
            if (!fs.existsSync( __dirname + "/../files/" + firstHalf + "/" + secondHalf)) {
              fs.mkdirSync(__dirname + "/../files/" + firstHalf + "/" + secondHalf,{ recursive: true });
            }
            
            zipEntries.forEach((file) => {
              if(file.name != "RRD-SIP.json" && file.name != "metadados.json"){
                var split = file.entryName.split("/");
                var path = "";
                //Cria paths
                for (var i = 0; i < split.length - 1; i++) {
                  path += split[i] + "/";
                  if (!fs.existsSync(__dirname + "/../files/" + firstHalf +"/" + secondHalf + "/" + path)) {
                    fs.mkdirSync(__dirname + "/../files/" +firstHalf + "/" +secondHalf +"/" +path);
                  }
                }
                // fs.writeFileSync(__dirname + "/../files/" + firstHalf +"/" + secondHalf + "/" + path + file.name,
                //   decoder.decode(file.getData()));
                const body = {
                  data_criacao: metadados.date,
                  data_submissao: data,
                  id_prod: metadados.producer,
                  id_submissor: req.username,
                  zip_name: zipName,
                  nome_ficheiro: file.name,
                  titulo_recurso: metadados.titulo,
                  path_recurso: path,
                  tipo_recurso: metadados.tipo
                }
                axios.post("http://"+api+":8001/api/recursos?token="+req.cookies.token,body)
                    .then(resposta=>{})
                    .catch(error=>{
                      res.status(201).render("erro",{error:error,token:req.level})
                    })
              }
            });
            
            zip.extractAllTo(__dirname + "/../files/" + firstHalf +"/" + secondHalf,true)
            res.redirect("/upload?sucesso="+"Ficheiro inserido")
            log.write("upload|upload|"+ new Date().toISOString().substring(0,16)+"|"+req.username+"\n")
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
  axios.get("http://"+api+":8001/api/recursos/"+id+"?token="+req.cookies.token)
      .then(data=>{
          var ficheiro = data.data
          var zipName = ficheiro.zip_name;
          var hash = CryptoJs.MD5(
            zipName + ficheiro.data_submissao.toString())
          .toString();
          var firstHalf = hash.slice(0, 16);
          var secondHalf = hash.slice(16, 32);
          res.download(__dirname+"/../files/"+firstHalf+"/"+secondHalf+"/"+ficheiro.path_recurso+ficheiro.nome_ficheiro)
          log.write("recursos|down|"+ new Date().toISOString().substring(0,16)+"|"+req.username+"|"+ficheiro.nome_ficheiro+"\n")
          res.status(200)
      })
      .catch(error=>{
        res.status(501).render("error",{error:error,token:req.level})
      })
})

router.get("/login",function(req,res){
    res.status(200).render("login",{token:req.level,erro:req.query.erro})
})

router.post("/login",function(req,res){
  req.body.username = req.body.username.toLowerCase()
  axios.post("http://"+auth+":8002/users/login", req.body)
    .then(dados => {
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1h'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/')
      log.write("login|succ|"+ new Date().toISOString().substring(0,16)+"|"+req.body.username+"\n")
    })
    .catch(error => {
      if(error.response.status == 409 || error.response.status == 401){
        res.status(error.response.status).redirect("/login?erro="+error.response.data.erro)
      }else{
        res.status(501).render("error",{error:error,token:req.level})
      }
    })
});


router.get("/registar",function(req,res){
  res.status(200).render("registar",{erro:req.query.erro,token:req.level})
})

function onlyLettersAndNumbers(str) {
  return /^[A-Za-z0-9]*$/.test(str);
}

router.post("/registar",function(req,res){
  if(!onlyLettersAndNumbers(req.body.username)){
    res.redirect("/registar?erro=Nome de utilizador so pode ter letras e/ou numeros")
    return;
  } 
  if(req.body.password != req.body.password_confirm) {
    res.redirect("/registar?erro=Passwords não são iguais")
    return;
  }
  var form_data = req.body
  const salt = bcrypt.genSaltSync(10)
  form_data.password = bcrypt.hashSync(req.body.password,salt) 
  form_data.username = req.body.username.toLowerCase()
  axios.post("http://"+auth+":8002/users/registar",form_data)
      .then(data => {
        log.write("registar|succ|"+ new Date().toISOString().substring(0,16)+"|"+form_data.username+"|"+form_data.level+"\n")
        res.redirect("/")
      })
      .catch(error=>{
        if(error.response.status == 409){
          res.status(409).redirect("/registar?erro="+error.response.data.erro)
        }else{
          res.status(501).render("error",{error:error,token:req.level})
        }
      })
})

//Rotas para editar ficheiros
router.get("/editar",verificaNivelProdutor,function(req,res){
  axios.get("http://"+api+":8001/api/recursos/user/"+req.username+"?token="+req.cookies.token)
      .then(data=>{
        res.status(200).render("editar",{ficheiros:data.data,token:req.level,sucesso:req.query.sucesso})
      })
      .catch(error=>res.status(501).render("error",{error:error,token:req.level}))
})

router.put("/editar/:id",verificaNivelProdutor,function(req,res){
  axios.put("http://"+api+":8001/api/recursos/"+req.params.id+"?token="+req.cookies.token,req.body)
      .then(data=>{
        res.status(200).send({result: "redirect", url:"/editar?sucesso=Alteração feita com sucesso!"})
        log.write("recursos|edit|"+ new Date().toISOString().substring(0,16)+"|"+req.username+"|"+req.params.id+"\n")
      })
      .catch(error=>res.status(501).jsonp(error))
})

router.delete("/editar/:id",verificaNivelProdutor,function(req,res){
  axios.get("http://"+api+":8001/api/recursos/user/"+req.username+"?token="+req.cookies.token)
      .then(data=>{
        var ids = data.data.map(ele=>ele._id)
        if(!(req.level == "Administrador" || ids.includes(req.params.id))){
          res.redirect("/")
        } 
        else{
          axios.delete("http://"+api+":8001/api/recursos/"+req.params.id+"?token="+req.cookies.token)
              .then(complete=>{
                var ficheiro = data.data.filter(ele=>ele._id == req.params.id)[0]
                var zipName = ficheiro.zip_name;
                var hash = CryptoJs.MD5(
                  zipName + ficheiro.data_submissao.toString())
                .toString();
                var firstHalf = hash.slice(0, 16);
                var secondHalf = hash.slice(16, 32);
                fs.unlinkSync(__dirname+"/../files/"+firstHalf+"/"+secondHalf+"/"+ficheiro.path_recurso+ficheiro.nome_ficheiro)
                res.redirect("/editar")
                log.write("recursos|delete|"+ new Date().toISOString().substring(0,16)+"|"+req.username+"|"+req.params.id+"\n")
              })
              .catch(error=>res.status(501).render("error",{error:error,token:req.level}))
        }
      })
      .catch(error=>res.status(501).render("error",{error:error,token:req.level}))
})

router.get("/admin",verificaNivelAdministrador,function(req,res){
  res.redirect("/admin/utilizadores")
})


//Rotas para tratar dos utilizadores (admin)
router.get("/admin/utilizadores",verificaNivelAdministrador,function(req,res){
  axios.get("http://"+auth+":8002/users")
    .then(data=>{
      res.status(200).render("admin-utilizadores",{utilizadores:data.data,token:req.level,
                                                   sucesso:req.query.sucesso,erro:req.query.erro,
                                                   sucessoRegistar:req.query.sucessoRegistar,
                                                   erroRegistar:req.query.erroRegistar})
    })
    .catch(error=>res.status(501).render("error",{error:error}))
})

router.put("/admin/utilizadores/:id",verificaNivelAdministrador,function(req,res){
  axios.put("http://"+auth+":8002/users",req.body)
      .then(data=>res.status(200).send({result: "redirect", url:"/admin/utilizadores?sucesso=Alteração feita com sucesso!"}))
      .catch(error=>{
        if(error.response.status == 409){
          res.status(200).send({result: "redirect", url:"/admin/utilizadores?erro="+error.response.data.erro})
        }else{
          res.status(501).render("error",{error:error,token:req.level})
        }
      })
})

router.delete("/admin/utilizadores/:id",verificaNivelAdministrador,function(req,res){
  axios.delete("http://"+auth+":8002/users",{data:{id_user:req.params.id}})
      .then(data=>res.status(200).send({result: "redirect", url:"/admin/utilizadores?sucesso=Remoção feita com sucesso!"}))
      .catch(error=>res.status(501).jsonp(error))
})


router.post("/admin/utilizadores/registar",function(req,res){
  if(!onlyLettersAndNumbers(req.body.username)){
    res.redirect("/admin/utilizadores?erroRegistar=Nome de utilizador so pode ter letras e/ou numeros")
    return;
  } 
  if(req.body.password != req.body.password_confirm) {
    res.redirect("/admin/utilizadores?erroRegistar=Passwords não são iguais")
    return;
  }
  var form_data = req.body
  const salt = bcrypt.genSaltSync(10)
  form_data.password = bcrypt.hashSync(req.body.password,salt) 
  form_data.username = req.body.username.toLowerCase()
  axios.post("http://"+auth+":8002/users/registar",form_data)
      .then(data => {
        log.write("registar|succ|"+ new Date().toISOString().substring(0,16)+"|"+form_data.username+"|"+form_data.level+"\n")
        res.redirect("/admin/utilizadores?sucessoRegistar=Utilizador registado com sucesso")
      })
      .catch(error=>{
        if(error.response.status == 409){
          res.status(409).redirect("/admin/utilizadores?erroRegistar="+error.response.data.erro)
        }else{
          res.status(501).render("error",{error:error,token:req.level})
        }
      })
})


//Rotas para os recursos (admin)
router.get("/admin/recursos",verificaNivelAdministrador,function(req,res){
  axios.get("http://"+api+":8001/api/recursos?token="+req.cookies.token)
       .then(data=>res.status(200).render("admin-recursos",{token:req.level,recursos:data.data,sucesso:req.query.sucesso}))
       .catch(error=>res.status(501).render("error",{error:error,token:req.level}))
})

router.put("/admin/recursos/:id",verificaNivelAdministrador,function(req,res){
  axios.put("http://"+api+":8001/api/recursos/"+req.params.id+"?token="+req.cookies.token,req.body)
      .then(data=>res.status(200).send({result: "redirect", url:"/admin/recursos?sucesso=Alteração feita com sucesso!"}))
      .catch(error=>res.status(501).jsonp(error))
})

router.delete("/admin/recursos/:id",verificaNivelAdministrador,function(req,res){
  axios.get("http://"+api+":8001/api/recursos/"+req.params.id+"?token="+req.cookies.token)
      .then(data=>{
          var ficheiro = data.data
          var zipName = ficheiro.zip_name;
          var hash = CryptoJs.MD5(
            zipName + ficheiro.data_submissao.toString())
          .toString();
          var firstHalf = hash.slice(0, 16);
          var secondHalf = hash.slice(16, 32);
          fs.unlinkSync(__dirname+"/../files/"+firstHalf+"/"+secondHalf+"/"+ficheiro.path_recurso+ficheiro.nome_ficheiro)
          axios.delete("http://"+api+":8001/api/recursos/"+req.params.id+"?token="+req.cookies.token)
              .then(data=>res.status(200).send({result: "redirect", url:"/admin/recursos?sucesso=Ficheiro removido com sucesso!"}))
              .catch(error=>res.status(501).render("error",{error:error,token:req.level}))
      })
})

router.get("/admin/estatisticas",verificaNivelAdministrador,function(req,res){
  fs.readFile(__dirname+"/../logs/logs.log", 'utf8' , (err, data) => {
    if (err) {
      res.status(510).render("error",{error:err,token:req.level})
      return
    } 
    var linhas = data.split("\n").slice(0,-1)
    data={
      "vis":{
        "recursos":0,
        "projetos":0
      },
      "download":{
        "recursos":[],
        "projetos":[]
      },
      "upload":[]
    }
    download_recursos={}
    download_projetos={}
    upload={}

    linhas.forEach((linha)=>{
      elem=linha.split("|")
      if(elem[1]=="vis")
        data[elem[1]][elem[0]]+=1
      else{
        if(elem[1]=="down"){
          if(elem[0]=="recursos"){
            if(download_recursos[elem[3]]==undefined)
              download_recursos[elem[3]]=0
            download_recursos[elem[3]]+=1
          }else{
            if(elem[0]=="projetos"){
              if(download_projetos[elem[3]]==undefined)
                download_projetos[elem[3]]=0
              download_projetos[elem[3]]+=1
            }
          }
        }
        else{
          if(elem[1]=="upload"){
            if(upload[elem[3]]==undefined)
              upload[elem[3]]=0
            upload[elem[3]]+=1
          }
        }
      }     
    })

    let sortable = [];
    for (var user of Object.entries(download_recursos)) {
        sortable.push(user);
    }
    sortable.sort(function(a, b) {
        return -a[1] + b[1];
    });
    data["download"]["recursos"]=sortable

    sortable = [];
    for (var user of Object.entries(download_projetos)) {
        sortable.push(user);
    }
    sortable.sort(function(a, b) {
        return -a[1] + b[1];
    });
    data["download"]["projetos"]=sortable


    sortable = [];
    for (var user of Object.entries(upload)) {
        sortable.push(user);
    }
    sortable.sort(function(a, b) {
        return -a[1] + b[1];
    });
    data["upload"]=sortable
    //res.jsonp(data)
    res.status(200).render("admin-estatisticas",{...data,token:req.level})
  })
})
router.get("/admin/estatisticas/download",verificaNivelAdministrador,function(req,res){
  res.download(__dirname+"/../logs/logs.log")
  res.status(200)
})



router.get("/noticias",function(req,res){
  axios.get("http://"+api+":8001/api/noticias",{params:{token: req.cookies.token,visivel:true, start:req.query.start}})
    .then(data=>res.status(200).jsonp({noticias:data.data}))
    .catch(error=>{
    //  console.log(error)
      res.status(501).jsonp({error:error})
    })
})

//Rotas para tratar das noticias do admin
router.get("/admin/noticias",verificaNivelAdministrador,function(req,res){
  axios.get("http://"+api+":8001/api/noticias?token="+req.cookies.token)
       .then(data=>res.status(200).render("admin-noticias",{token:req.level,noticias:data.data}))
       .catch(error=>{
        //  console.log(error)
         res.status(501).render("error",{error:error,token:req.level})
       })
})
router.post("/admin/noticias",verificaNivelAdministrador,function(req,res){
  console.log(req.body)
  axios.post("http://"+api+":8001/api/noticias?token="+req.cookies.token,req.body)
       .then(data=>res.status(200).jsonp({token:req.level,noticias:data.data}))
       .catch(error=>{
         console.log(error)
         res.status(501).jsonp({error:error,token:req.level})
       })
})
router.delete("/admin/noticias/:id",verificaNivelAdministrador,function(req,res){
  console.log(req.params.id)
  axios.delete("http://"+api+":8001/api/noticias/"+req.params.id+"?token="+req.cookies.token)
    .then(data=>{
      res.status(200).jsonp({token:req.level,deleted:data.data})
    })
    .catch(error=>{
      console.log(error)
      res.status(501).jsonp({error:error,token:req.level})
    })
})
router.get("/admin/noticias/:id",verificaNivelAdministrador,function(req,res){
  console.log(req.params.id)
  axios.get("http://"+api+":8001/api/noticias/"+req.params.id+"?token="+req.cookies.token)
    .then(data=>{
      res.status(200).jsonp({token:req.level,noticia:data.data})
    })
    .catch(error=>{
      console.log(error)
      res.status(501).jsonp({error:error,token:req.level})
    })
})
router.put("/admin/noticias/:id",verificaNivelAdministrador,function(req,res){
  console.log(req.params.id)
  axios.put("http://"+api+":8001/api/noticias/"+req.params.id+"?token="+req.cookies.token,req.body)
    .then(data=>{
      res.status(200).jsonp({token:req.level,noticia:data.data})
    })
    .catch(error=>{
      console.log(error)
      res.status(501).jsonp({error:error,token:req.level})
    })
})





//Rota para tratar dos comentarios
router.post("/comentario/:id",verificaNivelConsumidor,function(req,res){
  var form = req.body
  form.id_user = req.username
  console.log(form)
  axios.post("http://"+api+":8001/api/recursos/comentario/"+req.params.id+"?token="+req.cookies.token,form)
      .then(data=>res.status(200).render("/recursos"))
      .catch(error=>res.status(501).render("error",{error:error,token:req.level}))
})

//Rotas para tratar dos likes
router.post("/like/:id",verificaNivelConsumidor,function(req,res){
  axios.post("http://"+api+":8001/api/recursos/like/"+req.params.id+"?token="+req.cookies.token,{id_user:req.username})
      .then(data => res.status(200).jsonp(data.data))
      .catch(err => res.status(510).jsonp({error:err}))
})

router.post("/dislike/:id",verificaNivelConsumidor,function(req,res){
  axios.post("http://"+api+":8001/api/recursos/dislike/"+req.params.id+"?token="+req.cookies.token,{id_user:req.username})
      .then(data => res.status(200).jsonp(data.data))
      .catch(err => res.status(511).jsonp({error:err}))
})

router.delete("/like/:id",verificaNivelConsumidor,function(req,res){
  console.log(req.username)
  axios.delete("http://"+api+":8001/api/recursos/like/"+req.params.id+"?token="+req.cookies.token,{data:{id_user:req.username}})
      .then(data => res.status(200).jsonp(data.data))
      .catch(err => res.status(512).jsonp({error:err}))
})

router.delete("/dislike/:id",verificaNivelConsumidor,function(req,res){
  axios.delete("http://"+api+":8001/api/recursos/dislike/"+req.params.id+"?token="+req.cookies.token,{data:{id_user:req.username}})
      .then(data => res.status(200).jsonp(data.data))
      .catch(err => res.status(513).jsonp({error:err}))
})



router.get("/logout",function(req,res){
  res.cookie("token",undefined)
  res.clearCookie("token")
  res.redirect("/login")
})


module.exports = router;
