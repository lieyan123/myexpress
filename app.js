var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');//对body-parser进行配置
//配置路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var storeRouter = require('./routes/store');
var session = require('express-session');
process.on('unhandledRejection', rej => console.warn('全局捕获Rejection', rej));
var app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', "Authorization,Origin,Accept, X-Requested-With,Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method == 'OPTIONS') {
    res.send(200); /让options请求快速返回/
  }
  else {
    next();
  }
})

app.use(cookieParser('likeshan'));
app.use(session({
  secret:'passwd',
  resave: true, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  cookie: { maxAge: 1000 * 60 * 60 * 24  ,
            secure: false }
}));

app.all('/*',function (err,req, res, next) {
  if(err){
    console.log("Error happens",err.stack);
    res.send("内部错误")
  }
  if (req.session.user&&req.headers.authorization&&req.session.user.name==req.headers.authorization) {
    next();
  }
  else {
    if (req.url == "/login" || req.url.indexOf("/gettoken") != -1) {
      next();//如果请求的地址是登录则通过，进行下一个请求
    }
    else {
      res.json({ requestIntercept: 1 ,message:"非法访问，请从登陆界面登陆"})
    }
  }
})




// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/store', storeRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
