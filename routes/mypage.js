var express = require('express')
var router = express.Router()
var fs = require('fs')
var HTMLS = require('../js/HTMLS.js')
var LIB = require('../js/lib.js')
var db = require('../js/db.js')
var shortid = require('shortid')
var sanitizeHtml = require('sanitize-html')

function makeTimeString(timestamp) {
  let now =+ new Date()
  now = now / 1000
  let diff = now - timestamp
  if (diff < 60 * 60) {
    return (parseInt(diff / 60)).toString() + '분 전'
  } else if (diff < 60 * 60 * 24) {
    return (parseInt(diff / 60 / 60)).toString() + '시간 전'
  } else {
    let date = new Date(timestamp)
    return date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일'
  }
}

router.get('/', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/')
    return
  }
  var user_id = request.user.id
  var recv = db.get('messages').filter({receiver:user_id}).value()
  var send = db.get('messages').filter({sender:user_id}).value()
  var name_list = []
  var message_by_name = {}
  var i = 0, j = 0
  var recv_m = recv[i], send_m = send[j]
  while (i < recv.length || j < send.length){
    if (i == recv.length){
      if(!message_by_name.hasOwnProperty(send_m.receiver)){
        message_by_name[send_m.receiver] = []
        name_list.push(send_m.receiver)
      }
      message_by_name[send_m.receiver].push(send_m);
      send_m = send[++j];
    }
    else if (j == send.length){
      if(!message_by_name.hasOwnProperty(recv_m.sender)){
        message_by_name[recv_m.sender] = []
        name_list.push(recv_m.sender);
      }
      message_by_name[recv_m.sender].push(recv_m);
      recv_m = recv[++i]
    }
    else if (recv_m.timestamp < send_m.timestamp){
      if(!message_by_name.hasOwnProperty(recv_m.sender)){
        message_by_name[recv_m.sender] = []
        name_list.push(recv_m.sender)
      }
      message_by_name[recv_m.sender].push(recv_m)
      recv_m = recv[++i]
    }
    else{
      if(!message_by_name.hasOwnProperty(send_m.receiver)){
        message_by_name[send_m.receiver] = []
        name_list.push(send_m.receiver)
      }
      message_by_name[send_m.receiver].push(send_m)
      send_m = send[++j]
    }
  }
  fs.readFile(`html/mypage.html`, 'utf8', function(err, body){
    body += '<div class="name"><h2>대화목록</h2>'

    // body += `<div class="recv" style="margin-left:10px;"><h2>RECEIVED MESSAGE</h2>`
    let name, last_m, date
    for(i=0;i<name_list.length;i++){
      name = name_list[i]
      last_m = message_by_name[name][message_by_name[name].length - 1]
      date = makeTimeString(last_m.timestamp)
      body += `<button class="chatroom">
                    <p class="desc">${name}<br>${last_m.message}
                      <span class="time">| ${date}
                      </span>
                      </p>
               </button>
              `
    }
    // body += `</div><div class="send" style="margin-left:10px;"><h2>SEND MESSAGE</h2>`
    // for(i=0;i<send.length;i++){
    //   body+=`${send[i].receiver} << ${send[i].message} | ${send[i].timestamp}<br>`
    // }
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
  var sanitize_msg = sanitizeHtml(msg)
  var id = shortid.generate()
  var timestamp = Math.floor(+ new Date() / 1000)
  var receiver = db.get('users').find({id:recv}).value()
  if(!receiver)
  {
    response.send('<script>alert("존재하지 않는 아이디입니다.");window.location="/mypage/dm";</script>')
    return
  }
  if(!sanitize_msg)
  {
    response.send('<script>alert("메시지 내용이 존재하지 않습니다.");window.location="/mypage/dm";</script>')
    return
  }
  if (user_id === recv) {
    response.send('<script>alert("본인에게 메시지를 보낼 순 없습니다.");window.location="/mypage/dm";</script>')
    return
  }
  db.get('messages').push({
    id:id,
    sender:user_id,
    receiver:recv,
    message:sanitize_msg,
    timestamp:String(timestamp)
  }).write()
  response.send('<script>window.opener.top.location.href="/mypage";window.close();</script>')
})

module.exports = router
