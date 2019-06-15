var express = require('express')
var router = express.Router()
var fs = require('fs')
var HTMLS = require('../js/HTMLS.js')
var LIB = require('../js/lib.js')
var db = require('../js/db.js')
var shortid = require('shortid')

router.get('/', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var user_id = request.user.id
  var recv = db.get('messages').filter({receiver:user_id}).value()
  var send = db.get('messages').filter({sender:user_id}).value()
  fs.readFile(`html/mypage.html`, 'utf8', function(err, body){
    body += `<div class="recv"><h2>RECEIVED MESSAGE</h2>`
    for(i=0;i<recv.length;i++){
      body+=`${recv[i].sender} >> ${recv[i].message} | ${recv[i].timestamp}<br>`
    }
    body += `</div><div class="send"><h2>SEND MESSAGE</h2>`
    for(i=0;i<send.length;i++){
      body+=`${send[i].receiver} << ${send[i].message} | ${send[i].timestamp}<br>`
    }
    body += `</div><div class="send_link"><br><button onclick="popup();">send new message</button></div>`
    body +=`<div><button onclick="chatpop();">Contact Admin</button></div>
    </div>
      </div>
      <div class="tails">
        Gaenodab Co. | <img src="/images/mail1.png" height="15px" width="15px" style="margin-top:5px;">
        hav1n.allday@gmail.com | Copyright 2019
      </div>
    </body>
    </html>`
    response.send(body)
  })
})

router.get('/dm', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var user_id = request.user.id
  fs.readFile('html/dm.html','utf8',function(err,body){
    var body_split = body.split('[')
    var body_send = body_split[0] + '['
    var users = db.get('users').sortBy('id').value()
    for(i=0;i<users.length;i++){
      body_send += `"${users[i].id}",`
    }
    body_send += body_split[1]
    response.send(body_send)
  })
})

router.post('/dm_send',function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var user_id = request.user.id
  var post = request.body
  var recv = post.recv
  var msg = post.message
  var id = shortid.generate()
  var timestamp = Math.floor(+ new Date() / 1000)
  var receiver = db.get('users').find({id:recv}).value()
  if(!receiver)
  {
    response.send('<script>alert("존재하지 않는 아이디입니다.");window.location="/mypage/dm";</script>')
    return
  }
  db.get('messages').push({
    id:id,
    sender:user_id,
    receiver:recv,
    message:msg,
    timestamp:String(timestamp)
  }).write()
  response.send('<script>window.opener.top.location.href="/mypage";window.close();</script>')
})

module.exports = router
