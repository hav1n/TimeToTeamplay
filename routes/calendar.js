var express = require('express')
var router = express.Router()
var fs = require('fs')
var LIB = require('../js/lib.js')

router.get('/', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/TTT')
    return
  }
  fs.readFile(`html/calendar.html`, 'utf8', function(err, body){
    response.send(body)
  })
})

module.exports = router
