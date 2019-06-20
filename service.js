var express = require('express')
var app = express()
var args = process.argv
var fs = require('fs')
var HTMLS = require('./js/HTMLS.js')
var LIB = require('./js/lib.js')
var db = require('./js/db.js')
var favicon = require('serve-favicon')
var path = require('path')
var bodyParser = require('body-parser')
var compression = require('compression')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var cookie = require('cookie')
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash')
var tableRouter = require('./routes/table.js')
var eventRouter = require('./routes/event.js')
var authRouter = require('./routes/auth.js')
var calendarRouter = require('./routes/calendar.js')
var pageRouter = require('./routes/mypage.js')
var aboutRouter = require('./routes/about.js')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression())
app.use(session({
  secret: 'here to password for session',
  resave: false,
  saveUninitialized: true,
  store:new FileStore()
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')))

function addZero(data){
return (data<10) ? "0"+data : data;
}

app.use(function (request, response, next) {
  var timeInMs = Date.now()
  var date = new Date(timeInMs)

  var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress
  var method = request.method
  var url = request.url

  console.log(`${date.getFullYear()}/${addZero(date.getMonth()+1)}/${addZero(date.getDate())} ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())} ${ip} ${method} ${url}`)
  next()
})

app.use(express.static('public'))
app.use('/node_modules', express.static(path.join(__dirname,'/node_modules')))
app.use('/table', tableRouter)
app.use('/event', eventRouter)
app.use('/auth', authRouter)
app.use('/calendar', calendarRouter)
app.use('/mypage', pageRouter)
app.use('/about', aboutRouter)

app.get('/', function(request, response){
  if(LIB.authIsOwner(request, response)){
    response.redirect('/main')
    return
  }
  fs.readFile(`./html/login.html`, 'utf8', function(err, body){
    var title = 'login'
    var template = HTMLS.HTML_base(title, body)
    var fmsg = request.flash()
    if(fmsg.error)
    {
      template += `<script type="text/javascript">alert("${fmsg.error}");</script>`
    }
    response.send(template)
  })
})

app.get('/main', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  fs.readFile(`./html/index.html`, 'utf8', function(err, body){
    response.send(body)
  })
})

app.use(function(request, response, next) {
  response.status(404).send('<h1>404 not found</h1>')
})

if(args[2]!=undefined&&args[2]==='80')
{
  app.listen(80, () => console.log('[+]App Listening on port 80'))
}
else {
  app.listen(8000, () => console.log('[+]App Listening on port 8000'))
}
