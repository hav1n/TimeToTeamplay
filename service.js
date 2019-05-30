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

var authData = {
  id:'hav1n',
  pw:'allday',
  name:'호정'
}

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
  done(null, authData)
})

passport.use(new LocalStrategy(
  {
    usernameField: 'id',
    passwordField: 'pw'
  },
  function(username, password, done){
    if(username === authData.id){
      if(password === authData.pw){
        return done(null, authData)
      } else {
        return done(null, false, { message: 'Incorrect password.' })
      }
    } else {
      return done(null, false, { message: 'Incorrect id.' })
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
    response.send(template)
  })
})

app.get('/main', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var user_id = request.user.id
  fs.readdir(`./User_Data/${user_id}`, function(error, filelist){
    fs.readFile(`html/main.html`, 'utf8', function(err, body){
      body = body + HTMLS.List(filelist)
      var template = HTMLS.HTML(body,user_id)
      response.send(template)
    })
  })
})

app.get('/User_Data/:page', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var user_id = request.user.id
  var page = request.params.page
  _url = `/User_Data/${user_id}/${page}`;
  fs.readFile(`.${_url}`, 'utf8', function(err, body){
    var template = HTMLS.HTML2(body,user_id,page)
    response.send(template)
  })
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
  fs.writeFile(`User_Data/${user_id}/${title}`,available,'utf8',function(err){
    response.redirect(`/main`)
  })
})

app.get('/update/:page',function(request,response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var user_id = request.user.id
  var page = request.params.page
  fs.readFile(`html/update.html`, 'utf8', function(err, body){
    fs.readFile(`./User_Data/${user_id}/${page}`, 'utf8', function(err, body2){
      var template = HTMLS.HTML3(body,user_id,page,body2,page)
      response.send(template)
    })
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
  var old_title = post.title_old
  fs.rename(`User_Data/${user_id}/${old_title}`, `User_Data/${user_id}/${title}`, function(error){
    fs.writeFile(`User_Data/${user_id}/${title}`, available, 'utf8', function(err){
      response.redirect(`/main`)
    })
  })
})

app.get('/delete/:page', function(request, response){
  if(!authIsOwner(request, response)){
    response.redirect('/')
    return;
  }
  var user_id = request.user.id
  var page = request.params.page
  fs.unlink(`User_Data/${user_id}/${page}`, function(error){
    response.redirect(`/main`)
  })
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
