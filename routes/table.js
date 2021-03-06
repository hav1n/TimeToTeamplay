var express = require('express')
var router = express.Router()
var HTMLS = require('../js/HTMLS.js')
var LIB = require('../js/lib.js')
var db = require('../js/db.js')
var fs = require('fs')
var shortid = require('shortid')

router.get('/', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/TTT')
    return
  }
  var user_id = request.user.id
  var tablelist = db.get('tables').filter({ user:user_id }).value()
  var fmsg = request.flash()
  fs.readFile(`html/table.html`, 'utf8', function(err, body){
    if(fmsg.error)
    {
      body += `<script type="text/javascript">alert("${fmsg.error}");</script>`
    }
    body = body + HTMLS.tableList(tablelist)
    var template = HTMLS.HTML_main(body)
    response.send(template)
  })
/*
  if(tablelist&&tablelist.legnth){
    fs.readFile(`html/timetable.html`, 'utf8', function(err, body){
      response.send(body)
    })
  }
  else{
    response.send('create table first')
  }
*/
})

router.get('/User/:page', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/TTT')
    return
  }
  var page = request.params.page
  var db_body = db.get('tables').find({id:page}).value()
  fs.readFile(`./html/table.html`, 'utf8', function(err, body){
    var template = HTMLS.HTML_table(body,db_body.user,db_body.title,page,db_body.available)
    response.send(template)
  })
})

router.get('/create', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/TTT')
    return
  }
  var user_id = request.user.id
  fs.readFile(`./html/create.html`, 'utf8', function(err, body){
    response.send(body)
  })
})

router.post('/create_table', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/TTT')
    return
  }
  var post = request.body
  var user_id = request.user.id
  var title = post.title
  var available = []
  for(ids in post){
    if(ids == 'title' || ids == 'id'){
      continue;
    }
    available.push(ids)
  }
  var id = shortid.generate()
  console.log(id,user_id,title)
  db.get('tables').push({
    id:id,
    user:user_id,
    title:title,
    available:available
  }).write()
  response.redirect('/table')

})

router.get('/update/:page',function(request,response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/TTT')
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
    response.redirect('/TTT')
    return
  }
  var post = request.body
  var title = post.title
  var available = []
  for(ids in post){
    if(ids == 'title' || ids == 'id'){
      continue;
    }
    available.push(ids)
  }
  var id = post.id
  db.get('tables').find({id:id}).assign({
    title:title, available:available
  }).write()
  response.redirect(`/table`)
})

router.get('/delete/:page', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/TTT')
    return
  }
  var tables = db.get('tables').find({id:request.params.page}).value()
  if(tables.user !== request.user.id){
    request.flash('error', 'Not yours!')
    return response.redirect('/table')
  }
  db.get('tables').remove({id:request.params.page}).write()
  response.redirect('/table')
})

module.exports = router
