var express = require('express');
var path = require('path');
var cors = require('cors');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
const fileUpload = require('express-fileupload');

var server = require('http').createServer(app)
var io = require('socket.io')(server)
var session = require('express-session');
var index = require('./routes/index');
var users = require('./routes/users'),
    lands = require('./routes/lands');
var landsApi = require('./api/lands');
var landDbApi = require('./api/landDb');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');
app.use(fileUpload());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(session({
    secret: "fd34s@!@dfa453f3DF#$D&W",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: !true }
}));
app.use('/', index);
app.use('/users', users);
app.use('/lands', lands);
app.use('/api/lands', landsApi);
app.use('/api/landDb', landDbApi);
app.use('/api/users', require('./api/users'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //res.render('error');
});


module.exports = app;
