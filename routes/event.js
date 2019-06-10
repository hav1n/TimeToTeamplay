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
  var events = db.get('events').find({id:page}).value()
  var table = db.get('tables').filter({user:request.user.id}).value()
  var select = `<form action="/event/update/${page}" method="post">
  <select name="table">
    <option value="">시간표 선택</option>`
  var i=0
  var group_ab = {}
  if(table!=undefined){
    while(i < table.length){
      select += `<option value="${table[i].id}">${table[i].title}</option>`
      i = i + 1
    }
  }
  select += `<input type="submit" value="변경" class="bar"></form>`
  i=0
  select += `<div class="tables">`
  while(i < events.part.length){
    table = db.get('tables').find({id:events.table[i]}).value()
    if(table){
      select += `<div><h2>${events.part[i]}'s timeline : ${table.title}</h2>`
      select += `
      <script type="text/javascript">
      var available="${table.available}";
      var ids=available.split(',');
      </script>
      `
      var body = fs.readFileSync(`./html/table.html`, 'utf8')
      select += body
      select += `</div>`
      for(ids in table.available)
      {
        now_id = table.available[ids]
        if(group_ab[now_id]){
          group_ab[now_id]++
        }
        else{
          group_ab[now_id]=1
        }
      }
    }
    else{
      select += `<div><h2>${events.part[i]}'s timeline :<br> NOT SELECTED</h2></div>`
    }
    i = i + 1
  }
  var group_available=JSON.stringify(group_ab);
  /*for(ids in group_ab){
    group_available += ids+','
  }*/
  select += `<div class="group"><div class="group_title"><h2>Group's timeline :</h2></div>`
  select += `
  <script type="text/javascript">
  var group_available=${group_available};
  </script>`
  select += `<div class="group_table">`
  body = fs.readFileSync('./html/event.html','utf8')
  select += body
  select += `</div>`
  select += `
  <div class="color" style="grid-template-columns: 65px repeat(${events.part.length+1}, auto) 90px;">
    <div id="available">available</div>`
  for(i=0;i<events.part.length+1;i++)
  {
    select+=`<div class="spectrum" id="sp${i}"></div>`
  }
  select+=  `<div id="not_available">not available</div>
  </div>
  </div>
  </div>`
  var template = HTMLS.HTML_event(events.part,events.owner,events.title,page,select,events.part.length)
  response.send(template)
})

router.get('/make', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var user_id = request.user.id
  fs.readFile(`./html/make.html`, 'utf8', function(err, body){
    var template = HTMLS.HTML_base('make',body)
    response.send(template)
  })
})

router.post('/make_event',function(request, response){
  var post = request.body
  var owner = request.user.id
  var title = post.title
  var id = shortid.generate()
  var part = [owner]
  var table = ['0']
  db.get('events').push({
    id:id,
    owner:owner,
    title:title,
    part:part,
    table:table
  }).write()
  response.redirect(`/main`)
})

router.get('/join',function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var user_id = request.user.id
  fs.readFile(`./html/join.html`, 'utf8', function(err, body){
    var template = HTMLS.HTML_base('join',body)
    response.send(template)
  })
})

router.post('/join_event',function(request, response){
  var post = request.body
  var id = post.id
  var events = db.get('events').find({id:id}).value()
  if(!events){
    request.flash('error', 'Wrong ID!')
    return response.redirect('/')
  }
  if(events.part.includes(request.user.id)){
    request.falsh('error', 'Already participated')
    return response.redirect('/')
  }
  events.part.push(request.user.id)
  events.table.push("0")
  db.get('events').find({id:id}).assign({
    part:events.part,table:events.table
  }).write()
  response.redirect(`/main`)
})

router.post('/update/:page',function(request, response){
  var eid = request.params.page
  var post = request.body
  var tid = post.table
  var events = db.get('events').find({id:eid}).value()
  var i = 0
  while(i < events.part.length){
    if(events.part[i] === request.user.id){
      events.table[i] = tid
      break
    }
    i = i + 1
  }
  db.get('events').find({id:eid}).assign({
    table:events.table
  }).write()
  response.redirect(`/event/User/${eid}`)
})

router.get('/delete/:page',function(request,response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var events = db.get('events').find({id:request.params.page}).value()
  if(events.owner !== request.user.id){
    request.flash('error', 'You are not owner!')
    return response.redirect('/')
  }
  db.get('events').remove({id:request.params.page}).write()
  response.redirect('/')
})

module.exports = router
