var express = require('express')
var router = express.Router()
var HTMLS = require('../js/HTMLS.js')
var LIB = require('../js/lib.js')
var db = require('../js/db.js')
var fs = require('fs')
var shortid = require('shortid')

router.get('/User/:page', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var page = request.params.page
  var body = db.get('tables').find({id:page}).value()
  var template = HTMLS.HTML_table(body.available,body.user,body.title,page)
  response.send(template)
})

router.get('/create', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var user_id = request.user.id
  fs.readFile(`./html/create.html`, 'utf8', function(err, body){
    var template = HTMLS.HTML_create('create',body)
    response.send(template)
  })
})

router.post('/create_table', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var post = request.body
  var user_id = request.user.id
  var title = post.title
  var available = post.available
  var id = shortid.generate()
  console.log(post,user_id,id)
  db.get('tables').push({
    id:id,
    user:user_id,
    title:title,
    available:available
  }).write()
  response.redirect(`/main`)
})

router.get('/update/:page',function(request,response){
  if(!LIB.authIsOwner(request, response)){
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
    var template = HTMLS.HTML_update(body,title,available,tables.id)
    response.send(template)
  })
})

router.post('/update_table',function(request,response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var post = request.body
  var user_id = request.user.id
  var title = post.title
  var available = post.available
  var id = post.id
  db.get('tables').find({id:id}).assign({
    title:title, available:available
  }).write()
  response.redirect(`/main`)
})

router.get('/delete/:page', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var tables = db.get('tables').find({id:request.params.page}).value()
  if(tables.user !== request.user.id){
    request.flash('error', 'Not yours!')
    return response.redirect('/')
  }
  db.get('tables').remove({id:request.params.page}).write()
  response.redirect('/')
})

module.exports = router
