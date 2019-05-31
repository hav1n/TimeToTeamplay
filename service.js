const express = require('express')
const app = express()
var args = process.argv
var fs = require('fs')
var HTMLS = require('./js/HTMLS.js')
var qs = require('querystring')
var bodyParser = require('body-parser')
var compression = require('compression')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var cookie = require('cookie')
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash')
var shortid = require('shortid')
var bcrypt = require('bcrypt')
/*
var sqlite3 = require('sqlite3').verbose();
 db = new sqlite3.Database('./db/TTT.db', (err) => {
  if (err) {
    console.error(err.message)
  }
  console.log('Connected to the TTT database.')
})
*/ // sqlite3

var low = require('lowdb')
var FileSync = require('lowdb/adapters/FileSync')
var adapter = new FileSync('db.json')
var db = low(adapter)
db.defaults({users:[], tables:[], events:[]}).write()
// lowdb

app.use(express.static('public'))
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

passport.serializeUser(function(user, done) {
  console.log('Logined :', user.id)
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  var user = db.get('users').find({ id:id }).value()
  done(null, user)
})

passport.use(new LocalStrategy(
  {
    usernameField: 'id',
    passwordField: 'pw'
  },
  function(id, pw, done){
    var user = db.get('users').find({ id:id }).value()
    if(user){
      bcrypt.compare(pw, user.pw, function(err,result){
        if(result){
          return done(null, user)
        } else {
          return done(null, false, { message: 'Password is not correct.' })
        }
      })
    } else {
      return done(null, false, { message: 'There is no ID exist.' })
    }
  }
))

function authIsOwner(request, response){
  return request.user
}

var num = 0;
app.use(function (request, response, next) {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress
    var method = request.method
    var url = request.url

    console.log((++num) + ". IP " + ip + " " + method + " " + url)
    next()
})

app.get('/', function(request, response){
  if(authIsOwner(request, response)){
    response.redirect('/main')
    return;
  }
  fs.readFile(`./html/login.html`, 'utf8', function(err, body){
    var title = 'login'
    var template = HTMLS.HTML_login(title, body)
    var fmsg = request.flash()
    if(fmsg.error)
    {
      template += `<script type="text/javascript">alert("${fmsg.error}");</script>`
    }
    response.send(template)
  })
})

app.get('/logout', function (request, response) {
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  request.logout()
  request.session.save(function(err){
    response.redirect('/')
  })
})

app.post('/login_process'
  ,passport.authenticate('local', {
    successRedirect: '/main',
    failureRedirect: '/',
    failureFlash: true
}))

app.get('/about', function(request, response){
  fs.readFile(`./html/about.html`, 'utf8', function(err, body){
    var title = 'about'
    var template = HTMLS.HTML_about(title, body)
    response.send(template)
  })
  _url='/html/about.html'
})

app.get('/register',function(request,response){
  fs.readFile(`./html/register.html`, 'utf8', function(err, body){
    var title = 'register'
    var template = HTMLS.HTML_about(title, body)
    var fmsg = request.flash()
    if(fmsg.error)
    {
      template += `<script type="text/javascript">alert("${fmsg.error}");</script>`
    }
    response.send(template)
  })
})

app.post('/register_process',function(request, response){
  var post = request.body;
  var user_id = post.id;
  var user_pw = post.pw;
  var user_pw_v = post.pw2
  var user_name = post.name;
  if(user_pw_v !== user_pw){
    request.flash('error','Password are not same!');
    response.redirect('/register');
  } else if(db.get('users').find({ id:user_id }).value()){
    request.flash('error','id is already exist');
    response.redirect('/register');
  } else {
    bcrypt.hash(user_pw, 10, function (err, hash) {
      var user = {
        id:user_id,
        pw:hash,
        name:user_name
      };
      db.get('users').push(user).write();
      request.login(user, function (err) {
        console.log('redirect');
        return response.redirect('/');
      })
    });
  }
})

app.get('/main', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
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
    var template = HTMLS.HTML(body,user_id)
    response.send(template)
  })
})

app.get('/User/:page', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var page = request.params.page
  var body = db.get('tables').find({id:page}).value()
  var template = HTMLS.HTML2(body.available,body.user,body.title,page)
  response.send(template)
})

app.get('/Event/:page', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var page = request.params.page
  var body = db.get('events').find({id:page}).value()
  var template = HTMLS.HTML4(body.part,body.owner,body.title,page)
  response.send(template)
})

app.get('/create', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var user_id = request.user.id
  fs.readFile(`./html/create.html`, 'utf8', function(err, body){
    var template = HTMLS.HTML(body,user_id);
    response.send(template);
  });
})

app.post('/create_table', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var post = request.body
  var user_id = request.user.id
  var title = post.title
  var available = post.available
  var id = shortid.generate()
  db.get('tables').push({
    id:id,
    user:user_id,
    title:title,
    available:available
  }).write()
  response.redirect(`/main`)
})

app.get('/update/:page',function(request,response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var tables = db.get('tables').find({id:request.params.page}).value()
  if(tables.user !== request.user.id){
    request.flash('error', 'Not yours!')
    return response.redirect('/')
  }
  var title = tables.title
  var available = tables.available
  var user_id = request.user.id
  var page = request.params.page
  fs.readFile(`html/update.html`, 'utf8', function(err, body){
    var template = HTMLS.HTML3(body,title,available,tables.id)
    response.send(template)
  })
})

app.post('/update_table',function(request,response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var post = request.body
  var user_id = request.user.id
  var title = post.title
  var available = post.available
  var id = post.id
  db.get('tables').find({id:id}).assign({
    title:title, available:available
  }).write();
  response.redirect(`/main`)
})

app.get('/delete/:page', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var tables = db.get('tables').find({id:request.params.page}).value()
  if(tables.user !== request.user.id){
    request.flash('error', 'Not yours!')
    return response.redirect('/')
  }
  db.get('tables').remove({id:request.params.page}).write()
  response.redirect('/')
})

app.get('/make', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var user_id = request.user.id
  fs.readFile(`./html/make.html`, 'utf8', function(err, body){
    var template = HTMLS.HTML(body,user_id);
    response.send(template);
  });
})

app.post('/make_event',function(request, response){
  var post = request.body
  var owner = request.user.id
  var title = post.title
  var id = shortid.generate()
  var part = [owner]
  db.get('events').push({
    id:id,
    owner:owner,
    title:title,
    part:part
  }).write()
  response.redirect(`/main`)
})

app.get('/join',function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var user_id = request.user.id
  fs.readFile(`./html/join.html`, 'utf8', function(err, body){
    var template = HTMLS.HTML(body,user_id);
    response.send(template);
  });
})

app.post('/join_event',function(request, response){
  var post = request.body
  var id = post.id
  var events = db.get('events').find({id:id}).value()
  if(!events){
    request.flash('error', 'Wrong ID!')
    return response.redirect('/')
  }
  /*
  if(events.part.includes())
  var owner = request.user.id
  var title = post.title
  var id = shortid.generate()
  var part = [owner]
  db.get('events').push({
    id:id,
    owner:owner,
    title:title,
    part:part
  }).write()
  */
  response.redirect(`/main`)
})

app.get('/admin', function(request, response){
  response.send('nothing')
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
