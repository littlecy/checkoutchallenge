//import AdyenCheckout from '@adyen/adyen-web';
//import '@adyen/adyen-web/dist/adyen.css';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var session = require("express-session");
var MongoStore = require("connect-mongodb-session")(session);




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// connect mongodb
mongoose.connect("mongodb+srv://nichenying:199072Ni2@cluster0.iyyre.mongodb.net/shopping?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology:true});


/*mongodb
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://nichenying:199072Ni2@cluster0.iyyre.mongodb.net/shopping?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});*/




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', exphbs({
  defaultLayout: 'layout',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(session({
  secret:'mysupersecret',
  resave:false,
  saveUninitialized:false,
  //store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {maxAge: 10 * 60 * 1000},
  paymentData:"",

}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next){
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
  res.status(err.status || 500);
  res.render('error');
});





// adyen checkout

const { v4: uuidv4 } = require('uuid');
const { Client, Config, CheckoutAPI } = require("@adyen/api-library");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config({
  path:"./.env",
});






module.exports = app;
