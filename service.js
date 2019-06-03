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

var num = 0
app.use(function (request, response, next) {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress
    var method = request.method
    var url = request.url

    console.log((++num) + ". IP " + ip + " " + method + " " + url)
    next()
})

app.use(express.static('public'))
app.use('/table', tableRouter)
app.use('/event', eventRouter)
app.use('/auth', authRouter)

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

app.get('/about', function(request, response){
  fs.readFile(`./html/about.html`, 'utf8', function(err, body){
    var title = 'about'
    var template = HTMLS.HTML_base(title, body)
    response.send(template)
  })
  _url='/html/about.html'
})

app.get('/main', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var user_id = request.user.id
  var tablelist = db.get('tables').filter({ user:user_id }).value()
  var eventlist = db.get('events').value()
  var fmsg = request.flash()
  fs.readFile(`html/main.html`, 'utf8', function(err, body){
    if(fmsg.error)
    {
      body += `<script type="text/javascript">alert("${fmsg.error}");</script>`
    }
    body = body + HTMLS.tableList(tablelist)
    body = body + HTMLS.eventList(eventlist, user_id)
    var template = HTMLS.HTML_main(body,user_id)
    response.send(template)
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
