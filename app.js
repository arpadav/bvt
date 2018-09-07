var express = require('express'),
  path = require('path'),
  cookieParser = require('cookie-parser');

fs = require('fs');

// paths (list and tag path to be deleted once DB is set up)
initpath = 'init.json';
tagpath = 'public/js/tag.json';

//Set up mongoose connection
var mongoose = require('mongoose');
const dbname = 'modus';
var mongoDB = 'mongodb://localhost:27017/' + dbname;
// 27017 for now, MONGODB should have fix soon
// ^^this is a very recent error MONGODB put out, normally the port number '27017'
// would not be in this url. it was like beginning of july i saw this on stack exchange.
mongoose.connect(mongoDB, {useNewUrlParser: true});

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
db = mongoose.connection;

// check for DB errors
db.on('error', function(err){
	console.log(err);
});
// check DB connection
db.once('open', function(){
	console.log('Connected to MongoDB (' + dbname + ').');
});

// bring in DB models
PDFList = require('./models/pdflist');

// init function.. add anything you want to be initialized on startup
// init();

// local modules
database = require('./src/database');
init = require('./src/init');
tabula = require('./src/tabula');
// currentfile = require('./js/currentfile');

// page routing
var indexRouter = require('./routes/index');
var uploadRouter = require('./routes/upload');
var viewRouter = require('./routes/viewfile');
var tsRouter = require('./routes/tableselect');
var extractRouter = require('./routes/extract');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'user')));

// using routers
app.use('/', indexRouter);
app.use('/', uploadRouter);
app.use('/', viewRouter);
app.use('/', tsRouter);
app.use('/', extractRouter);

module.exports = app;
