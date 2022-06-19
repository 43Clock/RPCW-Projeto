var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var cors = require("cors")

var mongo = process.env.DB || 'localhost';


var apiRouter = require('./routes/api');
var mongoose = require('mongoose');

mongoose.connect('mongodb://'+mongo+':27017/Projeto', 
      { useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        serverSelectionTimeoutMS: 5000});
  
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB...'));
db.once('open', function() {
  console.log("Conexão ao MongoDB realizada com sucesso...")
});

var app = express();

app.use(cors()) 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  var token = req.query.token
  if(token!=undefined){
    jwt.verify(token,"RPCWProjeto", (e,payload)=>{
      if(e){
        if(!(e instanceof jwt.TokenExpiredError)){
          res.status(403).jsonp({error:"Não tem permissão para aceder"})
        }
        else
          next()
      }else{
        req.level = payload.level
        req.username = payload.username
        next()
      }
    })
  }
  else{
    console.log(req.method)
    if(req.url.includes("noticias") && req.method == "GET")
      next()
    else
      res.status(403).jsonp({error:"Não tem permissão para aceder à API de dados"})
  }
})


app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).jsonp({error: err.message})
});

module.exports = app;
