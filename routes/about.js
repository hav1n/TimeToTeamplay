var express = require('express')
var router = express.Router()
var HTMLS = require('../js/HTMLS.js')
var fs = require('fs')

router.get('/', function(request, response){
  fs.readFile(`html/about.html`, 'utf8', function(err, body){
    if(err){
      console.log('err')
    }
    else{
      fs.readFile(`developer.json`, 'utf8', function(err, filecontents){
        if(err){
          console.log('err')
        }
        else{
          var title = 'about'
          var template = HTMLS.HTML_base(title, body)
          response.send(template)
        }
      })
    }
  })
})

module.exports = router
