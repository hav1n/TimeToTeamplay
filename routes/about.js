var express = require('express')
var router = express.Router()
var HTMLS = require('../js/HTMLS.js')
var LIB = require('../js/lib.js')
var fs = require('fs')

router.get('/', function(request, response){
  if(!LIB.authIsOwner(request, response)){
    response.redirect('/TTT')
    return
  }
  fs.readFile(`html/about.html`, 'utf8', function(err, body){
    if(err){
      console.log('about.html error')
    }
    else{
      var title = 'about'
      var template = HTMLS.HTML_base(title, body)
      response.send(template)

    }
  })
})

module.exports = router
