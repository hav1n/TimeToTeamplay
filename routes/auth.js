var express = require('express')
var router = express.Router()
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var fs = require('fs')
var HTMLS = require('../js/HTMLS.js')
var LIB = require('../js/lib.js')
var db = require('../js/db.js')
var bcrypt = require('bcrypt')
var cookie = require('cookie')
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var shortid = require('shortid')

router.use(passport.initialize())
router.use(passport.session())

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

router.get('/logout', function (request, response) {
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  request.logout()
  request.session.save(function(err){
    response.redirect('/')
  })
})

router.post('/login_process'
  ,passport.authenticate('local', {
    successRedirect: '/main',
    failureRedirect: '/',
    failureFlash: true
}))

router.get('/register',function(request,response){
  fs.readFile(`./html/register.html`, 'utf8', function(err, body){
    var title = 'register'
    var template = HTMLS.HTML_base(title, body)
    var fmsg = request.flash()
    if(fmsg.error)
    {
      template += `<script type="text/javascript">alert("${fmsg.error}");</script>`
    }
    response.send(template)
  })
})

router.post('/register_process',function(request, response){
  var post = request.body
  var user_id = post.id
  var user_pw = post.pw
  var user_pw_v = post.pw2
  var user_name = post.name
  if(user_pw_v !== user_pw){
    request.flash('error','Password are not same!')
    response.redirect('/auth/register')
  } else if(db.get('users').find({ id:user_id }).value()){
    request.flash('error','id is already exist')
    response.redirect('/auth/register')
  } else {
    bcrypt.hash(user_pw, 10, function (err, hash) {
      var user = {
        id:user_id,
        pw:hash,
        name:user_name
      }
      db.get('users').push(user).write()
      request.login(user, function (err) {
        return response.redirect('/')
      })
    })
  }
})

router.get('/find',function(request, response){
  fs.readFile('./html/find.html','utf8',function(err,body){
    var title = 'find'
    var template = HTMLS.HTML_base(title,body)
    var fmsg = request.flash()
    if(fmsg.error)
    {
      template += `<script type="text/javascript">alert("${fmsg.error}");</script>`
    }
    response.send(template)
  })
})

router.post('/find_process',function(request, response){
  var post = request.body
  var user_id = post.id
  var user_name = post.name
  var user_pw = post.pw
  var user_pw_v = post.pw2
  var user = db.get('users').find({id:user_id, name:user_name}).value()
  if(user_pw_v !== user_pw){
    request.flash('error','Password are not same!')
    response.redirect('/auth/find')
  } else if(!user){
    request.flash('error','Wrong user info')
    response.redirect('/auth/find')
  } else {
    bcrypt.hash(user_pw, 10, function (err, hash) {
      db.get('users').find({id:user_id, name:user_name}).assign({pw:hash}).write()
      response.redirect('/')
    })
  }
})

module.exports = router
