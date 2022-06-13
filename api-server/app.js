var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
var cors = require("cors")
var cors = require("cors")


var apiRouter = require('./routes/api');
var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Projeto', 
      { useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000});
  
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB...'));
db.once('open', function() {
  console.log("Conexão ao MongoDB realizada com sucesso...")
});

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var cors = require("cors")
app.use(cors()) 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Verifica se o pedido veio com o token de acesso
// app.use(function(req, res, next){
//   var myToken = req.query.token || req.body.token
//   if(myToken){
//     jwt.verify(myToken, "DAW2020", function(e, payload){
//       if(e){
//         res.status(401).jsonp({error: e})
//       }
//       else{
//         req.level = payload.level
//         next()
//       }
//     })
//   }
//   else{
//     res.status(401).jsonp({error: "Token inexistente!"})
//   }
// })

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
