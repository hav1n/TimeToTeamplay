var express = require('express')
var router = express.Router()
var fs = require('fs')

router.get('/', function(request, response){
  fs.readFile(`html/mypage.html`, 'utf8', function(err, body){
    response.send(body)
  })
})

module.exports = router
